import { NextFunction, Request, Response } from "express";
import { InstitutePlan, InstituteStatus, Role, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  generateTokenId,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { env } from "../config/env";
import { resetAccountBackoff } from "../middleware/rateLimit";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

async function issueTokens(userId: string, instituteId: string | null, role: Role) {
  const tokenId = generateTokenId();
  const rawRefresh = signRefreshToken(userId, tokenId);

  await prisma.refreshToken.create({
    data: {
      userId,
      instituteId,
      tokenHash: hashToken(rawRefresh),
      expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000),
    },
  });

  return {
    accessToken: signAccessToken({ sub: userId, role, instituteId }),
    refreshToken: rawRefresh,
  };
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: { select: { id: true } },
        teacherProfile: { select: { id: true } },
        institute: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.forbidden("Account is not active. Please contact your administrator.");
    }

    if (user.institute && user.institute.status === "SUSPENDED") {
      throw ApiError.forbidden("Your institute is suspended. Please contact support.");
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    resetAccountBackoff("auth", user.email.toLowerCase());

    const tokens = await issueTokens(user.id, user.instituteId, user.role);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          instituteId: user.instituteId,
          institute: user.institute
            ? { id: user.institute.id, name: user.institute.name, slug: user.institute.slug }
            : null,
          studentProfileId: user.studentProfile?.id ?? null,
          teacherProfileId: user.teacherProfile?.id ?? null,
        },
        ...tokens,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function registerInstitute(req: Request, res: Response, next: NextFunction) {
  try {
    const { instituteName, slug, adminName, adminEmail, adminPassword } = req.body;

    const existingSlug = await prisma.institute.findUnique({ where: { slug } });
    if (existingSlug) throw ApiError.conflict("Institute slug already taken");

    const existingUser = await prisma.user.findFirst({ where: { email: adminEmail.toLowerCase() } });
    if (existingUser) throw ApiError.conflict("An account with this email already exists");

    const institute = await prisma.$transaction(async (tx) => {
      const created = await tx.institute.create({
        data: {
          name: instituteName,
          slug,
          contactEmail: adminEmail.toLowerCase(),
          plan: InstitutePlan.FREE,
          status: InstituteStatus.TRIAL,
          academicYear: new Date().getFullYear().toString(),
        },
      });

      await tx.user.create({
        data: {
          email: adminEmail.toLowerCase(),
          name: adminName,
          passwordHash: await hashPassword(adminPassword),
          role: Role.INSTITUTE_ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: false,
          instituteId: created.id,
        },
      });

      return created;
    });

    res.status(201).json({
      success: true,
      data: { instituteId: institute.id, slug: institute.slug },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken;
    if (!token) throw ApiError.unauthorized("Missing refresh token");

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    if (payload.type !== "refresh") throw ApiError.unauthorized("Invalid token type");

    const tokenHash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized("Refresh token has been revoked or expired");
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw ApiError.unauthorized("User no longer exists");
    if (user.status !== UserStatus.ACTIVE) throw ApiError.forbidden("Account is not active");

    // Token rotation
    if (env.REFRESH_TOKEN_ROTATION) {
      const newTokenId = generateTokenId();
      const newRawRefresh = signRefreshToken(user.id, newTokenId);
      const newHash = hashToken(newRawRefresh);

      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revokedAt: new Date(), replacedByTokenHash: newHash },
        }),
        prisma.refreshToken.create({
          data: {
            userId: user.id,
            instituteId: user.instituteId,
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000),
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          accessToken: signAccessToken({
            sub: user.id,
            role: user.role,
            instituteId: user.instituteId,
          }),
          refreshToken: newRawRefresh,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        accessToken: signAccessToken({
          sub: user.id,
          role: user.role,
          instituteId: user.instituteId,
        }),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken;
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });

    // Always return success to avoid user enumeration
    if (!user) {
      return res.status(200).json({ success: true, data: { message: "If the account exists, a reset link has been sent." } });
    }

    // JWT-based reset token (purpose-bound). In production, email via Resend.
    const resetToken = signAccessToken({
      sub: user.id,
      role: user.role,
      instituteId: user.instituteId,
    });

    if (env.NODE_ENV === "production" && env.RESEND_API_KEY) {
      // TODO: wire Resend email delivery
      console.log("Reset email delivery not yet wired; would email the reset link.");
    }

    res.status(200).json({
      success: true,
      data: {
        message: "If the account exists, a reset link has been sent.",
        ...(env.NODE_ENV !== "production" && { resetToken }),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized("Invalid or expired reset token");
    }

    if (payload.type !== "access") throw ApiError.unauthorized("Invalid token type");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw ApiError.unauthorized("User no longer exists");

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

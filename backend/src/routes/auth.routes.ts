import { Request, Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import {
  authenticatedRateLimit,
  authRateLimit,
  publicRateLimit,
} from "../middleware/rateLimit";
import { authenticate, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";
import {
  forgotPassword,
  login,
  logout,
  refresh,
  registerInstitute,
  resetPassword,
} from "../controllers/auth.controller";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8),
});

const registerSchema = z.object({
  instituteName: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  adminName: z.string().min(2).max(120),
  adminEmail: z.string().email().max(254),
  adminPassword: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(254),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8).max(128),
});

function accountEmail(req: Request): string | null {
  const body = req.body as Record<string, unknown>;
  const raw = typeof body.email === "string" ? body.email : typeof body.adminEmail === "string" ? body.adminEmail : null;
  return raw ? raw.toLowerCase() : null;
}

function accountResetToken(req: Request): string | null {
  const token = (req.body as { token?: unknown }).token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

const router = Router();

router.use(publicRateLimit);

router.post("/login", authRateLimit({ accountKey: accountEmail, backoff: true }), validate(loginSchema), login);
router.post("/register", authRateLimit({ accountKey: accountEmail, backoff: true }), validate(registerSchema), registerInstitute);
router.post("/refresh", authRateLimit(), validate(refreshSchema), refresh);
router.post("/logout", authRateLimit(), validate(refreshSchema), logout);
router.post("/forgot-password", authRateLimit({ accountKey: accountEmail, backoff: true }), validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authRateLimit({ accountKey: accountResetToken }), validate(resetPasswordSchema), resetPassword);

// Protected introspection route used by the frontend auth gate
router.get("/me", authenticate, authenticatedRateLimit, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        institute: { select: { id: true, name: true, slug: true } },
        studentProfile: { select: { id: true } },
        teacherProfile: { select: { id: true } },
      },
    });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

export const authRouter = router;

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { strictRateLimit } from "../middleware/rateLimit";
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
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  instituteName: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  adminName: z.string().min(2).max(120),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

const router = Router();

router.post("/login", strictRateLimit, validate(loginSchema), login);
router.post("/register", strictRateLimit, validate(registerSchema), registerInstitute);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);
router.post("/forgot-password", strictRateLimit, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// Protected introspection route used by the frontend auth gate
router.get("/me", authenticate, async (req, res, next) => {
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

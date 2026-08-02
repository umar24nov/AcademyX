import { Router } from "express";
import { z } from "zod";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";

const router = Router();

router.use(authenticate, requireInstitute);

const teacherCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  employeeId: z.string().min(1),
  department: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional(),
});

router.get("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const teachers = await prisma.teacherProfile.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, status: true } },
        _count: { select: { courses: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: { teachers } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN), validate(teacherCreateSchema), async (req, res, next) => {
  try {
    const { name, email, password, ...profile } = req.body;

    const existing = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
    if (existing) throw ApiError.conflict("A user with this email already exists");

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: await hashPassword(password ?? "AcademyX@12345"),
          role: Role.TEACHER,
          status: UserStatus.ACTIVE,
          instituteId: req.user!.instituteId!,
        },
      });
      const profileRow = await tx.teacherProfile.create({
        data: { userId: user.id, instituteId: req.user!.instituteId!, ...profile },
      });
      return { user, profile: profileRow };
    });

    res.status(201).json({ success: true, data: { teacher } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), async (req, res, next) => {
  try {
    const teacher = await prisma.teacherProfile.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
      include: { user: true, courses: true },
    });
    if (!teacher) throw ApiError.notFound("Teacher not found");
    res.json({ success: true, data: { teacher } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.INSTITUTE_ADMIN), validate(teacherCreateSchema.partial()), async (req, res, next) => {
  try {
    const { name, email, ...profile } = req.body;
    const existing = await prisma.teacherProfile.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Teacher not found");

    if (name || email) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { ...(name && { name }), ...(email && { email: email.toLowerCase() }) },
      });
    }
    const teacher = await prisma.teacherProfile.update({
      where: { id: existing.id },
      data: profile,
    });
    res.json({ success: true, data: { teacher } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole(Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const existing = await prisma.teacherProfile.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Teacher not found");
    await prisma.user.update({ where: { id: existing.userId }, data: { status: UserStatus.SUSPENDED } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export const teachersRouter = router;

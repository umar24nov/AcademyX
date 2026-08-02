import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate);

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
  branding: z.record(z.unknown()).optional(),
  gradingSystem: z.string().optional(),
  passingMarks: z.number().int().min(0).max(100).optional(),
  attendanceThreshold: z.number().int().min(0).max(100).optional(),
  academicYear: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    if (req.user!.role === Role.SUPER_ADMIN) {
      const institutes = await prisma.institute.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { users: true, courses: true, batches: true } } },
      });
      return res.json({
        success: true,
        data: { institutes: institutes.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          plan: i.plan,
          status: i.status,
          owner: i.contactEmail,
          students: i._count.users,
          courses: i._count.courses,
          mrr: 0,
          initials: i.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
        })) },
      });
    }

    if (!req.user!.instituteId) throw ApiError.forbidden();
    const institute = await prisma.institute.findUnique({
      where: { id: req.user!.instituteId },
    });
    res.json({ success: true, data: { institute } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireRole(Role.SUPER_ADMIN, Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const id = req.params.id;
    const allow = req.user!.role === Role.SUPER_ADMIN || req.user!.instituteId === id;
    if (!allow) throw ApiError.forbidden();

    const institute = await prisma.institute.findUnique({ where: { id } });
    if (!institute) throw ApiError.notFound("Institute not found");
    res.json({ success: true, data: { institute } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.SUPER_ADMIN, Role.INSTITUTE_ADMIN), validate(updateSchema), async (req, res, next) => {
  try {
    const id = req.params.id;
    const allow = req.user!.role === Role.SUPER_ADMIN || req.user!.instituteId === id;
    if (!allow) throw ApiError.forbidden();

    const institute = await prisma.institute.update({ where: { id }, data: req.body });
    res.json({ success: true, data: { institute } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", requireRole(Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL"]) }).parse(req.body);
    const institute = await prisma.institute.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: { institute } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/analytics", requireRole(Role.SUPER_ADMIN, Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const id = req.params.id;
    const allow = req.user!.role === Role.SUPER_ADMIN || req.user!.instituteId === id;
    if (!allow) throw ApiError.forbidden();

    const [institute, users, courses, batches] = await Promise.all([
      prisma.institute.findUnique({ where: { id } }),
      prisma.user.count({ where: { instituteId: id } }),
      prisma.course.count({ where: { instituteId: id } }),
      prisma.batch.count({ where: { instituteId: id } }),
    ]);

    const students = await prisma.user.count({
      where: { instituteId: id, role: Role.STUDENT },
    });
    const teachers = await prisma.user.count({
      where: { instituteId: id, role: Role.TEACHER },
    });

    res.json({
      success: true,
      data: {
        institute,
        stats: { users, students, teachers, courses, batches },
      },
    });
  } catch (err) {
    next(err);
  }
});

export const institutesRouter = router;

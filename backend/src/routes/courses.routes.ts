import { Router } from "express";
import { z } from "zod";
import { CourseStatus, ModuleType, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

function tenantWhere(req: { user?: { instituteId?: string | null } }) {
  return { instituteId: req.user!.instituteId! };
}

const courseCreateSchema = z.object({
  title: z.string().min(2),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  credits: z.number().int().optional(),
  thumbnailUrl: z.string().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
});

const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(ModuleType).optional(),
  duration: z.string().optional(),
  lessons: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        duration: z.string().optional(),
      })
    )
    .optional(),
});

// List (scoped to institute; role-aware)
router.get("/", async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: tenantWhere(req),
      include: {
        _count: { select: { modules: true, batches: true } },
        createdBy: { select: { user: { select: { name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({
      success: true,
      data: { courses: courses.map((c) => ({ ...c, createdByName: c.createdBy?.user?.name })) },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const course = await prisma.course.findFirst({
      where: { ...tenantWhere(req), id: req.params.id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
        batches: true,
      },
    });
    if (!course) throw ApiError.notFound("Course not found");
    res.json({ success: true, data: { course } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(courseCreateSchema), async (req, res, next) => {
  try {
    let teacherProfile = await prisma.teacherProfile.findFirst({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
      select: { id: true },
    });
    if (!teacherProfile) {
      // Institute admins can author courses even without a dedicated teacher
      // profile — auto-create one so course ownership is always valid.
      if (req.user!.role === Role.TEACHER) {
        throw ApiError.forbidden("Only teachers and admins can create courses");
      }
      teacherProfile = await prisma.teacherProfile.create({
        data: {
          userId: req.user!.id,
          instituteId: req.user!.instituteId!,
          employeeId: `ADMIN-${req.user!.id.slice(0, 8).toUpperCase()}`,
        },
        select: { id: true },
      });
    }

    const course = await prisma.course.create({
      data: {
        ...req.body,
        instituteId: req.user!.instituteId!,
        createdById: teacherProfile.id,
        status: req.body.status ?? CourseStatus.DRAFT,
      },
    });
    res.status(201).json({ success: true, data: { course } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(courseCreateSchema.partial()), async (req, res, next) => {
  try {
    const existing = await prisma.course.findFirst({
      where: { ...tenantWhere(req), id: req.params.id },
      select: { id: true, createdById: true },
    });
    if (!existing) throw ApiError.notFound("Course not found");

    if (req.user!.role === Role.TEACHER && existing.createdById !== (await teacherProfileId(req.user!.id))) {
      throw ApiError.forbidden("You can only edit courses you created");
    }

    const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: { course } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole(Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const existing = await prisma.course.findFirst({ where: { ...tenantWhere(req), id: req.params.id } });
    if (!existing) throw ApiError.notFound("Course not found");
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// Modules
router.post("/:id/modules", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(moduleSchema), async (req, res, next) => {
  try {
    const course = await prisma.course.findFirst({ where: { ...tenantWhere(req), id: req.params.id } });
    if (!course) throw ApiError.notFound("Course not found");

    const nextOrder = await prisma.module.count({ where: { courseId: course.id } });

    const module = await prisma.module.create({
      data: {
        courseId: course.id,
        title: req.body.title,
        description: req.body.description,
        type: req.body.type ?? ModuleType.LECTURE,
        duration: req.body.duration,
        order: nextOrder,
        lessons: req.body.lessons?.length
          ? { create: req.body.lessons.map((l: { title: string }, i: number) => ({ ...l, order: i })) }
          : undefined,
      },
      include: { lessons: true },
    });

    res.status(201).json({ success: true, data: { module } });
  } catch (err) {
    next(err);
  }
});

async function teacherProfileId(userId: string) {
  const profile = await prisma.teacherProfile.findUnique({ where: { userId }, select: { id: true } });
  return profile?.id ?? null;
}

export const coursesRouter = router;

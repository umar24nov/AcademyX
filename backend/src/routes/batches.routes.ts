import { Router } from "express";
import { z } from "zod";
import { BatchStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

const batchSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  courseId: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(BatchStatus).optional(),
  capacity: z.number().int().positive().optional(),
  timetable: z.record(z.unknown()).optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: { batches } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const batch = await prisma.batch.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
      include: {
        course: true,
        students: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        enrollments: true,
        attendance: true,
        assignments: true,
        exams: true,
        liveClasses: true,
      },
    });
    if (!batch) throw ApiError.notFound("Batch not found");
    res.json({ success: true, data: { batch } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN), validate(batchSchema), async (req, res, next) => {
  try {
    const { courseId, ...rest } = req.body;
    if (courseId) {
      const course = await prisma.course.findFirst({ where: { instituteId: req.user!.instituteId!, id: courseId } });
      if (!course) throw ApiError.notFound("Course not found");
    }
    const batch = await prisma.batch.create({
      data: {
        ...rest,
        courseId: courseId ?? undefined,
        instituteId: req.user!.instituteId!,
        status: req.body.status ?? BatchStatus.UPCOMING,
      },
    });
    res.status(201).json({ success: true, data: { batch } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.INSTITUTE_ADMIN), validate(batchSchema.partial()), async (req, res, next) => {
  try {
    const existing = await prisma.batch.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Batch not found");

    const { courseId, ...rest } = req.body;
    const batch = await prisma.batch.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(courseId !== undefined ? { courseId } : {}),
      },
    });
    res.json({ success: true, data: { batch } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole(Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const existing = await prisma.batch.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Batch not found");
    await prisma.batch.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export const batchesRouter = router;

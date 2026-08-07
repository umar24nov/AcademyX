import { Router } from "express";
import { z } from "zod";
import { LiveClassStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { authenticatedRateLimit } from "../middleware/rateLimit";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute, authenticatedRateLimit);

const liveClassSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  courseId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
  startsAt: z.string().datetime(),
  durationMin: z.number().int().positive().max(1440).default(60),
  status: z.nativeEnum(LiveClassStatus).optional(),
  hmsRoomCode: z.string().max(200).optional(),
  roomId: z.string().max(200).optional(),
});

function describeStartsIn(startsAt: Date): string {
  const diff = new Date(startsAt).getTime() - Date.now();
  if (diff < 0) return "Completed";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { instituteId: req.user!.instituteId! };
    if (status === "live") where.status = LiveClassStatus.LIVE;
    if (status === "scheduled") where.status = LiveClassStatus.SCHEDULED;
    if (status === "ended") where.status = LiveClassStatus.ENDED;

    const classes = await prisma.liveClass.findMany({
      where,
      include: {
        course: { select: { title: true } },
        batch: {
          select: {
            code: true,
            name: true,
            _count: { select: { students: true } },
          },
        },
        teacher: { select: { name: true } },
      },
      orderBy: { startsAt: "desc" },
    });

    const now = Date.now();
    const liveClasses = classes.map((l) => {
      const endedByTime = new Date(l.startsAt).getTime() + l.durationMin * 60000 < now;
      const status =
        l.status === "LIVE" ? "Live" : l.status === "ENDED" || endedByTime ? "Ended" : "Scheduled";
      return {
        id: l.id,
        title: l.title,
        course: l.course?.title ?? "—",
        batch: l.batch?.code ?? l.batch?.name ?? "—",
        teacher: l.teacher?.name ?? "—",
        roomId: l.roomId,
        hmsRoomCode: l.hmsRoomCode,
        status,
        startsIn: describeStartsIn(l.startsAt),
        location: l.batch?.name ?? "Online",
        registered: l.batch?._count.students ?? 0,
        startsAt: l.startsAt,
        durationMin: l.durationMin,
        recordingUrl: l.recordingUrl,
      };
    });

    res.json({ success: true, data: { liveClasses } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const liveClass = await prisma.liveClass.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
      include: { course: true, batch: true, teacher: true },
    });
    if (!liveClass) throw ApiError.notFound("Live class not found");
    res.json({ success: true, data: { liveClass } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(liveClassSchema), async (req, res, next) => {
  try {
    const { courseId, batchId, teacherId, startsAt, ...rest } = req.body;

    if (courseId) {
      const course = await prisma.course.findFirst({ where: { instituteId: req.user!.instituteId!, id: courseId } });
      if (!course) throw ApiError.notFound("Course not found");
    }
    if (batchId) {
      const batch = await prisma.batch.findFirst({ where: { instituteId: req.user!.instituteId!, id: batchId } });
      if (!batch) throw ApiError.notFound("Batch not found");
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        ...rest,
        instituteId: req.user!.instituteId!,
        teacherId: teacherId ?? (req.user!.role === Role.TEACHER ? req.user!.id : undefined),
        courseId: courseId ?? undefined,
        batchId: batchId ?? undefined,
        startsAt: new Date(startsAt),
        status: req.body.status ?? LiveClassStatus.SCHEDULED,
      },
    });

    res.status(201).json({ success: true, data: { liveClass } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(liveClassSchema.partial()), async (req, res, next) => {
  try {
    const existing = await prisma.liveClass.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Live class not found");

    const { startsAt, ...rest } = req.body;
    const liveClass = await prisma.liveClass.update({
      where: { id: existing.id },
      data: { ...rest, ...(startsAt ? { startsAt: new Date(startsAt) } : {}) },
    });

    res.json({ success: true, data: { liveClass } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/status", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.nativeEnum(LiveClassStatus) }).parse(req.body);
    const existing = await prisma.liveClass.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Live class not found");

    const liveClass = await prisma.liveClass.update({
      where: { id: existing.id },
      data: { status },
    });
    res.json({ success: true, data: { liveClass } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole(Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const existing = await prisma.liveClass.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Live class not found");
    await prisma.liveClass.delete({ where: { id: existing.id } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export const liveClassesRouter = router;

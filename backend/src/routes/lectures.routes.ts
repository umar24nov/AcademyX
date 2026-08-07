import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { authenticatedRateLimit } from "../middleware/rateLimit";
import { ApiError } from "../utils/ApiError";
import { httpUrl, optionalHttpUrl } from "../utils/schema";

const router = Router();

router.use(authenticate, requireInstitute, authenticatedRateLimit);

const lectureSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  courseId: z.string().optional().nullable(),
  moduleId: z.string().optional().nullable(),
  videoUrl: httpUrl,
  duration: z.string().max(50).optional(),
  size: z.string().max(50).optional(),
  visibility: z.enum(["Public", "Course Wide", "Batch Only"]).default("Course Wide"),
  thumbnailUrl: optionalHttpUrl,
});

router.get("/", async (req, res, next) => {
  try {
    const lectures = await prisma.recordedLecture.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: {
        course: { select: { title: true } },
        module: { select: { title: true } },
        uploadedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        lectures: lectures.map((l) => ({
          id: l.id,
          title: l.title,
          course: l.course?.title ?? "—",
          module: l.module?.title ?? "General",
          duration: l.duration,
          size: l.size,
          visibility: l.visibility,
          uploadedBy: l.uploadedBy?.name ?? "—",
          uploadedAt: timeAgo(l.createdAt),
          videoUrl: l.videoUrl,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(lectureSchema), async (req, res, next) => {
  try {
    const { courseId, moduleId, ...rest } = req.body;
    if (courseId) {
      const course = await prisma.course.findFirst({ where: { instituteId: req.user!.instituteId!, id: courseId } });
      if (!course) throw ApiError.notFound("Course not found");
    }
    if (moduleId) {
      const module = await prisma.module.findFirst({
        where: { id: moduleId, course: { instituteId: req.user!.instituteId! } },
      });
      if (!module) throw ApiError.notFound("Module not found");
    }

    const lecture = await prisma.recordedLecture.create({
      data: {
        ...rest,
        instituteId: req.user!.instituteId!,
        uploadedById: req.user!.id,
        courseId: courseId ?? undefined,
        moduleId: moduleId ?? undefined,
      },
    });

    res.status(201).json({ success: true, data: { lecture } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), async (req, res, next) => {
  try {
    const existing = await prisma.recordedLecture.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Lecture not found");
    await prisma.recordedLecture.delete({ where: { id: existing.id } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export const lecturesRouter = router;

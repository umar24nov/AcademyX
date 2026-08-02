import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireInstitute } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireInstitute);

router.get("/overview", async (req, res, next) => {
  try {
    const instituteId = req.user!.instituteId!;

    const [attendanceGroup, batches, attempts] = await Promise.all([
      prisma.attendance.groupBy({
        by: ["batchId"],
        where: { instituteId },
        _count: { _all: true },
      }),
      prisma.batch.findMany({
        where: { instituteId },
        select: { id: true, name: true },
      }),
      prisma.examAttempt.findMany({
        where: {
          status: { in: ["submitted", "graded"] },
          exam: { instituteId },
        },
        include: {
          student: { select: { user: { select: { name: true } } } },
          exam: {
            select: {
              title: true,
              totalMarks: true,
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: 100,
      }),
    ]);

    const batchMap = new Map(batches.map((b) => [b.id, b.name]));

    const presentCounts = new Map<string, number>();
    const totalCounts = new Map<string, number>();
    for (const g of attendanceGroup) {
      if (!g.batchId) continue;
      totalCounts.set(g.batchId, g._count._all);
    }
    const presentGroups = await prisma.attendance.groupBy({
      by: ["batchId"],
      where: { instituteId, status: "PRESENT" },
      _count: { _all: true },
    });
    for (const g of presentGroups) {
      if (!g.batchId) continue;
      presentCounts.set(g.batchId, g._count._all);
    }

    const attendanceByBatch = batches.map((b) => {
      const total = totalCounts.get(b.id) ?? 0;
      const present = presentCounts.get(b.id) ?? 0;
      return {
        batch: b.name,
        rate: total ? Math.round((present / total) * 100) : 0,
      };
    });

    const examResults = attempts.map((a) => {
      const max = a.exam.totalMarks;
      const score = a.score ?? 0;
      const percentage = max ? Math.round((score / max) * 100) : 0;
      return {
        id: a.id,
        student: a.student?.user?.name ?? "Unknown",
        course: a.exam.course?.title ?? a.exam.title,
        score,
        max,
        percentage,
      };
    });

    res.json({ success: true, data: { attendanceByBatch, examResults } });
  } catch (err) {
    next(err);
  }
});

export const reportsRouter = router;

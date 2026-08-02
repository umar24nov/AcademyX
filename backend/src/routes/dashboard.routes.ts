import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireInstitute } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

router.get("/overview", async (req, res, next) => {
  try {
    const instituteId = req.user!.instituteId!;

    if (req.user!.role === Role.SUPER_ADMIN) {
      const [institutes, totalUsers, totalCourses, totalPayments] = await Promise.all([
        prisma.institute.count(),
        prisma.user.count(),
        prisma.course.count(),
        prisma.payment.findMany({ where: { status: "SUCCESS" } }),
      ]);
      const mrr = totalPayments.reduce((s, p) => s + p.amount, 0);
      return res.json({
        success: true,
        data: {
          stats: { institutes, totalUsers, totalCourses, mrr },
        },
      });
    }

    const [students, teachers, courses, batches, exams, activeAssignments, liveNow, successPayments] =
      await Promise.all([
        prisma.user.count({ where: { instituteId, role: Role.STUDENT } }),
        prisma.user.count({ where: { instituteId, role: Role.TEACHER } }),
        prisma.course.count({ where: { instituteId } }),
        prisma.batch.count({ where: { instituteId } }),
        prisma.exam.count({ where: { instituteId } }),
        prisma.assignment.count({ where: { instituteId, status: "ACTIVE" } }),
        prisma.liveClass.count({ where: { instituteId, status: "LIVE" } }),
        prisma.payment.findMany({ where: { instituteId, status: "SUCCESS" } }),
      ]);

    const revenue = successPayments.reduce((s, p) => s + p.amount, 0);

    const recentPayments = await prisma.payment.findMany({
      where: { instituteId },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const liveClasses = await prisma.liveClass.findMany({
      where: { instituteId },
      orderBy: { startsAt: "asc" },
      take: 6,
    });

    const announcements = await prisma.announcement.findMany({
      where: { instituteId },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        stats: { students, teachers, courses, batches, exams, activeAssignments, liveNow, revenue },
        recentPayments: recentPayments.map((p) => ({
          id: p.id,
          student: p.student?.user?.name,
          amount: p.amount,
          status: p.status,
          date: p.createdAt,
          purpose: p.purpose,
        })),
        liveClasses,
        announcements: announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          author: a.author?.name,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/student", async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
      select: { id: true, batchId: true },
    });
    if (!profile) throw ApiError.notFound("Student profile not found");

    const [enrollments, upcomingClasses, pendingAssignments, exams, attendanceRecords, notifications] =
      await Promise.all([
        prisma.enrollment.findMany({
          where: { studentId: profile.id },
          include: { course: true, batch: true },
        }),
        prisma.liveClass.findMany({
          where: {
            instituteId: req.user!.instituteId!,
            ...(profile.batchId ? { batchId: profile.batchId } : {}),
            status: { in: ["SCHEDULED", "LIVE"] },
          },
          orderBy: { startsAt: "asc" },
          take: 5,
        }),
        prisma.assignment.findMany({
          where: { instituteId: req.user!.instituteId!, status: "ACTIVE" },
          include: {
            course: { select: { title: true } },
            _count: { select: { submissions: { where: { studentId: profile.id } } } },
          },
          take: 8,
        }),
        prisma.exam.findMany({
          where: { instituteId: req.user!.instituteId!, status: { in: ["PUBLISHED", "SCHEDULED", "LIVE"] } },
          include: { course: { select: { title: true } }, _count: { select: { questions: true } } },
          take: 8,
        }),
        prisma.attendance.findMany({
          where: { studentId: profile.id },
          orderBy: { date: "desc" },
          take: 30,
        }),
        prisma.notification.findMany({
          where: { userId: req.user!.id, readAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    const present = attendanceRecords.filter((a) => a.status === "PRESENT").length;
    const attendanceRate = attendanceRecords.length
      ? Math.round((present / attendanceRecords.length) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        enrollments,
        upcomingClasses,
        pendingAssignments: pendingAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          course: a.course?.title,
          dueAt: a.dueAt,
          submitted: a._count.submissions > 0,
        })),
        exams: exams.map((e) => ({ id: e.id, title: e.title, course: e.course?.title, totalMarks: e.totalMarks, durationMin: e.durationMin, status: e.status })),
        attendanceRate,
        notifications,
      },
    });
  } catch (err) {
    next(err);
  }
});

export const dashboardRouter = router;

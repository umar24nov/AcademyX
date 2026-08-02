import { Router } from "express";
import { z } from "zod";
import { AttendanceStatus, Role, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";

const router = Router();

router.use(authenticate, requireInstitute);

const studentCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  rollNumber: z.string().min(1),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  phone: z.string().optional(),
  batchId: z.string().optional().nullable(),
  fee: z.number().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const students = await prisma.studentProfile.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, status: true } },
        batch: { select: { id: true, name: true, code: true } },
        enrollments: true,
        _count: { select: { attendance: true, submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { students: students.map((s) => ({ ...s, ...s.user, user: undefined })) },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(studentCreateSchema), async (req, res, next) => {
  try {
    const { name, email, password, batchId, fee, ...profile } = req.body;

    const existing = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
    if (existing) throw ApiError.conflict("A user with this email already exists");

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: await hashPassword(password ?? "AcademyX@12345"),
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          instituteId: req.user!.instituteId!,
        },
      });

      const profileRow = await tx.studentProfile.create({
        data: {
          userId: user.id,
          instituteId: req.user!.instituteId!,
          batchId: batchId ?? undefined,
          ...profile,
        },
      });

      if (batchId) {
        await tx.enrollment.create({
          data: {
            studentId: profileRow.id,
            batchId,
            fee: fee ?? undefined,
          },
        });
      }

      return { user, profile: profileRow };
    });

    res.status(201).json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const student = await prisma.studentProfile.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        batch: true,
        enrollments: { include: { course: true, batch: true } },
        attendance: true,
        submissions: { include: { assignment: true } },
      },
    });
    if (!student) throw ApiError.notFound("Student not found");
    res.json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(studentCreateSchema.partial()), async (req, res, next) => {
  try {
    const { name, email, batchId, fee, ...profile } = req.body;
    const existing = await prisma.studentProfile.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Student not found");

    const student = await prisma.$transaction(async (tx) => {
      if (name || email) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { ...(name && { name }), ...(email && { email: email.toLowerCase() }) },
        });
      }
      const updated = await tx.studentProfile.update({
        where: { id: existing.id },
        data: { ...profile, ...(batchId !== undefined ? { batchId } : {}) },
      });
      if (batchId !== undefined && fee !== undefined) {
        const enrollment = await tx.enrollment.findFirst({ where: { studentId: existing.id } });
        if (enrollment) {
          await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { batchId, fee },
          });
        } else {
          await tx.enrollment.create({
            data: { studentId: existing.id, batchId, fee },
          });
        }
      }
      return updated;
    });

    res.json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
});

// Attendance
const attendanceSchema = z.object({
  studentId: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus),
  date: z.string().datetime(),
  remark: z.string().optional(),
});

router.post("/:id/attendance", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(attendanceSchema), async (req, res, next) => {
  try {
    const student = await prisma.studentProfile.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!student) throw ApiError.notFound("Student not found");

    const date = new Date(req.body.date);
    const record = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date } },
      create: {
        instituteId: req.user!.instituteId!,
        studentId: student.id,
        batchId: student.batchId,
        status: req.body.status,
        markedById: req.user!.id,
        remark: req.body.remark,
        date,
      },
      update: { status: req.body.status, remark: req.body.remark, markedById: req.user!.id },
    });

    res.json({ success: true, data: { attendance: record } });
  } catch (err) {
    next(err);
  }
});

export const studentsRouter = router;

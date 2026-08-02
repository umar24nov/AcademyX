import { Router } from "express";
import { z } from "zod";
import { AssignmentStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

const assignmentSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  courseId: z.string().optional().nullable(),
  moduleId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  maxMarks: z.number().int().positive().optional(),
  dueAt: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(AssignmentStatus).optional(),
});

const submissionSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // If student, also include their submission status
    let mySubmissionIds = new Set<string>();
    if (req.user!.role === Role.STUDENT) {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
        select: { id: true },
      });
      if (profile) {
        const subs = await prisma.assignmentSubmission.findMany({
          where: { studentId: profile.id },
          select: { assignmentId: true, status: true, marks: true },
        });
        mySubmissionIds = new Set(subs.map((s) => s.assignmentId));
      }
    }

    res.json({ success: true, data: { assignments, mySubmissionIds: [...mySubmissionIds] } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(assignmentSchema), async (req, res, next) => {
  try {
    const { courseId, moduleId, batchId, ...rest } = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        ...rest,
        courseId: courseId ?? undefined,
        moduleId: moduleId ?? undefined,
        batchId: batchId ?? undefined,
        instituteId: req.user!.instituteId!,
        createdById: req.user!.id,
        status: rest.status ?? AssignmentStatus.ACTIVE,
        dueAt: rest.dueAt ? new Date(rest.dueAt) : undefined,
      },
    });
    res.status(201).json({ success: true, data: { assignment } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
      include: {
        course: true,
        batch: true,
        submissions: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
    });
    if (!assignment) throw ApiError.notFound("Assignment not found");
    res.json({ success: true, data: { assignment } });
  } catch (err) {
    next(err);
  }
});

// Student submission
router.post("/:id/submit", requireRole(Role.STUDENT), validate(submissionSchema), async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
      select: { id: true },
    });
    if (!profile) throw ApiError.notFound("Student profile not found");

    const existing = await prisma.assignment.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Assignment not found");

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: existing.id, studentId: profile.id } },
      create: {
        assignmentId: existing.id,
        studentId: profile.id,
        submittedById: req.user!.id,
        ...req.body,
      },
      update: { ...req.body, status: "SUBMITTED" },
    });

    res.status(201).json({ success: true, data: { submission } });
  } catch (err) {
    next(err);
  }
});

const gradeSchema = z.object({
  marks: z.number().min(0),
  feedback: z.string().optional(),
});

router.post("/:id/grade", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(gradeSchema), async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await prisma.assignmentSubmission.findFirst({
      where: { id: req.params.id },
      include: { assignment: { select: { instituteId: true } } },
    });
    if (!submission) throw ApiError.notFound("Submission not found");
    if (submission.assignment.instituteId !== req.user!.instituteId) throw ApiError.forbidden();

    const graded = await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: { marks, feedback, status: "GRADED" },
    });

    res.json({ success: true, data: { submission: graded } });
  } catch (err) {
    next(err);
  }
});

export const assignmentsRouter = router;

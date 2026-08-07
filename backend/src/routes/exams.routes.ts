import { Router } from "express";
import { z } from "zod";
import { ExamStatus, ExamType, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { authenticatedRateLimit } from "../middleware/rateLimit";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute, authenticatedRateLimit);

const questionSchema = z.object({
  text: z.string().min(1).max(2000),
  options: z.array(z.string().min(1).max(500)).min(2).max(8),
  correctOption: z.number().int().nonnegative().optional(),
  marks: z.number().int().positive().default(1),
  order: z.number().int().default(0),
  type: z.enum(["mcq", "subjective"]).default("mcq"),
});

const examCreateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(ExamType).optional(),
  courseId: z.string().optional().nullable(),
  moduleId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  durationMin: z.number().int().positive().max(1440),
  totalMarks: z.number().int().positive(),
  passMarks: z.number().int().optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  shuffleQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  questions: z.array(questionSchema).max(200).optional(),
});

const attemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number().int().optional().nullable(),
      text: z.string().optional().nullable(),
    })
  ),
});

router.get("/", async (req, res, next) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, data: { exams } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const exam = await prisma.exam.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
      include: {
        questions: { orderBy: { order: "asc" } },
        course: true,
        batch: true,
        attempts: req.user!.role === Role.STUDENT
          ? { where: { student: { userId: req.user!.id } } }
          : true,
      },
    });
    if (!exam) throw ApiError.notFound("Exam not found");

    // Hide correct answers from students until graded
    const isStaff = req.user!.role !== Role.STUDENT;
    const questions = isStaff
      ? exam.questions
      : exam.questions.map(({ correctOption, ...q }) => q);

    res.json({ success: true, data: { exam: { ...exam, questions } } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(examCreateSchema), async (req, res, next) => {
  try {
    const { questions, ...rest } = req.body;
    const exam = await prisma.exam.create({
      data: {
        ...rest,
        courseId: rest.courseId ?? undefined,
        moduleId: rest.moduleId ?? undefined,
        batchId: rest.batchId ?? undefined,
        instituteId: req.user!.instituteId!,
        createdById: req.user!.id,
        status: rest.status ?? ExamStatus.DRAFT,
        questions: questions?.length
          ? { create: questions }
          : undefined,
      },
      include: { questions: true },
    });
    res.status(201).json({ success: true, data: { exam } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), validate(examCreateSchema.partial()), async (req, res, next) => {
  try {
    const existing = await prisma.exam.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Exam not found");

    const { questions, ...rest } = req.body;
    const exam = await prisma.$transaction(async (tx) => {
      if (questions) {
        await tx.examQuestion.deleteMany({ where: { examId: existing.id } });
        await tx.examQuestion.createMany({
          data: questions.map((q: z.infer<typeof questionSchema>) => ({ ...q, examId: existing.id })),
        });
      }
      return tx.exam.update({ where: { id: existing.id }, data: rest });
    });

    res.json({ success: true, data: { exam } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/publish", requireRole(Role.INSTITUTE_ADMIN, Role.TEACHER), async (req, res, next) => {
  try {
    const existing = await prisma.exam.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!existing) throw ApiError.notFound("Exam not found");
    const exam = await prisma.exam.update({
      where: { id: existing.id },
      data: { status: ExamStatus.PUBLISHED },
    });
    res.json({ success: true, data: { exam } });
  } catch (err) {
    next(err);
  }
});

// Student attempts
router.post("/:id/attempt", requireRole(Role.STUDENT), async (req, res, next) => {
  try {
    const exam = await prisma.exam.findFirst({
      where: { instituteId: req.user!.instituteId!, id: req.params.id },
    });
    if (!exam) throw ApiError.notFound("Exam not found");

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
      select: { id: true },
    });
    if (!profile) throw ApiError.notFound("Student profile not found");

    const attempt = await prisma.examAttempt.create({
      data: { examId: exam.id, studentId: profile.id },
    });

    res.status(201).json({ success: true, data: { attempt } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/attempt/:attemptId/submit", requireRole(Role.STUDENT), validate(attemptSchema), async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
      select: { id: true },
    });
    if (!profile) throw ApiError.notFound("Student profile not found");

    const attempt = await prisma.examAttempt.findFirst({
      where: { id: req.params.attemptId, examId: req.params.id, studentId: profile.id },
    });
    if (!attempt) throw ApiError.notFound("Attempt not found");

    const questions = await prisma.examQuestion.findMany({ where: { examId: req.params.id } });
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let score = 0;
    for (const a of req.body.answers) {
      const q = questionMap.get(a.questionId);
      if (!q) continue;
      if (q.type === "mcq" && a.selectedOption === q.correctOption) {
        score += q.marks;
      }
      if (q.type === "subjective") {
        score += 0; // subjective requires manual grading
      }
    }

    const updated = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: req.body.answers,
        submittedAt: new Date(),
        score,
        status: "submitted",
      },
    });

    res.json({ success: true, data: { attempt: updated } });
  } catch (err) {
    next(err);
  }
});

export const examsRouter = router;

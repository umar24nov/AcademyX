import { Router } from "express";
import { z } from "zod";
import { PaymentMethod, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

const createPaymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.RAZORPAY),
  purpose: z.string().optional(),
});

function generateTxId() {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// List payments (staff) or own payments (student)
router.get("/", async (req, res, next) => {
  try {
    let where: Record<string, unknown> = { instituteId: req.user!.instituteId! };

    if (req.user!.role === Role.STUDENT) {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
        select: { id: true },
      });
      if (!profile) throw ApiError.notFound("Student profile not found");
      where = { ...where, studentId: profile.id };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        payments: payments.map((p) => ({
          id: p.id,
          txId: p.txId,
          student: p.student?.user?.name,
          amount: p.amount,
          method: p.method,
          status: p.status,
          date: p.createdAt,
          purpose: p.purpose,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Record an offline/manual payment or return Razorpay order details for gateway flow
router.post("/", requireRole(Role.INSTITUTE_ADMIN, Role.STUDENT), validate(createPaymentSchema), async (req, res, next) => {
  try {
    const { studentId, amount, currency, method, purpose } = req.body;

    const student = await prisma.studentProfile.findFirst({
      where: { id: studentId, instituteId: req.user!.instituteId! },
    });
    if (!student) throw ApiError.notFound("Student not found");

    const payment = await prisma.payment.create({
      data: {
        instituteId: req.user!.instituteId!,
        studentId: student.id,
        txId: generateTxId(),
        amount,
        currency,
        method,
        purpose,
        status: "PENDING",
      },
    });

    res.status(201).json({ success: true, data: { payment } });
  } catch (err) {
    next(err);
  }
});

// Confirm payment success (offline/manual verification)
router.post("/:id/confirm", requireRole(Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, instituteId: req.user!.instituteId! },
    });
    if (!payment) throw ApiError.notFound("Payment not found");

    const [updated, invoice] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paidAt: new Date() },
      }),
      prisma.invoice.create({
        data: {
          instituteId: payment.instituteId,
          studentId: payment.studentId,
          paymentId: payment.id,
          number: `INV-${Date.now()}`,
          amount: payment.amount,
          total: payment.amount,
          status: "PAID",
          issuedAt: new Date(),
          paidAt: new Date(),
        },
      }),
    ]);

    res.json({ success: true, data: { payment: updated, invoice } });
  } catch (err) {
    next(err);
  }
});

router.get("/invoices", requireRole(Role.INSTITUTE_ADMIN), async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { instituteId: req.user!.instituteId! },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { issuedAt: "desc" },
    });
    res.json({ success: true, data: { invoices } });
  } catch (err) {
    next(err);
  }
});

export const paymentsRouter = router;

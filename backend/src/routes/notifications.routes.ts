import { Router } from "express";
import { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireInstitute } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

export async function notifyUser(params: {
  userId: string;
  instituteId: string;
  type?: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      instituteId: params.instituteId,
      type: params.type ?? NotificationType.SYSTEM,
      title: params.title,
      body: params.body,
      link: params.link,
    },
  });
}

router.get("/", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId! },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unread = notifications.filter((n) => !n.readAt).length;
    res.json({ success: true, data: { notifications, unread } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/read", async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!notification) throw ApiError.notFound("Notification not found");
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });
    res.json({ success: true, data: { notification: updated } });
  } catch (err) {
    next(err);
  }
});

router.post("/read-all", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, instituteId: req.user!.instituteId!, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export const notificationsRouter = router;

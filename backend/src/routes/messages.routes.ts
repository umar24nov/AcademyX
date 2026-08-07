import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute } from "../middleware/auth";
import { authenticatedRateLimit } from "../middleware/rateLimit";
import { ApiError } from "../utils/ApiError";
import { httpUrl } from "../utils/schema";

const router = Router();

router.use(authenticate, requireInstitute, authenticatedRateLimit);

const conversationSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1).max(50),
  title: z.string().max(200).optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z.array(httpUrl).max(10).optional(),
});

// List conversations for the current user
router.get("/conversations", async (req, res, next) => {
  try {
    const memberships = await prisma.conversationMember.findMany({
      where: { userId: req.user!.id },
      include: {
        conversation: {
          include: {
            members: { include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } } },
            messages: { orderBy: { sentAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const conversations = await Promise.all(
      memberships.map(async (m) => {
        const unread = await prisma.message.count({
          where: {
            conversationId: m.conversation.id,
            senderId: { not: req.user!.id },
            deletedAt: null,
            sentAt: { gt: m.lastReadAt ?? new Date(0) },
          },
        });
        return {
          id: m.conversation.id,
          title: m.conversation.title,
          isGroup: m.conversation.isGroup,
          members: m.conversation.members.map((x) => x.user),
          preview: m.conversation.messages[0]?.content ?? "",
          time: m.conversation.messages[0]?.sentAt ?? m.conversation.updatedAt,
          unread,
        };
      }),
    );

    res.json({ success: true, data: { conversations } });
  } catch (err) {
    next(err);
  }
});

// Institute contacts for starting new conversations (excludes self)
router.get("/contacts", async (req, res, next) => {
  try {
    const contacts = await prisma.user.findMany({
      where: { instituteId: req.user!.instituteId!, id: { not: req.user!.id }, status: "ACTIVE" },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: { contacts } });
  } catch (err) {
    next(err);
  }
});

// Create DM (find-or-create between two users) or group
router.post("/conversations", validate(conversationSchema), async (req, res, next) => {
  try {
    const { participantIds, title } = req.body;

    if (participantIds.length === 1) {
      // DM: find-or-create between exactly two members
      const otherId = participantIds[0];
      if (otherId === req.user!.id) throw ApiError.badRequest("You cannot message yourself");

      const candidates = await prisma.conversation.findMany({
        where: {
          isGroup: false,
          instituteId: req.user!.instituteId!,
          members: { some: { userId: req.user!.id } },
        },
        include: { members: true },
      });
      const dm = candidates.find(
        (c) =>
          c.members.length === 2 &&
          c.members.some((x) => x.userId === req.user!.id) &&
          c.members.some((x) => x.userId === otherId),
      );
      if (dm) {
        return res.status(200).json({ success: true, data: { conversation: dm } });
      }

      const created = await prisma.conversation.create({
        data: {
          instituteId: req.user!.instituteId!,
          isGroup: false,
          createdById: req.user!.id,
          members: {
            create: [req.user!.id, otherId].map((userId) => ({ userId })),
          },
        },
        include: { members: true },
      });
      return res.status(201).json({ success: true, data: { conversation: created } });
    }

    const conversation = await prisma.conversation.create({
      data: {
        instituteId: req.user!.instituteId!,
        isGroup: true,
        title: title ?? "Group Chat",
        createdById: req.user!.id,
        members: {
          create: [req.user!.id, ...participantIds].map((userId) => ({ userId })),
        },
      },
      include: { members: true },
    });

    res.status(201).json({ success: true, data: { conversation } });
  } catch (err) {
    next(err);
  }
});

// Mark a conversation as read
router.post("/conversations/:id/read", async (req, res, next) => {
  try {
    const membership = await prisma.conversationMember.findFirst({
      where: { conversationId: req.params.id, userId: req.user!.id },
    });
    if (!membership) throw ApiError.forbidden("You are not a member of this conversation");

    await prisma.conversationMember.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() },
    });

    res.json({ success: true, data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// List messages in a conversation
router.get("/conversations/:id/messages", async (req, res, next) => {
  try {
    const membership = await prisma.conversationMember.findFirst({
      where: { conversationId: req.params.id, userId: req.user!.id },
    });
    if (!membership) throw ApiError.forbidden("You are not a member of this conversation");

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id, deletedAt: null },
      orderBy: { sentAt: "asc" },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      take: 200,
    });

    res.json({ success: true, data: { messages } });
  } catch (err) {
    next(err);
  }
});

// Send a message
router.post("/conversations/:id/messages", validate(messageSchema), async (req, res, next) => {
  try {
    const membership = await prisma.conversationMember.findFirst({
      where: { conversationId: req.params.id, userId: req.user!.id },
    });
    if (!membership) throw ApiError.forbidden("You are not a member of this conversation");

    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user!.id,
        content: req.body.content,
        attachments: req.body.attachments,
      },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ success: true, data: { message } });
  } catch (err) {
    next(err);
  }
});

export const messagesRouter = router;

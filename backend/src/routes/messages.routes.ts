import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate, requireInstitute } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(authenticate, requireInstitute);

const conversationSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1),
  title: z.string().optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string()).optional(),
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
            _count: {
              select: {
                messages: {
                  where: { senderId: { not: req.user!.id }, deletedAt: null },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        conversations: memberships.map((m) => ({
          id: m.conversation.id,
          title: m.conversation.title,
          isGroup: m.conversation.isGroup,
          members: m.conversation.members.map((x) => x.user),
          preview: m.conversation.messages[0]?.content ?? "",
          time: m.conversation.messages[0]?.sentAt ?? m.conversation.updatedAt,
          unread: m.conversation._count.messages,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create DM (find-or-create between two users) or group
router.post("/conversations", validate(conversationSchema), async (req, res, next) => {
  try {
    const { participantIds, title } = req.body;

    if (participantIds.length === 1) {
      // DM: find-or-create
      const members = [req.user!.id, participantIds[0]].sort();
      const existing = await prisma.conversation.findFirst({
        where: { isGroup: false },
        include: { members: true },
      });

      const dm = existing
        ? existing
        : await prisma.conversation.create({
            data: {
              instituteId: req.user!.instituteId!,
              isGroup: false,
              createdById: req.user!.id,
              members: {
                create: members.map((userId) => ({ userId })),
              },
            },
          });

      return res.status(201).json({ success: true, data: { conversation: dm } });
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

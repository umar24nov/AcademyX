import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

export interface LiveParticipant {
  userId: string;
  socketId: string;
  name: string;
  role: string;
  joinedAt: number;
}

export interface LiveChatMessage {
  id: string;
  from: string;
  userId: string;
  text: string;
  time: string;
}

export interface LiveSignal {
  liveClassId: string;
  from: { userId: string; name: string };
  data: { type: string; payload: unknown };
}

let io: Server | null = null;
const participants = new Map<string, LiveParticipant>(); // socketId -> participant

function roomKey(liveClassId: string) {
  return `live:${liveClassId}`;
}

function listParticipants(liveClassId: string): LiveParticipant[] {
  const room = io?.sockets.adapter.rooms.get(roomKey(liveClassId));
  if (!room) return [];
  const list: LiveParticipant[] = [];
  for (const socketId of room) {
    const p = participants.get(socketId);
    if (p) list.push(p);
  }
  return list.sort((a, b) => a.joinedAt - b.joinedAt);
}

function broadcastParticipants(liveClassId: string) {
  io?.to(roomKey(liveClassId)).emit("live:participants", {
    liveClassId,
    participants: listParticipants(liveClassId),
  });
}

function handleLeave(socket: Socket, liveClassId?: string) {
  const current = socket.data.liveClassId as string | undefined;
  const room = liveClassId ?? current;
  if (!room) return;
  socket.leave(roomKey(room));
  participants.delete(socket.id);
  delete socket.data.liveClassId;
  broadcastParticipants(room);
}

export function initLiveSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("live:join", async ({ liveClassId }: { liveClassId?: string } = {}) => {
      if (!liveClassId || !socket.data.userId) return;
      try {
        const user = await prisma.user.findUnique({
          where: { id: socket.data.userId },
          select: { name: true },
        });
        socket.join(roomKey(liveClassId));
        socket.data.liveClassId = liveClassId;
        participants.set(socket.id, {
          userId: socket.data.userId,
          socketId: socket.id,
          name: user?.name ?? "Participant",
          role: socket.data.role ?? "STUDENT",
          joinedAt: Date.now(),
        });
        broadcastParticipants(liveClassId);
      } catch {
        // ignore DB errors — presence still works with fallback name
      }
    });

    socket.on("live:leave", ({ liveClassId }: { liveClassId?: string } = {}) => {
      handleLeave(socket, liveClassId);
    });

    socket.on("live:chat", ({ liveClassId, text }: { liveClassId?: string; text?: unknown } = {}) => {
      if (!liveClassId || typeof text !== "string" || !text.trim()) return;
      const p = participants.get(socket.id);
      if (!p) return;
      const message: LiveChatMessage = {
        id: `m_${Date.now()}_${socket.id.slice(-6)}`,
        from: p.name,
        userId: p.userId,
        text: text.trim().slice(0, 2000),
        time: new Date().toISOString(),
      };
      io?.to(roomKey(liveClassId)).emit("live:chat:new", { liveClassId, message });
    });

    socket.on(
      "live:signal",
      ({ liveClassId, target, data }: { liveClassId?: string; target?: string; data?: LiveSignal["data"] } = {}) => {
        if (!liveClassId || !target || !data) return;
        const from = participants.get(socket.id);
        if (!from) return;
        let targetSocketId: string | null = null;
        for (const p of participants.values()) {
          if (p.userId === target) {
            targetSocketId = p.socketId;
            break;
          }
        }
        if (targetSocketId) {
          io?.to(targetSocketId).emit("live:signal", {
            liveClassId,
            from: { userId: from.userId, name: from.name },
            data,
          } satisfies LiveSignal);
        }
      }
    );

    socket.on("disconnect", () => {
      handleLeave(socket);
    });
  });

  return io;
}

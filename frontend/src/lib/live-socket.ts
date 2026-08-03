"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";
import { getStoredUser } from "./api";

function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
  return base.replace(/\/api\/v1\/?$/, "");
}

function createLiveSocket(token: string): Socket {
  return io(apiOrigin(), {
    transports: ["websocket"],
    auth: { token },
  });
}

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

export function useLiveSession(liveClassId?: string) {
  const [connected, setConnected] = React.useState(false);
  const [participants, setParticipants] = React.useState<LiveParticipant[]>([]);
  const [messages, setMessages] = React.useState<LiveChatMessage[]>([]);
  const socketRef = React.useRef<Socket | null>(null);
  const signalHandlersRef = React.useRef<Set<(s: LiveSignal) => void>>(new Set());
  const chatHandlersRef = React.useRef<Set<(m: LiveChatMessage) => void>>(new Set());

  React.useEffect(() => {
    if (!liveClassId) return;
    const user = getStoredUser();
    if (!user) return;
    const token = localStorage.getItem("ax_access_token");
    if (!token) return;

    const socket = createLiveSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("live:join", { liveClassId });
    });
    socket.on("connect_error", () => setConnected(false));
    socket.on("disconnect", () => setConnected(false));
    socket.on("live:participants", (data: { participants: LiveParticipant[] }) => {
      setParticipants(data.participants);
    });
    socket.on("live:chat:new", (data: { message: LiveChatMessage }) => {
      setMessages((prev) => [...prev.slice(-199), data.message]);
      chatHandlersRef.current.forEach((cb) => cb(data.message));
    });
    socket.on("live:signal", (signal: LiveSignal) => {
      signalHandlersRef.current.forEach((cb) => cb(signal));
    });

    return () => {
      socket.emit("live:leave", { liveClassId });
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setParticipants([]);
    };
  }, [liveClassId]);

  const sendChat = React.useCallback(
    (text: string) => {
      socketRef.current?.emit("live:chat", { liveClassId, text });
    },
    [liveClassId]
  );

  const sendSignal = React.useCallback(
    (target: string, data: { type: string; payload: unknown }) => {
      socketRef.current?.emit("live:signal", { liveClassId, target, data });
    },
    [liveClassId]
  );

  const onSignal = React.useCallback((cb: (s: LiveSignal) => void) => {
    signalHandlersRef.current.add(cb);
    return () => {
      signalHandlersRef.current.delete(cb);
    };
  }, []);

  const onChat = React.useCallback((cb: (m: LiveChatMessage) => void) => {
    chatHandlersRef.current.add(cb);
    return () => {
      chatHandlersRef.current.delete(cb);
    };
  }, []);

  return { connected, participants, messages, sendChat, sendSignal, onSignal, onChat };
}

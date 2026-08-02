"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { useLive } from "@/lib/live";
import {
  fetchLiveClassDetail,
  mockLiveClassDetailData,
  formatTime,
} from "@/lib/live-data";
import { cn } from "@/lib/utils";

export default function LiveClassSessionPage() {
  return (
    <React.Suspense fallback={null}>
      <LiveClassSessionPageInner />
    </React.Suspense>
  );
}

interface ChatMessage {
  id: string;
  from: string;
  mine: boolean;
  text: string;
  time: string;
}

const mockParticipants = [
  { name: "Elena Martinez", initials: "EM", online: true },
  { name: "Marcus Chen", initials: "MC", online: true },
  { name: "Priya Sharma", initials: "PS", online: false },
  { name: "Julian Wright", initials: "JW", online: true },
  { name: "Sarah Lofton", initials: "SL", online: false },
  { name: "Ravi Kumar", initials: "RK", online: false },
];

const seedChat: ChatMessage[] = [
  { id: "m1", from: "Marcus Chen", mine: false, text: "Is the recording going to be uploaded?", time: "just now" },
  { id: "m2", from: "Elena Martinez", mine: false, text: "Could you go over the last slide again?", time: "just now" },
];

function LiveClassSessionPageInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const live = useLive(() => fetchLiveClassDetail(id), mockLiveClassDetailData);

  const [messages, setMessages] = React.useState<ChatMessage[]>(seedChat);
  const [draft, setDraft] = React.useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `me_${Date.now()}`, from: "Me", mine: true, text: draft.trim(), time: "just now" },
    ]);
    setDraft("");
  };

  const join = () => {
    toast({
      title: live.status === "Live" ? "Joining live session" : "Launching session",
      description: live.status === "Live"
        ? `Connecting you to "${live.title}"...`
        : `Room will open at ${formatTime(live.startsAt)}`,
    });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/live-classes" className="text-text-muted hover:text-text-heading">
              <Icon name="arrow_left" className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-3xl tracking-tight text-text-heading">{live.title}</h2>
                <Badge
                  variant={live.status === "Live" ? "destructive" : live.status === "Ended" ? "outline" : "default"}
                  className="font-mono uppercase"
                >
                  <span
                    className={cn(
                      "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                      live.status === "Live" ? "bg-error animate-pulse" : "bg-current"
                    )}
                  />
                  {live.status}
                </Badge>
              </div>
              <p className="text-text-muted text-sm mt-1">
                {live.course} • {live.batch} • {live.teacher}
              </p>
            </div>
          </div>
          {live.status !== "Ended" && (
            <Button onClick={join} size="lg">
              <Icon name="video" className="h-4 w-4" />
              {live.status === "Live" ? "Join Now" : `Starts in ${live.startsIn}`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stage */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="overflow-hidden">
              <div
                className={cn(
                  "relative aspect-video flex items-center justify-center",
                  live.status === "Live"
                    ? "bg-gradient-to-br from-primary/90 to-primary/40"
                    : "bg-surface-container-high"
                )}
              >
                {live.status === "Live" ? (
                  <>
                    <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 text-white text-xs font-mono px-2.5 py-1 rounded">
                      <span className="h-2 w-2 rounded-full bg-error animate-pulse" />
                      LIVE • {live.teacher}
                    </span>
                    <div className="text-center text-white">
                      <Icon name="video" className="h-14 w-14 mx-auto opacity-90" />
                      <p className="text-sm mt-3 font-medium">{live.teacher} is presenting</p>
                      <p className="text-xs text-white/70 mt-0.5">{live.registered} participants</p>
                    </div>
                  </>
                ) : live.status === "Ended" ? (
                  <div className="text-center text-text-muted">
                    <Icon name="play_circle" className="h-14 w-14 mx-auto" />
                    <p className="text-sm mt-3 font-medium text-on-surface">Session ended</p>
                    {live.recordingUrl ? (
                      <a
                        href={live.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline mt-1 inline-block"
                      >
                        Watch recording
                      </a>
                    ) : (
                      <p className="text-xs mt-1">Recording will be available shortly.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-text-muted">
                    <Icon name="schedule" className="h-14 w-14 mx-auto" />
                    <p className="text-sm mt-3 font-medium text-on-surface">
                      Class scheduled for {formatTime(live.startsAt)}
                    </p>
                    <p className="text-xs mt-1">
                      {live.durationMin} minutes • {live.location}
                    </p>
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Icon name="schedule" className="h-4 w-4" />
                    {formatTime(live.startsAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="timer" className="h-4 w-4" />
                    {live.durationMin} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="group" className="h-4 w-4" />
                    {live.registered} registered
                  </span>
                </div>
                {live.status === "Live" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="call" className="h-4 w-4" />
                      Mic
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="visibility" className="h-4 w-4" />
                      Camera
                    </Button>
                    <Button variant="outline" size="sm" className="text-error">
                      <Icon name="warning" className="h-4 w-4" />
                      Leave
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">About this session</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-text-muted">
                {live.description ??
                  "Join this live session to interact in real time, ask questions, and participate with your batch. The recording will be available in the lectures library after the session ends."}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: chat + participants */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col">
              <CardHeader className="border-b border-border-subtle py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="forum" className="h-4 w-4" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <div className="flex-1 p-4 space-y-3 min-h-[240px] max-h-[320px] overflow-y-auto">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                        m.mine
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-surface-container-high text-on-surface rounded-bl-sm"
                      )}
                    >
                      {!m.mine && <p className="text-[11px] font-medium text-primary">{m.from}</p>}
                      <p>{m.text}</p>
                      <p className={cn("text-[10px] mt-0.5", m.mine ? "text-white/70" : "text-text-muted")}>
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border-subtle flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message..."
                  disabled={live.status !== "Live"}
                  className="flex-1 h-9 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
                />
                <Button size="icon" onClick={send} disabled={live.status !== "Live" || !draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader className="border-b border-border-subtle py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="group" className="h-4 w-4" />
                  Participants
                  <span className="text-xs text-text-muted font-normal">
                    {live.status === "Live" ? `${live.registered} attending` : `${live.registered} registered`}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {mockParticipants.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{p.initials}</AvatarFallback>
                      </Avatar>
                      {live.status === "Live" && p.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success-green border-2 border-surface" />
                      )}
                    </div>
                    <span className="text-sm text-on-surface flex-1">{p.name}</span>
                    {live.status === "Live" && p.online && (
                      <span className="text-[10px] text-success-green font-mono">online</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

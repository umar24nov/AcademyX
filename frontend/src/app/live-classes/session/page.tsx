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
import { Send, Mic, MicOff, Video, VideoOff, PhoneOff, Sparkles } from "lucide-react";
import { useLive } from "@/lib/live";
import { getStoredUser } from "@/lib/api";
import {
  fetchLiveClassDetail,
  mockLiveClassDetailData,
  setLiveClassStatus,
  formatTime,
} from "@/lib/live-data";
import { useLiveSession } from "@/lib/live-socket";
import { useLiveWebRTC } from "@/lib/live-webrtc";
import { cn } from "@/lib/utils";

export default function LiveClassSessionPage() {
  return (
    <React.Suspense fallback={null}>
      <LiveClassSessionPageInner />
    </React.Suspense>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LiveClassSessionPageInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const live = useLive(() => fetchLiveClassDetail(id), mockLiveClassDetailData);

  const user = React.useMemo(() => getStoredUser(), []);
  const [status, setStatus] = React.useState(live.status);
  const [joined, setJoined] = React.useState(false);
  const [launching, setLaunching] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [systemNotes, setSystemNotes] = React.useState<string[]>([]);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setStatus(live.status);
  }, [live.status]);

  const isStaff = user?.role === "TEACHER" || user?.role === "INSTITUTE_ADMIN";

  const {
    connected,
    participants,
    messages,
    sendChat,
    sendSignal,
    onSignal,
  } = useLiveSession(joined ? id : undefined);

  const { localStream, remoteVideos, videoOn, micOn, toggleCamera, toggleMic, ensureLocalStream } =
    useLiveWebRTC({
      enabled: joined && connected,
      myUserId: user?.id ?? null,
      participants,
      sendSignal,
      onSignal,
    });

  const addNote = React.useCallback((text: string) => {
    setSystemNotes((prev) => [...prev.slice(-20), text]);
  }, []);

  React.useEffect(() => {
    if (joined && connected) {
      addNote(`You joined ${live.title}`);
      if (ensureLocalStream) {
        ensureLocalStream().then((stream) => {
          if (stream) addNote("Camera & mic connected");
          else addNote("Camera unavailable — you can still chat");
        });
      }
    }
  }, [joined, connected, live.title, addNote, ensureLocalStream]);

  React.useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight });
  }, [messages, systemNotes]);

  const join = async () => {
    if (status === "Scheduled" && isStaff) {
      setLaunching(true);
      const ok = await setLiveClassStatus(id!, "LIVE");
      setLaunching(false);
      if (ok) {
        setStatus("Live");
        toast({ title: "Session launched", description: "Your students can now join." });
      } else {
        toast({ title: "Could not launch", description: "Try again in a moment.", variant: "destructive" });
      }
    }
    setJoined(true);
  };

  const leave = () => {
    setJoined(false);
    setSystemNotes([]);
  };

  const send = () => {
    if (!draft.trim()) return;
    sendChat(draft.trim());
    setDraft("");
  };

  const pinned = remoteVideos.find(
    (r) => (r.role === "TEACHER" || r.role === "INSTITUTE_ADMIN") && r.stream
  );
  const mainVideo = pinned ?? remoteVideos.find((r) => r.stream);
  const thumbnails = remoteVideos.filter((r) => r !== mainVideo);
  const anyoneBroadcasting = remoteVideos.some((r) => r.stream);
  const showLocalPreview = joined && videoOn && localStream;

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
                  variant={status === "Live" ? "destructive" : status === "Ended" ? "outline" : "default"}
                  className="font-mono uppercase"
                >
                  <span
                    className={cn(
                      "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                      status === "Live" ? "bg-error animate-pulse" : "bg-current"
                    )}
                  />
                  {status}
                </Badge>
              </div>
              <p className="text-text-muted text-sm mt-1">
                {live.course} • {live.batch} • {live.teacher}
              </p>
            </div>
          </div>
          {status !== "Ended" && !joined && (
            <Button onClick={join} size="lg" disabled={launching}>
              <Icon name="video" className="h-4 w-4" />
              {status === "Scheduled" && isStaff
                ? launching
                  ? "Launching..."
                  : "Launch Session"
                : status === "Live"
                  ? "Join Now"
                  : `Join Early • Starts in ${live.startsIn}`}
            </Button>
          )}
          {joined && (
            <Button variant="outline" size="lg" onClick={leave} className="text-error">
              <PhoneOff className="h-4 w-4" />
              Leave
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stage */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-surface-container-high">
                {status === "Ended" ? (
                  <div className="absolute inset-0 flex items-center justify-center text-center text-text-muted">
                    <div>
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
                  </div>
                ) : status === "Scheduled" && !joined ? (
                  <div className="absolute inset-0 flex items-center justify-center text-center text-text-muted">
                    <div>
                      <Icon name="schedule" className="h-14 w-14 mx-auto" />
                      <p className="text-sm mt-3 font-medium text-on-surface">
                        Class scheduled for {formatTime(live.startsAt)}
                      </p>
                      <p className="text-xs mt-1">
                        {live.durationMin} minutes • {live.location}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/50 text-white text-xs font-mono px-2.5 py-1 rounded">
                      <span className="h-2 w-2 rounded-full bg-error animate-pulse" />
                      {connected ? `LIVE • ${participants.length} online` : "CONNECTING…"}
                    </span>

                    {mainVideo?.stream ? (
                      <video
                        key={mainVideo.userId}
                        autoPlay
                        playsInline
                        ref={(el) => {
                          if (el && mainVideo.stream && el.srcObject !== mainVideo.stream) {
                            el.srcObject = mainVideo.stream;
                          }
                        }}
                        className="absolute inset-0 h-full w-full object-contain bg-black"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Video className="h-10 w-10" />
                        </div>
                        <p className="text-sm font-medium text-text-muted">
                          {joined && connected
                            ? anyoneBroadcasting
                              ? "Waiting for video stream…"
                              : "Waiting for the host to share video"
                            : "Join the session to see live video"}
                        </p>
                        {joined && connected && (
                          <p className="text-xs text-text-muted/70">
                            Camera permissions may be required on your device.
                          </p>
                        )}
                      </div>
                    )}

                    {mainVideo?.name && (
                      <span className="absolute bottom-3 left-3 z-10 text-white text-xs font-medium bg-black/50 px-2.5 py-1 rounded">
                        {mainVideo.name}
                        {mainVideo.role === "TEACHER" || mainVideo.role === "INSTITUTE_ADMIN" ? " • Host" : ""}
                      </span>
                    )}

                    {showLocalPreview && (
                      <div className="absolute bottom-3 right-3 z-10 w-40 aspect-video rounded-lg overflow-hidden border-2 border-white/40 bg-black">
                        <video
                          autoPlay
                          playsInline
                          muted
                          ref={(el) => {
                            if (el && localStream && el.srcObject !== localStream) {
                              el.srcObject = localStream;
                            }
                          }}
                          className="h-full w-full object-contain"
                        />
                        <span className="absolute bottom-1 left-1.5 text-[10px] text-white font-medium">
                          You
                        </span>
                      </div>
                    )}
                  </>
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
                    {joined && connected ? `${participants.length} online` : `${live.registered} registered`}
                  </span>
                </div>
                {joined && status !== "Ended" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleMic}>
                      {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      {micOn ? "Mic" : "Mic off"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleCamera}>
                      {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      {videoOn ? "Camera" : "Camera off"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-error" onClick={leave}>
                      <PhoneOff className="h-4 w-4" />
                      Leave
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {thumbnails.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {thumbnails.map((r) => (
                  <div key={r.userId} className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    {r.stream ? (
                      <video
                        autoPlay
                        playsInline
                        ref={(el) => {
                          if (el && r.stream && el.srcObject !== r.stream) el.srcObject = r.stream;
                        }}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-surface-container-high text-text-muted">
                        <VideoOff className="h-5 w-5" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1.5 text-[10px] text-white font-medium bg-black/50 px-1.5 py-0.5 rounded">
                      {r.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

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
                  {connected && <span className="h-2 w-2 rounded-full bg-success-green animate-pulse" />}
                </CardTitle>
              </CardHeader>
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 space-y-3 min-h-[240px] max-h-[360px] overflow-y-auto"
              >
                {systemNotes.map((n, i) => (
                  <p key={`sys_${i}`} className="text-[11px] text-text-muted/70 text-center">
                    {n}
                  </p>
                ))}
                {messages.map((m) => {
                  const mine = m.userId === user?.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                          mine
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-surface-container-high text-on-surface rounded-bl-sm"
                        )}
                      >
                        {!mine && <p className="text-[11px] font-medium text-primary">{m.from}</p>}
                        <p>{m.text}</p>
                        <p className={cn("text-[10px] mt-0.5", mine ? "text-white/70" : "text-text-muted")}>
                          {formatTime(m.time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border-subtle flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message..."
                  disabled={!joined || !connected}
                  className="flex-1 h-9 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
                />
                <Button size="icon" onClick={send} disabled={!joined || !connected || !draft.trim()}>
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
                    {joined && connected ? `${participants.length} online` : "Offline"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {!joined || !connected ? (
                  <p className="text-sm text-text-muted">
                    <Sparkles className="h-4 w-4 inline mr-1.5" />
                    Join the session to see who&apos;s here.
                  </p>
                ) : participants.length === 0 ? (
                  <p className="text-sm text-text-muted">No one else has joined yet.</p>
                ) : (
                  participants.map((p) => (
                    <div key={p.socketId} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success-green border-2 border-surface" />
                      </div>
                      <span className="text-sm text-on-surface flex-1 truncate">{p.name}</span>
                      <span className="text-[10px] text-success-green font-mono">
                        {p.userId === user?.id ? "you" : "online"}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

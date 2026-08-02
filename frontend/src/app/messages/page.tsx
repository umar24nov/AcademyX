"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { fetchConversations, mockConversationsData } from "@/lib/live-data";
import {
  fetchThreadMessages,
  sendThreadMessage,
  mockThreadData,
  type ThreadMessage,
} from "@/lib/live-data";
import { cn } from "@/lib/utils";
import { Send, Paperclip, MoreVertical } from "lucide-react";

export default function MessagesPage() {
  const conversations = useLive(fetchConversations, mockConversationsData);
  const [activeThread, setActiveThread] = React.useState(0);
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ThreadMessage[]>(mockThreadData);
  const [loadedConv, setLoadedConv] = React.useState<string | null>(null);

  const safeIndex = Math.min(activeThread, Math.max(conversations.length - 1, 0));
  const thread = conversations[safeIndex] ?? mockConversationsData[0];

  React.useEffect(() => {
    if (thread.id === loadedConv) return;
    let cancelled = false;
    fetchThreadMessages(thread.id)
      .then((result) => {
        if (!cancelled) {
          setMessages(result);
          setLoadedConv(thread.id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [thread.id, loadedConv]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    const mine: ThreadMessage = {
      id: `local_${Date.now()}`,
      from: "Me",
      mine: true,
      text,
      time: "now",
    };
    setMessages((prev) => [...prev, mine]);
    setDraft("");
    const sent = await sendThreadMessage(thread.id, text);
    if (sent) {
      setMessages((prev) => [...prev.filter((m) => m.id !== mine.id), sent]);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Messages"
          description="Chat with your students, teachers and staff in real time."
          actions={
            <Button>
              <Icon name="edit" className="h-4 w-4" />
              New Message
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-[calc(100vh-16rem)] min-h-[480px]">
          {/* Conversation list */}
          <Card className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border-subtle">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input className="pl-9" placeholder="Search conversations..." />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin">
              {conversations.map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => setActiveThread(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border-subtle/60 transition-colors hover:bg-surface-container-low",
                    i === activeThread && "bg-surface-container-low border-l-2 border-l-primary"
                  )}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary-container/20 text-primary text-xs">
                        {u.initials}
                      </AvatarFallback>
                    </Avatar>
                    {u.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success-green border-2 border-surface" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-on-surface truncate">{u.name}</p>
                      <span className="text-[10px] text-text-muted shrink-0">{u.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-text-muted truncate">{u.preview}</p>
                      {u.unread > 0 && (
                        <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                          {u.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Thread */}
          <Card className="overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
              <Avatar>
                <AvatarFallback className="bg-primary-container/20 text-primary text-xs">
                  {thread.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-text-heading">{thread.name}</p>
                <p className="text-xs text-text-muted">{thread.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-text-muted">
                  <Icon name="call" className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-text-muted">
                  <Icon name="videocam" className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-text-muted">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4 bg-surface-container-lowest/40">
              <div className="text-center">
                <span className="text-[10px] text-text-muted font-mono bg-surface-container-high px-2 py-1 rounded-full">TODAY</span>
              </div>
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                  <div className="max-w-[75%]">
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm",
                        m.mine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-surface-container-high text-on-surface rounded-bl-md"
                      )}
                    >
                      {m.text}
                    </div>
                    <p className={cn("text-[10px] text-text-muted mt-1", m.mine && "text-right")}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border-subtle">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-text-muted shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button size="icon" onClick={send} disabled={!draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "@/components/shared/icon";
import {
  fetchConversations,
  mockConversationsData,
  fetchThreadMessages,
  sendThreadMessage,
  markConversationRead,
  fetchContacts,
  createConversation,
  type ThreadMessage,
  type Contact,
} from "@/lib/live-data";
import { cn } from "@/lib/utils";
import { Send, Paperclip, MoreVertical, Search, ArrowLeft } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  INSTITUTE_ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export default function MessagesPage() {
  const [conversations, setConversations] = React.useState(mockConversationsData);
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ThreadMessage[]>([]);
  const [draft, setDraft] = React.useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = React.useState("");
  const [startingChat, setStartingChat] = React.useState<string | null>(null);

  const threadEndRef = React.useRef<HTMLDivElement>(null);

  const refreshConversations = React.useCallback(async () => {
    const next = await fetchConversations();
    setConversations((prev) => {
      if (next.length && prev.length === next.length) {
        return next;
      }
      return next.length ? next : prev;
    });
  }, []);

  const refreshThread = React.useCallback(
    async (convId?: string) => {
      const id = convId ?? activeConvId;
      if (!id) return;
      const result = await fetchThreadMessages(id);
      setMessages(result);
    },
    [activeConvId],
  );

  const activeConv =
    conversations.find((c) => c.id === activeConvId) ??
    conversations[0] ??
    mockConversationsData[0];

  // Poll conversations + active thread every few seconds for a live feel.
  React.useEffect(() => {
    refreshConversations();
    const timer = setInterval(() => {
      refreshConversations();
      refreshThread();
    }, 8000);
    return () => clearInterval(timer);
  }, [refreshConversations, refreshThread]);

  // Auto-select the first conversation so the thread pane isn't empty.
  React.useEffect(() => {
    if (!activeConvId && conversations[0]) {
      setActiveConvId(conversations[0].id);
    }
  }, [activeConvId, conversations]);

  // Load the thread whenever the active conversation changes and mark it read.
  React.useEffect(() => {
    if (!activeConvId) return;
    let cancelled = false;
    fetchThreadMessages(activeConvId)
      .then((result) => {
        if (!cancelled) setMessages(result);
      })
      .catch(() => {});
    markConversationRead(activeConvId).then(() => {
      if (!cancelled) refreshConversations();
    });
    return () => {
      cancelled = true;
    };
  }, [activeConvId, refreshConversations]);

  React.useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConv?.id]);

  const openThread = (id: string) => {
    setActiveConvId(id);
    setMobileThreadOpen(true);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeConv) return;
    const optimistic: ThreadMessage = {
      id: `local_${Date.now()}`,
      from: "Me",
      mine: true,
      text,
      time: "just now",
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    const sent = await sendThreadMessage(activeConv.id, text);
    if (sent) {
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), sent]);
      refreshConversations();
    }
  };

  const openNewMessage = async () => {
    setDialogOpen(true);
    setContactSearch("");
    const list = await fetchContacts();
    setContacts(list);
  };

  const startChat = async (contact: Contact) => {
    setStartingChat(contact.id);
    const conv = await createConversation([contact.id]);
    setStartingChat(null);
    if (conv) {
      setDialogOpen(false);
      setActiveConvId(conv.id);
      refreshConversations();
      refreshThread(conv.id);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Messages & Community"
          description="Chat with your students, teachers and staff, or join your batch community groups."
          actions={
            <Button onClick={openNewMessage}>
              <Icon name="edit" className="h-4 w-4" />
              New Message
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-[calc(100vh-16rem)] min-h-[480px]">
          {/* Conversation list */}
          <Card
            className={cn(
              "overflow-hidden flex-col",
              mobileThreadOpen ? "hidden lg:flex" : "flex",
            )}
          >
            <div className="p-4 border-b border-border-subtle">
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
                />
                <Input className="pl-9" placeholder="Search conversations..." />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin">
              {conversations.map((u) => (
                <button
                  key={u.id}
                  onClick={() => openThread(u.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border-subtle/60 transition-colors hover:bg-surface-container-low",
                    u.id === activeConv?.id && "bg-surface-container-low border-l-2 border-l-primary",
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
              {conversations.length === 0 && (
                <p className="p-6 text-sm text-text-muted text-center">
                  No conversations yet. Start one with New Message.
                </p>
              )}
            </div>
          </Card>

          {/* Thread */}
          <Card
            className={cn(
              "overflow-hidden flex-col",
              mobileThreadOpen ? "flex" : "hidden lg:flex",
            )}
          >
            <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
              <Button
                variant="ghost"
                size="icon"
                className="text-text-muted lg:hidden"
                onClick={() => setMobileThreadOpen(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-primary-container/20 text-primary text-xs">
                  {activeConv?.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-text-heading">{activeConv?.name}</p>
                <p className="text-xs text-text-muted">{activeConv?.role}</p>
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
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                  <p className="text-sm text-text-muted">No messages yet.</p>
                  <p className="text-xs text-text-muted/70">Say hello to start the conversation!</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                    <div className="max-w-[75%]">
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm",
                          m.mine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-surface-container-high text-on-surface rounded-bl-md",
                        )}
                      >
                        {m.text}
                      </div>
                      <p className={cn("text-[10px] text-text-muted mt-1", m.mine && "text-right")}>
                        {m.from !== "Me" ? `${m.from} • ` : ""}
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={threadEndRef} />
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

      {/* New message dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Pick someone from your institute to start a conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              className="pl-9"
              placeholder="Search by name or email..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
          </div>
          <div className="max-h-72 overflow-y-auto scroll-thin space-y-1">
            {filteredContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => startChat(c)}
                disabled={startingChat === c.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-surface-container-low disabled:opacity-60"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary-container/20 text-primary text-xs">
                    {c.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface truncate">{c.name}</p>
                  <p className="text-xs text-text-muted truncate">{c.email}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-text-muted shrink-0">
                  {ROLE_LABEL[c.role] ?? c.role}
                </span>
              </button>
            ))}
            {filteredContacts.length === 0 && (
              <p className="p-6 text-sm text-text-muted text-center">No contacts found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

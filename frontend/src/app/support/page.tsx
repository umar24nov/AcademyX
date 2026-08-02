"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";

export default function SupportPage() {
  const { toast } = useToast();
  const [category, setCategory] = React.useState("technical");
  const [topic, setTopic] = React.useState("");
  const [message, setMessage] = React.useState("");

  const submit = () => {
    toast({
      title: "Request submitted",
      description: "Our support team will reach out within 24 hours.",
    });
    setTopic("");
    setMessage("");
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Support"
          description="Get help with AcademyX or reach our support team."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Help Center</CardTitle>
              <CardDescription>Common questions and resources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: "menu_book", label: "Getting Started", href: "#" },
                { icon: "help", label: "FAQs", href: "#" },
                { icon: "play_circle", label: "Video Tutorials", href: "#" },
                { icon: "forum", label: "Community Forum", href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface-container-low hover:border-primary/40 transition-colors"
                >
                  <Icon name={item.icon} className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-on-surface">{item.label}</span>
                </Link>
              ))}
              <div className="p-4 rounded-lg bg-surface-container-high mt-4">
                <p className="text-sm font-medium text-on-surface mb-1">Talk to a human</p>
                <p className="text-xs text-text-muted">
                  Email <a href="mailto:support@academyx.app" className="text-primary underline underline-offset-2">support@academyx.app</a>{" "}
                  or call +1 (555) 000-0000 (Mon–Fri, 9am–6pm).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Open a Support Ticket</CardTitle>
              <CardDescription>Tell us what you need help with.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Category</span>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing &amp; Plans</SelectItem>
                      <SelectItem value="account">Account Access</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="other">Something Else</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Topic</span>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Brief subject line" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm text-text-muted mb-1.5 block">Describe your issue</span>
                <Textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Include steps to reproduce, screenshots, and any error messages..."
                />
              </label>
              <div className="flex justify-end">
                <Button onClick={submit} disabled={!topic.trim() && !message.trim()}>
                  <Icon name="send" className="h-4 w-4" />
                  Submit Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

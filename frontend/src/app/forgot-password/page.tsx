"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-[420px] p-8 rounded-xl flex flex-col gap-8 border border-border-subtle bg-surface">
          <div className="flex flex-col gap-2 text-center">
            <div className="flex justify-center mb-2">
              {sent ? (
                <div className="w-12 h-12 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
                  <MailCheck className="h-7 w-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                  <GraduationCap className="h-7 w-7" />
                </div>
              )}
            </div>
            <h1 className="font-semibold text-2xl text-text-heading tracking-tight">
              {sent ? "Check your inbox" : "Reset your password"}
            </h1>
            <p className="text-sm text-text-muted">
              {sent
                ? "We've sent a password reset link to your email. The link expires in 30 minutes."
                : "Enter your email and we'll send you a secure reset link."}
            </p>
          </div>

          {!sent ? (
            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-on-surface">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="name@company.com" required autoFocus />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          ) : (
            <Button variant="outline" onClick={() => setSent(false)} className="w-full">
              Resend link
            </Button>
          )}

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

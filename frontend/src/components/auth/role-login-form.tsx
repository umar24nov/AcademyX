"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { BrandLogo } from "@/components/layout/brand-logo";
import { api, clearSession, setTokens } from "@/lib/api";
import type { Role } from "@/lib/types";

type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    instituteId: string | null;
    instituteName?: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

export function RoleLoginForm({
  heading,
  subheading,
  roleLabel,
  expectedRole,
  redirectPath,
  buttonLabel,
  placeholder = "name@institute.com",
}: {
  heading: string;
  subheading: string;
  roleLabel: string;
  expectedRole: Role;
  redirectPath: string;
  buttonLabel: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/login", { email, password });
      if (data.user.role !== expectedRole) {
        clearSession();
        toast({
          variant: "destructive",
          title: `This portal is for ${roleLabel} only`,
          description: "This account belongs to a different role. Use the correct sign-in portal.",
        });
        return;
      }
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("ax_session", JSON.stringify(data.user));
      toast({ title: "Welcome back!", description: "Signed in successfully." });
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] p-6 rounded-xl flex flex-col gap-5 border border-border-subtle bg-surface hover:indigo-glow transition-shadow duration-150">
      <div className="flex flex-col gap-1.5 text-center">
        <div className="flex justify-center mb-1">
          <BrandLogo
            boxClass="w-12 h-12 rounded-xl"
            iconClass="h-7 w-7"
            showText={false}
          />
        </div>
        <h1 className="font-semibold text-2xl text-text-heading tracking-tight">{heading}</h1>
        <p className="text-sm text-text-muted">{subheading}</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-on-surface">Email address</Label>
            <Input id="email" name="email" type="email" placeholder={placeholder} required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Label htmlFor="password" className="text-on-surface">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-accent hover:underline underline-offset-4"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <Checkbox id="remember" />
              Remember me
            </label>
            <Link
              href="/login"
              className="text-sm text-on-surface font-medium hover:text-indigo-accent transition-colors"
            >
              All sign-in options
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : buttonLabel}
        </Button>
      </form>
    </div>
  );
}

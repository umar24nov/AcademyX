"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BrandLogo } from "@/components/layout/brand-logo";
import { api, setTokens } from "@/lib/api";

type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    instituteId: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
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
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("ax_session", JSON.stringify(data.user));
      toast({ title: "Welcome back!", description: "Signed in successfully." });
      const role = data.user.role;
      if (role === "SUPER_ADMIN") router.push("/dashboard/super-admin");
      else if (role === "INSTITUTE_ADMIN") router.push("/dashboard/admin");
      else if (role === "TEACHER") router.push("/dashboard/teacher");
      else router.push("/dashboard/student");
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
    <div className="flex flex-col min-h-screen relative">
      <Link
        href="/"
        aria-label="Close and return to home"
        className="fixed top-4 left-4 z-10 h-10 w-10 rounded-lg border border-border-subtle bg-surface flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 transition-colors"
      >
        <X className="h-5 w-5" />
      </Link>
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-8">
        <div className="w-full max-w-[420px] p-6 rounded-xl flex flex-col gap-5 border border-border-subtle bg-surface hover:indigo-glow transition-shadow duration-150">
          <div className="flex flex-col gap-1.5 text-center">
            <div className="flex justify-center mb-1">
              <BrandLogo
                boxClass="w-12 h-12 rounded-xl"
                iconClass="h-7 w-7"
                showText={false}
              />
            </div>
            <h1 className="font-semibold text-2xl text-text-heading tracking-tight">
              Welcome back to AcademyX
            </h1>
            <p className="text-sm text-text-muted">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-on-surface">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="name@institute.com" required autoFocus />
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
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm font-normal text-text-muted">
                Keep me logged in for 30 days
              </Label>
            </div>
            <Button type="submit" className="w-full py-3" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to AcademyX"}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-on-surface font-semibold hover:text-indigo-accent transition-colors">
              Create one for free
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

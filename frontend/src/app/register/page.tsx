"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const instituteName = String(form.get("instituteName") ?? "");
    setLoading(true);
    try {
      await api.post("/auth/register", {
        instituteName,
        slug: slugify(instituteName) || `institute-${Date.now()}`,
        adminName: String(form.get("name") ?? ""),
        adminEmail: String(form.get("email") ?? ""),
        adminPassword: String(form.get("password") ?? ""),
      });
      toast({
        title: "Institute created",
        description: "You can now sign in with your admin account.",
      });
      router.push("/login");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-[460px] p-8 rounded-xl flex flex-col gap-8 border border-border-subtle bg-surface hover:indigo-glow transition-shadow duration-150">
          <div className="flex flex-col gap-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <GraduationCap className="h-7 w-7" />
              </div>
            </div>
            <h1 className="font-semibold text-2xl text-text-heading tracking-tight">
              Create your institute
            </h1>
            <p className="text-sm text-text-muted">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="instituteName" className="text-on-surface">Institute name</Label>
              <Input id="instituteName" name="instituteName" placeholder="e.g. Vantage Academy" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-on-surface">Full name</Label>
              <Input id="name" name="name" placeholder="Alex Rivera" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-on-surface">Work email</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-on-surface">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-on-surface">Institute size</Label>
              <Select defaultValue="1-50">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50">1 - 50 students</SelectItem>
                  <SelectItem value="51-200">51 - 200 students</SelectItem>
                  <SelectItem value="201-1000">201 - 1000 students</SelectItem>
                  <SelectItem value="1000+">1000+ students</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Institute"}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-on-surface font-semibold hover:text-indigo-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

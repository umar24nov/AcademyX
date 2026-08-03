"use client";

import Link from "next/link";
import { ChevronRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

const portals = [
  {
    href: "/login/student",
    icon: GraduationCap,
    title: "Login as Student",
    description: "Courses, live classes, assignments and exams.",
    accent: "text-primary bg-primary/10",
  },
  {
    href: "/login/teacher",
    icon: Users,
    title: "Login as Teacher",
    description: "Batches, lectures, attendance and grading.",
    accent: "text-indigo-accent bg-indigo-accent/10",
  },
];

export default function LoginPortalPage() {
  return (
    <AuthShell backHref="/">
      <div className="w-full max-w-[480px] flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandLogo
            boxClass="w-14 h-14 rounded-2xl"
            iconClass="h-8 w-8"
            showText={false}
          />
          <h1 className="font-semibold text-2xl text-text-heading tracking-tight">
            Welcome to AcademyX
          </h1>
          <p className="text-sm text-text-muted">
            Choose how you&apos;d like to sign in to your account.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="group flex items-center gap-4 p-5 rounded-xl border border-border-subtle bg-surface hover:border-primary/40 hover:indigo-glow transition-all"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", portal.accent)}>
                <portal.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {portal.title}
                </p>
                <p className="text-sm text-text-muted">{portal.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/login/admin"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            Institute admin? Log in here
          </Link>
        </div>

        <p className="text-center text-sm text-text-muted">
          New here?{" "}
          <Link
            href="/register"
            className="text-on-surface font-semibold hover:text-indigo-accent transition-colors"
          >
            Create your institute
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

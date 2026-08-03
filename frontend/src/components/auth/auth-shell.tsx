"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";

export function AuthShell({
  children,
  backHref = "/",
  backLabel = "Close and return to home",
}: {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="fixed top-4 left-4 z-10 h-10 w-10 rounded-lg border border-border-subtle bg-surface flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 transition-colors"
      >
        <X className="h-5 w-5" />
      </Link>
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

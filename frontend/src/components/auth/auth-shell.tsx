"use client";

import type { ReactNode } from "react";
import { SiteFooter } from "@/components/marketing/site-footer";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { currentUser } from "@/lib/mock-data";
import { getStoredUser } from "@/lib/api";
import type { UserSession } from "@/lib/types";

const mockSession: UserSession = {
  id: currentUser.id,
  name: currentUser.name,
  email: currentUser.email,
  role: currentUser.role,
  instituteId: currentUser.instituteId,
  instituteName: currentUser.instituteName,
  avatar: currentUser.avatar,
};

function useSession(): UserSession {
  const [user, setUser] = React.useState<UserSession>(mockSession);
  React.useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser({ ...mockSession, ...stored });
  }, []);
  return user;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = useSession();

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar user={user} />
        </SheetContent>
      </Sheet>
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav user={user} onMenuClick={() => setMobileOpen(true)} />
        <div className="flex-1 p-6 md:p-8 max-w-[1280px] w-full mx-auto">{children}</div>
        <footer className="w-full py-8 mt-auto border-t border-border-subtle bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1280px] mx-auto gap-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <BrandLogo boxClass="w-8 h-8 rounded-md" iconClass="h-4 w-4" textClass="text-lg text-primary" />
              <p className="text-sm text-text-muted">
                © 2026 {user.instituteName ?? "AcademyX"}. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <a className="text-sm text-text-muted hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="text-sm text-text-muted hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
              <a className="text-sm text-text-muted hover:text-primary transition-colors" href="#">
                Documentation
              </a>
            </div>
          </div>
        </footer>
      </main>
      <MobileBottomNav user={user} />
    </div>
  );
}

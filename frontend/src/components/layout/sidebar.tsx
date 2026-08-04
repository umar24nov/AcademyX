"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LifeBuoy, LogOut, Sparkles } from "lucide-react";
import { getNavForRole } from "@/config/navigation";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { dashboardPathFor, signOut } from "@/lib/api";
import type { UserSession } from "@/lib/types";

export function Sidebar({ user }: { user: UserSession }) {
  const pathname = usePathname();
  const router = useRouter();
  const main = getNavForRole(user.role, "main");
  const manage = getNavForRole(user.role, "manage");

  const isLearner = user.role === "STUDENT";
  const isTeacher = user.role === "TEACHER";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface border-r border-border-subtle flex-col p-4 gap-2 z-40">
      <Link href={dashboardPathFor(user.role)} className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-semibold text-lg text-text-heading leading-tight tracking-tight">
            AcademyX
          </h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">
            {user.role === "SUPER_ADMIN" ? "Platform Admin" : user.instituteName ?? "Institute"}
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {main.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
        {manage.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest text-text-muted font-mono">
              Manage
            </div>
            {manage.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border-subtle pt-4">
        {isTeacher ? (
          <Link
            href="/curriculum/courses"
            className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-2.5 rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all indigo-glow mb-4"
          >
            <Icon name="menu_book" className="h-4 w-4" />
            Manage Courses
          </Link>
        ) : isLearner ? (
          <Link
            href="/courses"
            className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-2.5 rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all indigo-glow mb-4"
          >
            <Icon name="menu_book" className="h-4 w-4" />
            My Courses
          </Link>
        ) : (
          <div className="p-4 bg-surface-container-high rounded-xl mb-4">
            <p className="text-sm text-on-surface mb-2">Need more seats?</p>
            <Link
              href="/settings/billing"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade Plan
            </Link>
          </div>
        )}
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors duration-150 cursor-pointer"
        >
          <LifeBuoy className="h-5 w-5" />
          <span className="text-sm">Help</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors duration-150 cursor-pointer text-left"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: { label: string; href: string; icon: string };
  pathname: string;
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]",
        active
          ? "bg-secondary-container text-on-secondary-container font-semibold active-glow"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
      )}
    >
      <Icon name={item.icon} className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
}

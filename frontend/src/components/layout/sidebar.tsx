"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LifeBuoy, LogOut, Sparkles } from "lucide-react";
import { getNavForRole } from "@/config/navigation";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { dashboardPathFor, signOut } from "@/lib/api";
import type { UserSession } from "@/lib/types";

export function Sidebar({ user, mobile = false }: { user: UserSession; mobile?: boolean }) {
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
    <aside
      className={cn(
        "flex-col bg-surface border-r border-border-subtle overflow-hidden",
        mobile
          ? "relative flex h-full w-full p-3 gap-1"
          : "hidden md:flex h-screen w-64 fixed left-0 top-0 p-4 gap-2 z-40"
      )}
    >
      <Link
        href={dashboardPathFor(user.role)}
        className={cn(
          "flex items-center rounded-lg transition-colors",
          mobile ? "gap-2 px-1 py-2 mb-2" : "gap-3 px-2 py-4 mb-4"
        )}
      >
        <div className={cn(
          "rounded-lg bg-primary flex items-center justify-center text-primary-foreground",
          mobile ? "w-8 h-8" : "w-10 h-10"
        )}>
          <GraduationCap className={mobile ? "h-4 w-4" : "h-6 w-6"} />
        </div>
        {!mobile && (
          <div>
            <h1 className="font-semibold text-lg text-text-heading leading-tight tracking-tight">
              AcademyX
            </h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">
              {user.role === "SUPER_ADMIN" ? "Platform Admin" : user.instituteName ?? "Institute"}
            </p>
          </div>
        )}
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {main.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} mobile={mobile} />
        ))}
        {manage.length > 0 && (
          <>
            <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-text-muted font-mono">
              Manage
            </div>
            {manage.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} mobile={mobile} />
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border-subtle pt-3">
        {isTeacher ? (
          <Link
            href="/curriculum/courses"
            className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-2 rounded-lg text-[13px] font-medium hover:opacity-90 active:scale-95 transition-all indigo-glow mb-3"
          >
            <Icon name="menu_book" className="h-4 w-4" />
            Manage Courses
          </Link>
        ) : isLearner ? (
          <Link
            href="/courses"
            className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-2 rounded-lg text-[13px] font-medium hover:opacity-90 active:scale-95 transition-all indigo-glow mb-3"
          >
            <Icon name="menu_book" className="h-4 w-4" />
            My Courses
          </Link>
        ) : (
          <div className="p-3 bg-surface-container-high rounded-xl mb-3">
            {!mobile && <p className="text-sm text-on-surface mb-2">Need more seats?</p>}
            <Link
              href="/settings/billing"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-lg text-[13px] font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade Plan
            </Link>
          </div>
        )}
        <Link
          href="/support"
          className={cn(
            "flex items-center rounded-lg transition-colors duration-150 cursor-pointer",
            mobile ? "gap-2 px-2 py-2 text-[13px]" : "gap-3 px-3 py-2 text-sm"
          )}
        >
          <LifeBuoy className="h-5 w-5" />
          <span className="truncate">Help</span>
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center rounded-lg transition-colors duration-150 cursor-pointer text-left",
            mobile ? "gap-2 px-2 py-2 text-[13px]" : "gap-3 px-3 py-2 text-sm"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  pathname,
  mobile = false,
}: {
  item: { label: string; href: string; icon: string };
  pathname: string;
  mobile?: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center min-w-0 rounded-lg font-medium transition-all duration-150 active:scale-[0.98]",
        mobile
          ? "gap-2 px-2 py-2 text-[13px]"
          : "gap-3 px-3 py-2.5 text-sm",
        active
          ? "bg-secondary-container text-on-secondary-container font-semibold active-glow"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
      )}
    >
      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

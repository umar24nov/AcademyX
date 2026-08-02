"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAllNav } from "@/config/navigation";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/lib/types";

export function MobileBottomNav({ user }: { user: UserSession }) {
  const pathname = usePathname();
  const items = getAllNav(user.role).slice(0, 4);
  const settingsActive = pathname.startsWith("/settings");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-highest border-t border-border-subtle flex justify-around items-center z-50 pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3",
              active ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
      <Link
        href="/settings"
        className={cn(
          "flex flex-col items-center gap-1 py-1 px-3",
          settingsActive ? "text-primary" : "text-on-surface-variant"
        )}
      >
        <Icon name="settings" className="h-5 w-5" />
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </nav>
  );
}

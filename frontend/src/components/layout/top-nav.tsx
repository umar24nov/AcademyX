"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { notifications } from "@/lib/mock-data";
import type { UserSession } from "@/lib/types";

export function TopNav({
  user,
  onMenuClick,
}: {
  user: UserSession;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle h-16 flex items-center px-6">
      <div className="flex-1 flex items-center gap-4">
        <button
          className="md:hidden p-2 text-on-surface-variant hover:text-primary"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            className="pl-10 bg-surface-container-lowest"
            placeholder="Search records, students, or staff..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-text-muted hover:text-primary">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px]">{unread}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="px-2 py-2 hover:bg-surface-container-high rounded-md cursor-pointer">
                <p className="text-sm text-on-surface">{n.title}</p>
                <p className="text-xs text-text-muted">{n.time}</p>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/settings" className="p-2 text-text-muted hover:text-primary">
          <Settings className="h-5 w-5" />
        </Link>
        <div className="h-8 w-px bg-border-subtle mx-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 focus:outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-on-surface">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  {user.role.replace("_", " ").toLowerCase()}
                </p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs text-text-muted pt-0">{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/login")}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

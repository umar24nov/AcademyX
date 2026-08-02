"use client";

import { Icon } from "@/components/shared/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const typeIcon: Record<string, string> = {
  course: "menu_book",
  student: "school",
  lecture: "play_circle",
  payment: "payments",
  attendance: "verified_user",
  exam: "assignment",
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: string;
};

export function ActivityFeed({
  activities,
  limit,
}: {
  activities: ActivityItem[];
  limit?: number;
}) {
  const items = limit ? activities.slice(0, limit) : activities;
  return (
    <div className="divide-y divide-border-subtle">
      {items.map((a) => (
        <div key={a.id} className="p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              <Icon name={typeIcon[a.type] ?? "info"} className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-on-surface">
              <span className="font-semibold">{a.actor}</span> {a.action}
              <span className="text-primary font-medium"> {a.target}</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

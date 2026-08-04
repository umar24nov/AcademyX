"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon?: string;
  onSelect: () => void;
  danger?: boolean;
  separator?: boolean;
}

export function RowActionsMenu({
  actions,
  iconClassName = "h-4 w-4",
  triggerClassName,
}: {
  actions: RowAction[];
  iconClassName?: string;
  triggerClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 text-text-muted", triggerClassName)}
          aria-label="Row actions"
        >
          <Icon name="more_vert" className={iconClassName} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((a) => (
          <React.Fragment key={a.label}>
            {a.separator ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              onClick={a.onSelect}
              className={cn(a.danger && "text-error focus:bg-surface-container-high focus:text-error")}
            >
              {a.icon ? <Icon name={a.icon} className="h-4 w-4" /> : null}
              <span>{a.label}</span>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

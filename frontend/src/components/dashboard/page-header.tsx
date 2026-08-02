"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="font-bold text-4xl tracking-tight text-text-heading">{title}</h2>
        {description && <p className="text-text-muted text-base mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function ExportButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      <Icon name="download" className="h-4 w-4" />
      Export
    </Button>
  );
}

export function NewButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Button onClick={onClick}>
      <Icon name="add" className="h-4 w-4" />
      {children}
    </Button>
  );
}

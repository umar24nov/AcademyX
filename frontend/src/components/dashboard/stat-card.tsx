"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
  meta?: { text: string; tone?: "muted" | "error" };
  pulse?: boolean;
  accent?: "primary" | "tertiary" | "error" | "success";
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp = true,
  sub,
  meta,
  pulse,
  accent = "primary",
}: StatCardProps) {
  return (
    <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon name={icon} className="h-28 w-28" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            "p-2 rounded-lg",
            accent === "primary" && "bg-primary-container/10 text-primary-container",
            accent === "tertiary" && "bg-tertiary-container/10 text-tertiary",
            accent === "error" && "bg-error-container/10 text-error",
            accent === "success" && "bg-success-green/10 text-success-green"
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "font-mono text-xs flex items-center gap-1",
              trendUp ? "text-success-green" : "text-error"
            )}
          >
            {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend}
          </span>
        )}
        {!trend && pulse && (
          <span className="flex h-2 w-2 rounded-full bg-success-green animate-pulse" />
        )}
        {!trend && !pulse && meta && (
          <span
            className={cn(
              "font-mono text-xs",
              meta.tone === "error" ? "text-error" : "text-text-muted"
            )}
          >
            {meta.text}
          </span>
        )}
      </div>
      <p className="text-text-muted text-sm uppercase tracking-wide">{label}</p>
      <h3 className="text-text-heading font-bold text-4xl mt-1">{value}</h3>
      {sub && <p className="text-xs text-text-muted mt-2">{sub}</p>}
    </div>
  );
}

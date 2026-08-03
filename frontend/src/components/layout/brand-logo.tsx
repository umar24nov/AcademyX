"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { dashboardPathFor, getStoredUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export function BrandLogo({
  boxClass = "h-9 w-9 rounded-lg",
  iconClass = "h-5 w-5",
  textClass = "text-xl",
  showText = true,
  className,
}: {
  boxClass?: string;
  iconClass?: string;
  textClass?: string;
  showText?: boolean;
  className?: string;
}) {
  const [href, setHref] = React.useState("/");

  React.useEffect(() => {
    const user = getStoredUser();
    if (user) setHref(dashboardPathFor(user.role));
  }, []);

  return (
    <Link
      href={href}
      aria-label="AcademyX home"
      className={cn("flex items-center gap-2", className)}
    >
      <div
        className={cn(
          "bg-primary flex items-center justify-center text-primary-foreground",
          boxClass
        )}
      >
        <GraduationCap className={iconClass} />
      </div>
      {showText && (
        <span className={cn("font-semibold text-text-heading tracking-tight", textClass)}>
          AcademyX
        </span>
      )}
    </Link>
  );
}

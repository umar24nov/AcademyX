"use client";

import * as React from "react";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStoredUser } from "@/lib/live";
import { fetchOnboardingState, type OnboardingState } from "@/lib/live-data";

export function OnboardingBanner() {
  const [state, setState] = React.useState<OnboardingState | null>(null);
  const user = useStoredUser();

  React.useEffect(() => {
    if (user?.role !== "INSTITUTE_ADMIN" || !user.instituteId) return;
    let cancelled = false;
    fetchOnboardingState(user.instituteId).then((s) => {
      if (!cancelled && s) setState(s);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!state || state.complete) return null;

  const pct = Math.round((state.done.length / state.total) * 100);

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="h-4 w-4 text-primary" />
          <p className="font-semibold text-text-heading text-sm">Finish setting up {state.instituteName}</p>
        </div>
        <p className="text-sm text-text-muted mb-3">
          Complete {state.total - state.done.length} more step{state.total - state.done.length === 1 ? "" : "s"} to unlock
          the full AcademyX experience.
        </p>
        <Progress value={pct} className="h-1.5 max-w-sm" />
      </div>
      <Button asChild className="shrink-0">
        <Link href="/onboarding">
          Continue setup ({state.done.length}/{state.total})
        </Link>
      </Button>
    </div>
  );
}

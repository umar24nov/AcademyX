"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { dashboardPathFor, getStoredUser } from "@/lib/api";

export default function DashboardIndexPage() {
  const router = useRouter();

  React.useEffect(() => {
    const user = getStoredUser();
    router.replace(user ? dashboardPathFor(user.role) : "/login");
  }, [router]);

  return null;
}

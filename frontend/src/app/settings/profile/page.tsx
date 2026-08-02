"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { getStoredUser, signOut } from "@/lib/api";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { UserSession } from "@/lib/types";

interface MeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institute?: { id: string; name: string; slug: string } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = React.useState<UserSession | null>(null);
  React.useEffect(() => {
    setSession(getStoredUser());
  }, []);
  const me = useLive<MeUser | null>(
    async () => {
      try {
        const res = await api.get<{ user: MeUser }>("/auth/me");
        return res.user;
      } catch {
        return null;
      }
    },
    null
  );

  const user = me ?? session;
  const name = user?.name ?? "—";
  const email = user?.email ?? "—";
  const role = user?.role ?? "INSTITUTE_ADMIN";
  const instituteName = me?.institute?.name ?? session?.instituteName;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Profile"
          description="View and manage your account information."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Your account details as registered in AcademyX.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary-container/20 text-primary text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-text-heading">{name}</p>
                  <p className="text-sm text-text-muted">{email}</p>
                  <Badge variant="default" className="mt-1.5 capitalize">
                    {role.replace("_", " ").toLowerCase()}
                  </Badge>
                </div>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <dt className="text-xs text-text-muted mb-1">Full Name</dt>
                  <dd className="text-sm font-medium text-on-surface">{name}</dd>
                </div>
                <div className="p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <dt className="text-xs text-text-muted mb-1">Email Address</dt>
                  <dd className="text-sm font-medium text-on-surface">{email}</dd>
                </div>
                <div className="p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <dt className="text-xs text-text-muted mb-1">Role</dt>
                  <dd className="text-sm font-medium text-on-surface capitalize">
                    {role.replace("_", " ").toLowerCase()}
                  </dd>
                </div>
                <div className="p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <dt className="text-xs text-text-muted mb-1">Institute</dt>
                  <dd className="text-sm font-medium text-on-surface">{instituteName ?? "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Keep your account safe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/forgot-password">
                    <Icon name="lock" className="h-4 w-4" />
                    Reset Password
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Icon name="settings" className="h-4 w-4" />
                    Account Settings
                  </Link>
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                  <Icon name="logout" className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need help?</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/support">
                    <Icon name="help" className="h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

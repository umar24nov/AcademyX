"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function SuperAdminLoginPage() {
  return (
    <AuthShell backHref="/" backLabel="Close and return to home">
      <RoleLoginForm
        heading="Platform admin login"
        subheading="Restricted access for AcademyX platform owners."
        roleLabel="platform admins"
        expectedRole="SUPER_ADMIN"
        redirectPath="/dashboard/super-admin"
        buttonLabel="Sign in as Platform Admin"
        placeholder="owner@academyx.app"
      />
    </AuthShell>
  );
}

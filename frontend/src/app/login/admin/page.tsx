"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function InstituteAdminLoginPage() {
  return (
    <AuthShell backHref="/login" backLabel="Back to sign-in options">
      <RoleLoginForm
        heading="Institute admin login"
        subheading="Sign in to manage your institute's operations and staff."
        roleLabel="institute admins"
        expectedRole="INSTITUTE_ADMIN"
        redirectPath="/dashboard/admin"
        buttonLabel="Sign in as Institute Admin"
        placeholder="admin@institute.com"
      />
    </AuthShell>
  );
}

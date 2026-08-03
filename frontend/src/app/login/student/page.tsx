"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function StudentLoginPage() {
  return (
    <AuthShell backHref="/login" backLabel="Back to sign-in options">
      <RoleLoginForm
        heading="Student login"
        subheading="Sign in to access your courses, live classes and exams."
        roleLabel="students"
        expectedRole="STUDENT"
        redirectPath="/dashboard/student"
        buttonLabel="Sign in as Student"
        placeholder="student@institute.com"
      />
    </AuthShell>
  );
}

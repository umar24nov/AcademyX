"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function TeacherLoginPage() {
  return (
    <AuthShell>
      <RoleLoginForm
        heading="Teacher login"
        subheading="Sign in to manage your batches, lectures and grading."
        roleLabel="teachers"
        expectedRole="TEACHER"
        redirectPath="/dashboard/teacher"
        buttonLabel="Sign in as Teacher"
        placeholder="teacher@institute.com"
      />
    </AuthShell>
  );
}

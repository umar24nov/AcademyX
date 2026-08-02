"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import { useLive } from "@/lib/live";
import {
  fetchInstituteProfile,
  mockInstituteProfile,
  updateInstituteProfile,
} from "@/lib/live-data";

export default function SettingsPage() {
  const { toast } = useToast();
  const profile = useLive(fetchInstituteProfile, mockInstituteProfile);

  const [form, setForm] = React.useState({
    name: mockInstituteProfile.name,
    contactEmail: mockInstituteProfile.contactEmail ?? "",
    phone: mockInstituteProfile.phone ?? "",
    address: mockInstituteProfile.address ?? "",
    about: mockInstituteProfile.about ?? "",
  });
  const [academic, setAcademic] = React.useState({
    gradingSystem: mockInstituteProfile.gradingSystem ?? "percentage",
    passingMarks: String(mockInstituteProfile.passingMarks ?? 40),
    attendanceThreshold: String(mockInstituteProfile.attendanceThreshold ?? 75),
    academicYear: mockInstituteProfile.academicYear ?? "2025-26",
  });

  React.useEffect(() => {
    if (profile && profile.id) {
      setForm({
        name: profile.name ?? mockInstituteProfile.name,
        contactEmail: profile.contactEmail ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        about: profile.about ?? "",
      });
      setAcademic({
        gradingSystem: profile.gradingSystem ?? "percentage",
        passingMarks: String(profile.passingMarks ?? 40),
        attendanceThreshold: String(profile.attendanceThreshold ?? 75),
        academicYear: profile.academicYear ?? "2025-26",
      });
    }
  }, [profile]);

  const save = async (label: string, patch: Record<string, unknown>) => {
    const ok = await updateInstituteProfile(profile.id, patch);
    toast({
      title: ok ? "Settings saved" : "Could not save settings",
      description: ok
        ? `${label} has been updated successfully.`
        : "Make sure you are logged in as an institute admin and try again.",
      variant: ok ? undefined : "destructive",
    });
  };

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Settings"
          description="Manage institute settings, branding and preferences."
        />

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Institute Information</CardTitle>
                <CardDescription>Basic details about your institute shown across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Institute Name</span>
                  <Input value={form.name} onChange={setField("name")} />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Contact Email</span>
                  <Input value={form.contactEmail} onChange={setField("contactEmail")} />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Phone</span>
                  <Input value={form.phone} onChange={setField("phone")} />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Address</span>
                  <Input value={form.address} onChange={setField("address")} />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm text-text-muted mb-1.5 block">About</span>
                  <Textarea rows={3} value={form.about} onChange={setField("about")} />
                </label>
              </CardContent>
              <div className="px-6 pb-6">
                <Button onClick={() => save("Institute information", form)}>
                  <Icon name="save" className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize the logo and theme applied to student-facing portals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-sm text-text-muted mb-2 block">Logo</span>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                      VI
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Icon name="upload" className="h-4 w-4" />
                        Upload Logo
                      </Button>
                      <Button variant="ghost">Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-text-muted mb-1.5 block">Primary Color</span>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#6366f1" className="h-10 w-14 rounded border border-border-subtle bg-surface-container-low cursor-pointer" />
                      <Input className="font-mono" defaultValue="#6366f1" />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm text-text-muted mb-1.5 block">Accent Color</span>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#37cd8f" className="h-10 w-14 rounded border border-border-subtle bg-surface-container-low cursor-pointer" />
                      <Input className="font-mono" defaultValue="#37cd8f" />
                    </div>
                  </label>
                </div>

                <div className="p-4 rounded-lg border border-border-subtle bg-surface-container-low flex items-center justify-between">
                  <div>
                    <p className="font-medium text-on-surface">Preview</p>
                    <p className="text-xs text-text-muted">See how your branding appears on the login page</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Icon name="visibility" className="h-4 w-4" />
                    View Preview
                  </Button>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button onClick={() => toast({ title: "Settings saved", description: "Branding has been updated successfully." })}>
                  <Icon name="save" className="h-4 w-4" />
                  Save Branding
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="academics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Preferences</CardTitle>
                <CardDescription>Configure grading, attendance and academic defaults.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Grading System</span>
                  <Select value={academic.gradingSystem} onValueChange={(v) => setAcademic((p) => ({ ...p, gradingSystem: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                      <SelectItem value="gpa">GPA (0-10)</SelectItem>
                      <SelectItem value="cgpa">CGPA (0-10)</SelectItem>
                      <SelectItem value="letter">Letter Grades</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Passing Marks (%)</span>
                  <Input
                    className="font-mono"
                    value={academic.passingMarks}
                    onChange={(e) => setAcademic((p) => ({ ...p, passingMarks: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Attendance Threshold (%)</span>
                  <Input
                    className="font-mono"
                    value={academic.attendanceThreshold}
                    onChange={(e) => setAcademic((p) => ({ ...p, attendanceThreshold: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Academic Year</span>
                  <Select value={academic.academicYear} onValueChange={(v) => setAcademic((p) => ({ ...p, academicYear: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </CardContent>
              <div className="px-6 pb-6">
                <Button onClick={() => save("Academic preferences", {
                  gradingSystem: academic.gradingSystem,
                  passingMarks: Number(academic.passingMarks),
                  attendanceThreshold: Number(academic.attendanceThreshold),
                  academicYear: academic.academicYear,
                })}>
                  <Icon name="save" className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose which events trigger email and SMS notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: "New student enrollment", desc: "Notify admin when a student enrolls", on: true },
                  { label: "Fee payment received", desc: "Send confirmation to student and guardian", on: true },
                  { label: "Assignment submitted", desc: "Alert the course teacher", on: true },
                  { label: "Exam published", desc: "Broadcast to the target batch", on: false },
                  { label: "Live class reminders", desc: "30 minutes before a scheduled class", on: true },
                  { label: "Attendance warnings", desc: "When a student drops below threshold", on: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                    <div>
                      <p className="font-medium text-on-surface">{n.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.on} />
                  </div>
                ))}
              </CardContent>
              <div className="px-6 pb-6">
                <Button onClick={() => toast({ title: "Settings saved", description: "Notification preferences have been updated successfully." })}>
                  <Icon name="save" className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage authentication policies and session rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <div>
                    <p className="font-medium text-on-surface">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-text-muted mt-0.5">Require OTP verification for all admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <div>
                    <p className="font-medium text-on-surface">Single Sign-On (SSO)</p>
                    <p className="text-xs text-text-muted mt-0.5">Enable SAML/OAuth login for your domain</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                  <div>
                    <p className="font-medium text-on-surface">Session Timeout</p>
                    <p className="text-xs text-text-muted mt-0.5">Automatically log out inactive users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="p-4 rounded-lg border border-error/30 bg-error-container/10 flex items-start gap-3">
                  <Icon name="warning" className="h-5 w-5 text-error mt-0.5" />
                  <div>
                    <p className="font-medium text-on-surface">Danger Zone</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Deleting your institute is permanent. All courses, students and data will be removed.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3">Delete Institute</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

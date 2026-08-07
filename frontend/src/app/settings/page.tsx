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
          title="Portal Customization"
          description="Manage your institute's public appearance, branding assets, and domain configuration."
        />

        <Tabs defaultValue="branding">
          <TabsList className="w-full h-auto flex-col items-stretch gap-1 justify-start rounded-xl p-1.5 md:w-auto md:h-10 md:flex-row md:items-center md:gap-0 md:rounded-lg md:p-1">
            <TabsTrigger value="branding" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              Branding
            </TabsTrigger>
            <TabsTrigger value="general" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              General
            </TabsTrigger>
            <TabsTrigger value="domain" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              Domain
            </TabsTrigger>
            <TabsTrigger value="integrations" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="academics" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              Academics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start px-4 py-2.5 md:w-auto md:justify-center md:px-3 md:py-1.5">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Basic information about your coaching institute.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Institute Name</span>
                  <Input value={form.name} onChange={setField("name")} />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Support Email</span>
                  <Input value={form.contactEmail} onChange={setField("contactEmail")} />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted mb-1.5 block">Contact Phone</span>
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
                  <span className="text-sm text-text-muted mb-2 block">Institute Logo</span>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-1 text-text-muted hover:border-primary transition-colors cursor-pointer">
                      <Icon name="upload" className="h-6 w-6" />
                      <span className="text-[10px] font-mono uppercase">SVG/PNG</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-text-muted">Recommended size 512x512px. Max size 2MB.</p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => toast({ title: "Upload logo", description: "Logo upload is mocked in this demo." })}
                        >
                          <Icon name="upload" className="h-4 w-4" />
                          Upload Logo
                        </Button>
                        <Button variant="ghost">Remove</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-text-muted mb-2 block">Primary Color</span>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#6366f1" className="h-10 w-14 rounded border border-border-subtle bg-surface-container-low cursor-pointer" />
                      <Input className="font-mono" defaultValue="#6366f1" />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-muted mb-2 block">Accent Color</span>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#37cd8f" className="h-10 w-14 rounded border border-border-subtle bg-surface-container-low cursor-pointer" />
                      <Input className="font-mono" defaultValue="#37cd8f" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {["#6366f1", "#ec4899", "#10b981", "#f59e0b"].map((c) => (
                        <button
                          key={c}
                          className="h-5 w-5 rounded-full border-2 border-border-subtle hover:border-on-surface transition-colors"
                          style={{ backgroundColor: c }}
                          aria-label={`Accent preset ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-text-muted mb-2 block">Portal Theme</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Dark Mode", active: true },
                      { label: "Light Mode", active: false },
                      { label: "Auto", active: false },
                    ].map((t) => (
                      <button
                        key={t.label}
                        className={`rounded-lg border p-4 text-sm font-medium transition-colors ${
                          t.active
                            ? "border-primary text-on-surface"
                            : "border-border-subtle text-text-muted hover:border-on-surface-variant"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
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

          <TabsContent value="domain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain</CardTitle>
                <CardDescription>Configure how users access your portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-sm text-text-muted mb-1.5 block">Subdomain</span>
                  <div className="flex items-center">
                    <Input className="rounded-r-none font-mono" defaultValue="enterprise" />
                    <span className="h-10 px-3 inline-flex items-center rounded-r-lg border border-l-0 border-border-subtle bg-surface-container-low font-mono text-sm text-text-muted">
                      .academyx.app
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border-subtle bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-on-surface">Custom Domain</span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono uppercase">
                      Enterprise Only
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Point your own domain to our servers using a CNAME record.
                  </p>
                  <Input placeholder="learn.yourdomain.com" disabled />
                  <Button disabled>
                    <Icon name="add" className="h-4 w-4" />
                    Add Domain
                  </Button>
                </div>
              </CardContent>
              <div className="px-6 pb-6 flex gap-2">
                <Button variant="ghost">Discard Changes</Button>
                <Button onClick={() => toast({ title: "Settings saved", description: "Domain configuration has been updated successfully." })}>
                  <Icon name="save" className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect external services to extend your portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Zoom Meetings", desc: "Schedule live classes directly from Zoom" },
                  { label: "Google Workspace", desc: "Single sign-on and calendar sync" },
                  { label: "Razorpay", desc: "Collect fees via UPI, cards and net banking" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                    <div>
                      <p className="font-medium text-on-surface">{n.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.label === "Razorpay"} />
                  </div>
                ))}
              </CardContent>
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

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowActionsMenu } from "@/components/dashboard/row-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useLive } from "@/lib/live";
import { downloadCsv } from "@/lib/csv";
import {
  fetchTeacherDashboard,
  mockTeacherDashboardData,
  fetchStudents,
  fetchBatches,
  type TeacherClassRow,
  type TeacherMaterialRow,
} from "@/lib/live-data";

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MATERIAL_TYPES = ["PDF", "Video", "ZIP", "Other"] as const;

function materialIconFor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("video")) return "play_circle";
  if (t.includes("zip")) return "folder_zip";
  return "description";
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadMaterialAsset(m: TeacherMaterialRow) {
  const slug =
    m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "material";
  const body = [
    "AcademyX Material",
    "-----------------",
    `Title: ${m.title}`,
    `Details: ${m.meta}`,
    "",
    "This is a placeholder asset for demo purposes.",
  ].join("\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TeacherDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const data = useLive(fetchTeacherDashboard, mockTeacherDashboardData);
  const [materials, setMaterials] = React.useState<TeacherMaterialRow[]>([]);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<TeacherMaterialRow | null>(null);
  const [batches, setBatches] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    setMaterials(data.materials);
  }, [data.materials]);

  React.useEffect(() => {
    fetchBatches().then((rows) => setBatches(rows.map((b) => ({ id: b.id, name: b.name }))));
  }, []);

  const performance = data.weeklyPerformance;
  const max = Math.max(...performance, 100);
  const nextClass = data.nextClass ?? data.upcomingClasses[0];
  const presentPct = data.attendanceToday.rate;
  const firstName = data.name.split(" ")[0];

  const handleExportStudents = async () => {
    const students = await fetchStudents();
    downloadCsv(
      "student-list",
      ["ID", "Name", "Email", "Course", "Batch", "Attendance", "Status"],
      students.map((s) => [s.studentId, s.name, s.email, s.course, s.batch, `${s.attendance}%`, s.status])
    );
    toast({ title: "Student list exported", description: `${students.length} students exported to CSV.` });
  };

  const handleSaveMaterial = (m: TeacherMaterialRow) => {
    setMaterials((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx === -1) return [m, ...prev];
      const copy = [...prev];
      copy[idx] = m;
      return copy;
    });
    toast({ title: "Material saved", description: `"${m.title}" was saved.` });
  };

  const removeMaterial = (id: string, title: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Material deleted", description: `"${title}" was removed from your materials.` });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`Good Morning, ${firstName}`}
          description={`You have ${data.stats.classesToday} classes today and ${data.stats.ungradedAssignments} ungraded assignments.`}
          actions={
            <>
              <Button variant="outline" onClick={() => setScheduleOpen(true)}>
                <Icon name="calendar_today" className="h-4 w-4" />
                View Schedule
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Icon name="add" className="h-4 w-4" />
                Create New Material
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Card className="md:col-span-8 relative overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Class Performance</CardTitle>
              <Badge variant="outline" className="font-mono">WEEKLY</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                {performance.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-lg transition-all cursor-pointer ${
                        i === 4
                          ? "bg-primary/60 hover:bg-primary/80 border-t-2 border-primary"
                          : "bg-primary/20 hover:bg-primary/40"
                      }`}
                      style={{ height: `${(h / max) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-mono text-text-muted px-2">
                {days.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Icon name="trending_up" className="h-24 w-24" />
            </div>
          </Card>

          <div className="md:col-span-4 flex flex-col gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-text-muted font-mono text-xs uppercase tracking-wider mb-1">
                      Attendance Today
                    </h3>
                    <span className="font-bold text-4xl text-text-heading">{presentPct}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-success-green/10 text-success-green">
                    <Icon name="check_circle" className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={presentPct} className="bg-surface-container-high [&>div]:bg-success-green" />
                  <p className="mt-2 text-sm text-text-muted">
                    {data.attendanceToday.present} of {data.attendanceToday.total} students present
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-xl font-semibold text-text-heading mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <QuickAction
                    icon="history_edu"
                    label="Grade Tasks"
                    onClick={() => router.push("/assignments/submissions")}
                  />
                  <QuickAction
                    icon="mail"
                    label="Message All"
                    onClick={() => router.push("/messages")}
                  />
                  <QuickAction
                    icon="calendar_today"
                    label="Reschedule"
                    onClick={() => router.push("/live-classes")}
                  />
                  <QuickAction
                    icon="download"
                    label="Export List"
                    onClick={handleExportStudents}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="md:col-span-12 lg:col-span-7 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <CardTitle>Recent Materials</CardTitle>
              <Button variant="link" className="text-primary" onClick={() => router.push("/lectures")}>
                View All
              </Button>
            </CardHeader>
            <div className="divide-y divide-border-subtle">
              {materials.map((m) => (
                <div key={m.id} className="p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <div className="h-12 w-12 rounded bg-surface-container-highest border border-border-subtle flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <Icon name={m.icon} className="h-6 w-6" />
                  </div>
                  <div className="flex-1" onClick={() => toast({ title: m.title, description: m.meta })}>
                    <h4 className="text-sm font-medium text-on-surface">{m.title}</h4>
                    <p className="text-xs text-text-muted">{m.meta}</p>
                  </div>
                  <RowActionsMenu
                    iconClassName="h-5 w-5"
                    triggerClassName="h-9 w-9"
                    actions={[
                      {
                        label: "Edit Details",
                        icon: "edit",
                        onSelect: () => {
                          setEditingMaterial(m);
                          setCreateOpen(true);
                        },
                      },
                      {
                        label: "Share with Class",
                        icon: "send",
                        onSelect: () =>
                          toast({ title: "Material shared", description: `"${m.title}" was shared with your class.` }),
                      },
                      {
                        label: "Download Asset",
                        icon: "download",
                        onSelect: () => downloadMaterialAsset(m),
                      },
                      {
                        label: "Delete",
                        icon: "delete",
                        danger: true,
                        separator: true,
                        onSelect: () => removeMaterial(m.id, m.title),
                      },
                    ]}
                  />
                </div>
              ))}
              {materials.length === 0 && (
                <div className="p-8 text-center text-text-muted text-sm">No materials yet. Create one to get started.</div>
              )}
            </div>
          </Card>

          {nextClass && (
            <Card className="md:col-span-12 lg:col-span-5 relative overflow-hidden hover:border-primary/30 hover:active-glow transition-all">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="default" className="font-mono">{nextClass.label}</Badge>
                    <span className="text-text-muted text-xs font-mono">
                      {nextClass.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-text-heading leading-tight mb-2">
                    {nextClass.title}
                  </h3>
                  <p className="text-text-muted text-sm mb-6">{nextClass.meta}</p>
                  <div className="flex -space-x-2">
                    {["JD", "AM", "KT"].map((ini) => (
                      <div key={ini} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                        {ini}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                      +{Math.max(data.stats.students - 3, 0)}
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full mt-8 bg-on-surface text-background hover:opacity-90">
                  <Link href={`/live-classes/session?id=${nextClass.id}`}>
                    <Icon name="video" className="h-4 w-4" />
                    Launch Live Session
                  </Link>
                </Button>
              </CardContent>
              <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none">
                <Icon name="group" className="h-44 w-44" />
              </div>
            </Card>
          )}
        </div>

        <button
          className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(192,193,255,0.4)] flex items-center justify-center active:scale-90 transition-transform"
          onClick={() => setCreateOpen(true)}
          aria-label="Create new material"
        >
          <Icon name="add" className="h-7 w-7" />
        </button>
      </div>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        classes={data.upcomingClasses}
        onReschedule={(c) => {
          setScheduleOpen(false);
          router.push("/live-classes");
          toast({ title: "Reschedule class", description: `Open "${c.title}" in live classes to reschedule.` });
        }}
      />

      <CreateMaterialDialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v);
          if (!v) setEditingMaterial(null);
        }}
        batches={batches}
        initial={editingMaterial}
        onSave={(m) => {
          handleSaveMaterial(m);
          setEditingMaterial(null);
          setCreateOpen(false);
        }}
      />
    </DashboardShell>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-surface-container border border-border-subtle rounded-lg hover:bg-surface-container-high transition-colors group active:scale-95"
    >
      <Icon name={icon} className="h-6 w-6 text-primary mb-2 transition-transform group-hover:scale-110" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function ScheduleDialog({
  open,
  onOpenChange,
  classes,
  onReschedule,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classes: TeacherClassRow[];
  onReschedule: (c: TeacherClassRow) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="calendar_today" className="h-5 w-5 text-primary" />
            Class Schedule
          </DialogTitle>
          <DialogDescription>
            {classes.length} upcoming class{classes.length === 1 ? "" : "es"} — open a session or reschedule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 p-5 bg-surface-container-low border border-border-subtle rounded-xl"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {c.label && (
                    <Badge variant={c.label === "NEXT CLASS" ? "default" : "secondary"} className="font-mono">
                      {c.label}
                    </Badge>
                  )}
                  <span className="text-xs text-text-muted font-mono">{c.time}</span>
                </div>
                <p className="text-base font-semibold text-on-surface truncate">{c.title}</p>
                <p className="text-sm text-text-muted truncate">{c.meta}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => onReschedule(c)}
                >
                  Reschedule
                </Button>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-center text-text-muted text-sm py-8">No classes scheduled.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateMaterialDialog({
  open,
  onOpenChange,
  batches,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batches: { id: string; name: string }[];
  initial: TeacherMaterialRow | null;
  onSave: (m: TeacherMaterialRow) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<string>(MATERIAL_TYPES[0]);
  const [batch, setBatch] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [publishState, setPublishState] = React.useState<"Draft" | "Published">("Published");
  const [attachment, setAttachment] = React.useState<{ name: string; size: number } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const editing = !!initial;

  React.useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setType(
      initial ? (MATERIAL_TYPES.find((t) => initial.meta.includes(t)) ?? MATERIAL_TYPES[0]) : MATERIAL_TYPES[0]
    );
    setBatch("");
    setDescription("");
    setPublishState("Published");
    setAttachment(null);
  }, [open, initial]);

  const handleSubmit = () => {
    const parts = [description.trim(), batch.trim() && `Batch: ${batch.trim()}`, attachment?.name]
      .filter(Boolean)
      .join(" • ");
    onSave({
      id: initial?.id ?? `m_${Date.now()}`,
      icon: materialIconFor(type),
      title: title.trim(),
      meta: `${type} • ${publishState}${parts ? ` • ${parts}` : ""}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="add" className="h-5 w-5 text-primary" />
            {editing ? "Edit Material" : "Create New Material"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details of this material."
              : "Author a learning material and share it with a batch."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="font-mono text-xs text-text-muted uppercase">Material Title</Label>
            <Input
              className="mt-2"
              placeholder="e.g. CSS Layouts Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Targeted Batch</Label>
              <Select value={batch} onValueChange={setBatch}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.length === 0 && (
                    <SelectItem value="__none__" disabled>No batches available</SelectItem>
                  )}
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="font-mono text-xs text-text-muted uppercase">Attachment</Label>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setAttachment({ name: f.name, size: f.size });
              }}
            />
            {attachment ? (
              <div className="mt-2 flex items-center justify-between gap-3 p-3 bg-surface-container-low border border-border-subtle rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon name="attach_file" className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{attachment.name}</p>
                    <p className="text-xs text-text-muted font-mono">{formatBytes(attachment.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-muted shrink-0"
                  onClick={() => {
                    setAttachment(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <Icon name="close" className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-2 w-full h-20 border-dashed flex-col gap-1.5"
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="cloud_upload" className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Click to attach a file</span>
              </Button>
            )}
          </div>

          <div>
            <Label className="font-mono text-xs text-text-muted uppercase">Publishing</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 p-1 bg-surface-container-low border border-border-subtle rounded-lg">
              {(["Draft", "Published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPublishState(s)}
                  className={cn(
                    "py-2 rounded-md text-sm font-medium transition-colors",
                    publishState === s
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-text-muted hover:text-on-surface"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="font-mono text-xs text-text-muted uppercase">Description</Label>
            <Textarea
              className="mt-2"
              placeholder="What does this material cover?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button
            disabled={!title.trim()}
            onClick={handleSubmit}
          >
            {editing ? "Update Material" : "Save Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

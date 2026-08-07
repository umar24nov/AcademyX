"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowActionsMenu } from "@/components/dashboard/row-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import { useLive, useStoredUser } from "@/lib/live";
import { fetchCourses, mockCoursesData } from "@/lib/live-data";
import { Search, GripVertical, Plus } from "lucide-react";

export default function CourseManagementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const courses = useLive(fetchCourses, mockCoursesData);
  const user = useStoredUser();
  const isAdmin = user?.role === "INSTITUTE_ADMIN";
  const canCreateCourses = isAdmin;

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Curriculum Builder"
          description="Manage your active courses and architectural framework."
          actions={
            <>
              <div className="flex -space-x-2">
                {["AV", "MT", "SC"].map((initials, idx) => (
                  <div
                    key={initials}
                    className={`h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-on-surface ${
                      idx === 0
                        ? "bg-primary-container"
                        : idx === 1
                          ? "bg-tertiary-container"
                          : "bg-secondary-container"
                    }`}
                  >
                    {initials}
                  </div>
                ))}
                <div className="h-8 w-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-text-muted">
                  +12
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  toast({ title: "Filters", description: "Filter courses by track, status and instructor." })
                }
              >
                <Icon name="filter_list" className="h-4 w-4" />
                Filters
              </Button>
              {canCreateCourses && (
                <Button onClick={() => setModalOpen(true)}>
                  <Icon name="add" className="h-4 w-4" />
                  New Course
                </Button>
              )}
            </>
          }
        />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h3 className="font-mono text-sm text-primary uppercase tracking-widest">
                Active Courses ({filtered.length})
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    className="pl-10 h-9"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() =>
                    toast({ title: "All courses", description: `${filtered.length} active courses are shown here.` })
                  }
                >
                  View All
                </button>
              </div>
            </div>

            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-surface-container-low border border-border-subtle p-4 rounded-xl flex gap-4 hover:border-primary transition-all group"
              >
                <div className="w-32 h-20 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/30 via-surface-container-highest to-tertiary/20 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300">
                  <Icon name="menu_book" className="h-8 w-8 text-primary/80" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-text-heading group-hover:text-primary transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-text-muted text-xs font-mono mt-1">
                        {c.code} • {c.track}
                      </p>
                    </div>
                    {c.status === "Published" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase bg-success-green/10 text-success-green border-success-green/20">
                        {c.status}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase bg-primary/10 text-primary border-primary/20">
                        {c.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Icon name="group" className="h-4 w-4" />
                      <span className="text-xs">{c.enrolled.toLocaleString()} Enrolled</span>
                    </div>
                    {c.status === "Draft" ? (
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Icon name="schedule" className="h-4 w-4" />
                        <span className="text-xs">Modified 2h ago</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Icon name="star" className="h-4 w-4" />
                        <span className="text-xs">
                          {c.rating > 0 ? `${c.rating} (${c.reviews.toLocaleString()})` : "No reviews"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <RowActionsMenu
                  actions={[
                    {
                      label: "View Course",
                      icon: "visibility",
                      onSelect: () => router.push("/courses"),
                    },
                    {
                      label: "Edit Course",
                      icon: "edit",
                      onSelect: () =>
                        toast({
                          title: "Edit course",
                          description: `Open "${c.title}" in the course builder to edit its blueprint.`,
                        }),
                    },
                    {
                      label: "Duplicate",
                      icon: "content_copy",
                      onSelect: () =>
                        toast({ title: "Course duplicated", description: `A copy of "${c.title}" was created.` }),
                    },
                    ...(isAdmin
                      ? [
                          {
                            label: "Delete",
                            icon: "delete",
                            danger: true,
                            separator: true,
                            onSelect: () =>
                              toast({
                                title: "Course deleted",
                                description: `"${c.title}" was removed from the curriculum.`,
                              }),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-6">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6 relative z-10">
                <h3 className="font-mono text-sm text-text-muted mb-4 uppercase tracking-wider">
                  Revenue Performance
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-bold text-4xl text-text-heading">₹1,24,500</span>
                  <span className="text-sm text-success-green flex items-center">
                    <Icon name="trending_up" className="h-4 w-4" />
                    12%
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-6">Net enrollment revenue this quarter</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Target: ₹1.5L</span>
                    <span className="text-text-heading font-bold">83%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[83%] rounded-full shadow-[0_0_10px_rgba(192,193,255,0.4)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-sm text-text-muted uppercase tracking-wider">
                  Course Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { icon: "play_circle", label: "Completion Rate", value: 76 },
                  { icon: "chat_bubble", label: "Forum Activity", value: 42 },
                  { icon: "assignment", label: "Grading Queue", value: 90, danger: true, pending: 94 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
                      <Icon name={m.icon} className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold">{m.label}</span>
                        <span className={`text-sm ${m.danger ? "text-error" : ""}`}>
                          {m.danger ? `${m.pending} pending` : `${m.value}%`}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-surface-container-high rounded-full">
                        <div
                          className={`h-full rounded-full ${m.danger ? "bg-error" : "bg-primary"}`}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateCourseModal open={modalOpen} onOpenChange={setModalOpen} onCreated={() => {
        setModalOpen(false);
        toast({ title: "Course created", description: "Your new course blueprint has been saved." });
      }} />
    </DashboardShell>
  );
}

function CreateCourseModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [visibility, setVisibility] = React.useState("public");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-start gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Module Builder
            </span>
            <span className="flex items-center gap-2">
              <Icon name="menu_book" className="h-5 w-5 text-primary" />
              Designing &quot;{title || "Untitled Course"}&quot;
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Course Title</Label>
              <Input
                className="mt-2"
                placeholder="e.g. Advanced Distributed Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Course Code</Label>
              <Input className="mt-2" placeholder="e.g. CS-402" />
            </div>
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Lead Instructor</Label>
              <Select defaultValue="ev">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ev">Dr. Ayesha Ansari</SelectItem>
                  <SelectItem value="mt">Prof. Arjun Nair</SelectItem>
                  <SelectItem value="sc">Dr. Kavya Reddy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Course Pricing (INR)</Label>
              <Input className="mt-2" type="number" placeholder="4,999" />
            </div>
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Visibility</Label>
              <div className="space-y-3 mt-3">
                {[
                  { v: "public", label: "Public", desc: "Discoverable via search and marketplace" },
                  { v: "private", label: "Private", desc: "Invitation only, hidden from search" },
                ].map((opt) => (
                  <label key={opt.v} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="vis"
                      value={opt.v}
                      checked={visibility === opt.v}
                      onChange={() => setVisibility(opt.v)}
                      className="w-4 h-4 accent-[#6366f1]"
                    />
                    <div>
                      <span className="text-sm font-bold text-text-heading">{opt.label}</span>
                      <span className="block text-xs text-text-muted">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="font-mono text-xs text-text-muted uppercase">Description</Label>
              <Textarea className="mt-2" placeholder="What students will learn..." rows={4} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-text-heading">Curriculum Architecture</h4>
              <Button variant="ghost" size="sm" className="text-primary">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>

            {[
              {
                name: "Module 1: Introduction to Latency",
                items: [
                  { icon: "play_circle", label: "Lecture: The History of Distributed Tech", meta: "12:04" },
                  { icon: "description", label: "Reading: CAP Theorem Principles", meta: "PDF" },
                ],
              },
              {
                name: "Module 2: Consensus Algorithms",
                items: [
                  { icon: "play_circle", label: "Lecture: Deep Dive into Paxos", meta: "24:45" },
                  { icon: "assignment", label: "Quiz: Raft vs Paxos Performance", meta: "10 Questions", highlight: true },
                ],
              },
            ].map((mod) => (
              <div
                key={mod.name}
                className="bg-surface-container-low border border-border-subtle rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 p-4 bg-surface-container-high border-b border-border-subtle">
                  <GripVertical className="h-5 w-5 text-text-muted" />
                  <div className="font-bold text-sm flex-1">{mod.name}</div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Icon name="edit" className="h-4 w-4 text-text-muted" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Icon name="delete" className="h-4 w-4 text-text-muted" />
                  </Button>
                </div>
                <div className="p-4 space-y-2">
                  {mod.items.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 p-3 bg-background border border-border-subtle rounded-lg text-sm hover:border-primary transition-all ${
                        item.highlight ? "border-l-2 border-l-success-green" : ""
                      }`}
                    >
                      <Icon name={item.icon} className={`h-5 w-5 ${item.highlight ? "text-success-green" : "text-primary"}`} />
                      <span className={`flex-1 ${item.highlight ? "font-bold" : ""}`}>{item.label}</span>
                      <span className="text-text-muted text-xs font-mono">{item.meta}</span>
                    </div>
                  ))}
                  <button className="w-full py-2 border border-dashed border-border-subtle rounded-lg text-text-muted text-xs hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2">
                    <Plus className="h-3.5 w-3.5" />
                    Add content
                  </button>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-primary-container/10 border border-primary-container/20">
              <h5 className="text-primary font-bold text-xs mb-1">Architecture Recommendation</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                System suggests 4 additional lab modules based on the Engineering track difficulty.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button onClick={onCreated} disabled={!title.trim()}>
            Save Blueprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

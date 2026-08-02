import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/shared/icon";
import { Button as Btn } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Teacher Dashboard | AcademyX",
};

const performance = [40, 65, 55, 80, 72, 90, 45];
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const materials = [
  { icon: "description", title: "Modernist Architecture: Level 4", meta: "Uploaded 2 hours ago • PDF • 12.4 MB" },
  { icon: "play_circle", title: "React Fundamentals Workshop", meta: "Uploaded Yesterday • Video • 1.2 GB" },
  { icon: "folder_zip", title: "Data Science Asset Kit", meta: "Uploaded 3 days ago • ZIP • 450 MB" },
];

const upcomingClasses = [
  { id: "c1", title: "Introduction to UI Design Systems", meta: "Main Lecture Hall A2 • 28 Registered Students", time: "Starts in 14m", label: "NEXT CLASS" },
];

export default function TeacherDashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Good Morning, Prof. Aris"
          description="You have 3 classes today and 12 ungraded assignments."
          actions={
            <>
              <Button variant="outline">View Schedule</Button>
              <Button>
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
                      style={{ height: `${h}%` }}
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
                    <span className="font-bold text-4xl text-text-heading">94.2%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-success-green/10 text-success-green">
                    <Icon name="check_circle" className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={94} className="bg-surface-container-high [&>div]:bg-success-green" />
                  <p className="mt-2 text-sm text-text-muted">42 of 45 students present</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-xl font-semibold text-text-heading mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "history_edu", label: "Grade Tasks" },
                    { icon: "mail", label: "Message All" },
                    { icon: "calendar_today", label: "Reschedule" },
                    { icon: "download", label: "Export List" },
                  ].map((q) => (
                    <button
                      key={q.label}
                      className="flex flex-col items-center justify-center p-4 bg-surface-container border border-border-subtle rounded-lg hover:bg-surface-container-high transition-colors group"
                    >
                      <Icon name={q.icon} className="h-6 w-6 text-primary mb-2 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-medium">{q.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="md:col-span-12 lg:col-span-7 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <CardTitle>Recent Materials</CardTitle>
              <Button variant="link" className="text-primary">View All</Button>
            </CardHeader>
            <div className="divide-y divide-border-subtle">
              {materials.map((m) => (
                <div key={m.title} className="p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <div className="h-12 w-12 rounded bg-surface-container-highest border border-border-subtle flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <Icon name={m.icon} className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-on-surface">{m.title}</h4>
                    <p className="text-xs text-text-muted">{m.meta}</p>
                  </div>
                  <Icon name="more_vert" className="h-5 w-5 text-outline group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-12 lg:col-span-5 relative overflow-hidden hover:border-primary/30 hover:active-glow transition-all">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="default" className="font-mono">NEXT CLASS</Badge>
                  <span className="text-text-muted text-xs font-mono">
                    {upcomingClasses[0].time}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-heading leading-tight mb-2">
                  {upcomingClasses[0].title}
                </h3>
                <p className="text-text-muted text-sm mb-6">{upcomingClasses[0].meta}</p>
                <div className="flex -space-x-2">
                  {["JD", "AM", "KT"].map((ini) => (
                    <div key={ini} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                      {ini}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                    +24
                  </div>
                </div>
              </div>
              <Btn className="w-full mt-8 bg-on-surface text-background hover:opacity-90">
                Launch Live Session
              </Btn>
            </CardContent>
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none">
              <Icon name="group" className="h-44 w-44" />
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

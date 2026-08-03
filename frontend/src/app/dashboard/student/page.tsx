"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { fetchStudentDashboard, mockStudentDashboardData } from "@/lib/live-data";
import { getStoredUser } from "@/lib/api";

export default function StudentDashboardPage() {
  const { attendanceRate, avgScore, courseCount, certificates, courses, nextClass, assignments } =
    useLive(fetchStudentDashboard, mockStudentDashboardData);
  const firstName = getStoredUser()?.name?.split(" ")[0] ?? "Student";
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <PageHeader
          title={`Welcome back, ${firstName}.`}
          description="You have 1 live class today and 2 assignments due this week."
          actions={
            <Button variant="outline">
              <Icon name="calendar_today" className="h-4 w-4" />
              My Schedule
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard label="Attendance" value={`${attendanceRate}%`} icon="verified_user" trend="+2%" trendUp accent="success" />
          <StatCard label="Avg Score" value={`${avgScore}%`} icon="star" trend="+5%" trendUp accent="primary" />
          <StatCard label="Courses" value={`${courseCount}`} icon="menu_book" sub="Active enrollments" accent="tertiary" />
          <StatCard label="Certificates" value={`${certificates}`} icon="award" sub="Earned so far" accent="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Learning Progress</CardTitle>
              <Button variant="link" className="text-primary">View All Courses</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {courses.map((c) => (
                <div key={c.title}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-on-surface">{c.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {c.lessons} • Next: {c.next}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-primary">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Live Class</CardTitle>
              <p className="text-sm text-text-muted">Your upcoming session.</p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-primary/20 bg-primary-container/5 p-5">
                <Badge variant="default" className="font-mono mb-3">{nextClass.time}</Badge>
                <h4 className="font-semibold text-lg text-text-heading leading-tight mb-1">
                  {nextClass.title}
                </h4>
                <p className="text-sm text-text-muted mb-4">{nextClass.meta}</p>
                <Button className="w-full">
                  <Icon name="video" className="h-4 w-4" />
                  Join Live Class
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <CardTitle>Recent Assignments</CardTitle>
              <Button variant="link" className="text-primary">View All</Button>
            </CardHeader>
            <div className="divide-y divide-border-subtle">
              {assignments.map((a) => (
                <div key={a.title} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                      <Icon name="assignment" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{a.title}</p>
                      <p className="text-xs text-text-muted">{a.course} • {a.due}</p>
                    </div>
                  </div>
                  <Badge
                    variant={a.status === "Submitted" ? "success" : a.status === "Pending" ? "warning" : "default"}
                  >
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { getStoredUser } from "@/lib/api";
import {
  fetchBatchDetail,
  mockBatchDetailData,
  formatDate,
} from "@/lib/live-data";

export default function BatchDetailPage() {
  return (
    <React.Suspense fallback={null}>
      <BatchDetailPageInner />
    </React.Suspense>
  );
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function BatchDetailPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const batch = useLive(() => fetchBatchDetail(id), mockBatchDetailData);
  const user = React.useMemo(() => getStoredUser(), []);
  const canManageBatches = user?.role === "INSTITUTE_ADMIN";

  const filled = batch.capacity > 0 ? (batch.students.length / batch.capacity) * 100 : 0;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`${batch.name} (${batch.code})`}
          description={`${batch.course} • ${batch.schedule}`}
          actions={
            <>
              <Link href="/batches">
                <Button variant="outline">
                  <Icon name="arrow_left" className="h-4 w-4" />
                  Back to Batches
                </Button>
              </Link>
              {canManageBatches ? (
                <Button>
                  <Icon name="edit" className="h-4 w-4" />
                  Edit Batch
                </Button>
              ) : null}
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon="group" label="Students" value={`${batch.students.length}`} sub={batch.capacity > 0 ? `${batch.capacity} capacity` : undefined} />
          <StatCard icon="calendar_check" label="Attendance" value={`${batch.attendanceRate}%`} sub="overall" accent="text-success-green" />
          <StatCard icon="assignment" label="Assignments" value={`${batch.assignments}`} sub="active" />
          <StatCard icon="spreadsheet" label="Exams" value={`${batch.exams}`} sub="scheduled" />
          <StatCard icon="video" label="Live Classes" value={`${batch.liveClasses.length}`} sub="upcoming" accent="text-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-border-subtle">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="group" className="h-4 w-4" />
                Student Roster
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batch.students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initialsOf(s.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-on-surface text-sm">{s.name}</p>
                          <p className="text-xs text-text-muted">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-muted font-mono">{s.rollNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-32">
                        <Progress value={s.attendanceRate} className="h-1.5" />
                        <span className="text-xs text-text-muted font-mono whitespace-nowrap">{s.attendanceRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{s.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="border-b border-border-subtle">
                <CardTitle className="text-base">Batch Details</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <DetailRow label="Status" value={<Badge variant="default">{batch.status}</Badge>} />
                <DetailRow label="Course" value={batch.course} />
                <DetailRow label="Start Date" value={batch.startDate} />
                <DetailRow label="End Date" value={batch.endDate} />
                <DetailRow
                  label="Capacity"
                  value={
                    <span className="flex items-center gap-2">
                      {batch.capacity > 0 ? `${batch.students.length}/${batch.capacity}` : batch.students.length}
                      <span className="text-xs text-text-muted">({Math.round(filled)}%)</span>
                    </span>
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border-subtle">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="video" className="h-4 w-4" />
                  Upcoming Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {batch.liveClasses.map((l) => (
                  <Link
                    key={l.id}
                    href={`/live-classes/session?id=${l.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                      <Icon name="video" className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{l.title}</p>
                      <p className="text-xs text-text-muted">{formatDate(l.startsAt)}</p>
                    </div>
                    <Badge variant={l.status === "Live" ? "destructive" : "secondary"} className="font-mono uppercase">
                      {l.status}
                    </Badge>
                  </Link>
                ))}
                {batch.liveClasses.length === 0 && (
                  <p className="text-sm text-text-muted p-2">No classes scheduled.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <Tabs defaultValue="schedule">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
            </TabsList>
            <CardContent className="p-5">
              <TabsContent value="schedule">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["Monday", "Wednesday", "Friday"].map((day, i) => (
                    <div key={day} className="p-4 rounded-lg border border-border-subtle bg-surface-container-low">
                      <p className="text-xs font-mono text-text-muted uppercase">{day}</p>
                      <p className="text-sm font-medium text-on-surface mt-2">7:00 PM – 9:00 PM</p>
                      <p className="text-xs text-text-muted mt-0.5">Live session with {batch.course}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant={i === 0 ? "destructive" : "secondary"} className="font-mono uppercase text-[10px]">
                          {i === 0 ? "Today" : "Upcoming"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="assignments">
                <p className="text-sm text-text-muted">{batch.assignments} assignments are active for this batch.</p>
              </TabsContent>
              <TabsContent value="exams">
                <p className="text-sm text-text-muted">{batch.exams} exams are scheduled for this batch.</p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start justify-between">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wide">{label}</p>
          <p className="text-text-heading font-bold text-2xl mt-1">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-surface-container-high ${accent ?? ""}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-text-muted">{label}</span>
      <span className="text-on-surface font-medium text-right">{value}</span>
    </div>
  );
}

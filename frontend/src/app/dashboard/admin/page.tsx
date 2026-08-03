"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader, ExportButton, NewButton } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueBarChart, MetricCardHeader } from "@/components/dashboard/charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { fetchAdminOverview, mockAdminOverviewData } from "@/lib/live-data";

export default function InstituteAdminDashboardPage() {
  const { dashboardStats, revenueSeries, announcements, recentAdmissions, activity } = useLive(
    fetchAdminOverview,
    mockAdminOverviewData
  );
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Institute Analytics"
          description="Real-time overview of AcademyX operations and performance."
          actions={
            <>
              <ExportButton />
              <NewButton>New Entry</NewButton>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Students"
            value={dashboardStats.activeStudents.total.toLocaleString()}
            icon="group"
            trend="+12%"
            trendUp
            accent="primary"
          />
          <StatCard
            label="Teacher Attendance"
            value={`${dashboardStats.teacherAttendance.total}%`}
            icon="verified_user"
            sub="Daily Avg"
            accent="tertiary"
          />
          <StatCard
            label="Pending Fees"
            value={`₹${dashboardStats.pendingFees.total.toLocaleString()}`}
            icon="payments"
            trend="Attention Required"
            trendUp={false}
            accent="error"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <MetricCardHeader title="Revenue Overview" />
            </CardHeader>
            <CardContent>
              <RevenueBarChart data={revenueSeries} />
              <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-6 mt-6">
                <div>
                  <p className="text-sm text-text-muted">Net Growth</p>
                  <p className="text-xl font-semibold text-text-heading">
                    + ₹{dashboardStats.netGrowth.total.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Avg Tuition</p>
                  <p className="text-xl font-semibold text-text-heading">
                    ₹{dashboardStats.avgTuition.total.toLocaleString()}/yr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-container/5 border-primary-container/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Icon name="campaign" className="h-5 w-5" />
                Announcements
              </CardTitle>
              <p className="text-sm text-text-muted">Broadcasted to all faculty and students.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="p-4 bg-background/60 border border-primary-container/20 rounded-lg hover:border-primary-container/40 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={
                        a.type === "Urgent"
                          ? "bg-primary-container/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          : a.type === "Event"
                            ? "bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            : "bg-secondary-container/20 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      }
                    >
                      {a.type}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">{a.time}</span>
                  </div>
                  <h5 className="text-on-surface font-semibold text-base">{a.title}</h5>
                  <p className="text-text-muted text-sm line-clamp-2">{a.description}</p>
                </div>
              ))}
              <Button variant="ghost" className="text-primary w-full">
                View All Announcements
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <div>
                <CardTitle>Recent Admissions</CardTitle>
                <p className="text-sm text-text-muted mt-1">
                  List of the last 15 students admitted to the academy.
                </p>
              </div>
              <Button variant="link" className="text-primary">
                View Student Directory
              </Button>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdmissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{s.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-on-surface">{s.name}</p>
                          <p className="text-xs text-text-muted">ID: #{s.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-on-surface-variant">{s.department}</TableCell>
                    <TableCell className="text-sm text-on-surface-variant">{s.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={s.status === "Verified" ? "success" : "warning"}
                        className="rounded-full"
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-sm font-mono ${s.fees === "Paid" ? "text-on-surface" : "text-error"}`}
                    >
                      {s.fees}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted">
                        <Icon name="more_vert" className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="link" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <ActivityFeed activities={activity} limit={5} />
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader, ExportButton } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueBarChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLive } from "@/lib/live";
import { downloadCsv } from "@/lib/csv";
import { fetchSuperAdminOverview, mockSuperAdminOverviewData } from "@/lib/live-data";

const systemActivity = [
  {
    dot: "bg-primary",
    title: "New Institute Onboarded",
    desc: "Global Tech Academy joined Enterprise plan.",
    time: "2 mins ago",
  },
  {
    dot: "bg-tertiary",
    title: "High-Revenue Alert",
    desc: "Zenith Coaching processed a ₹5L+ transaction.",
    time: "14 mins ago",
  },
  {
    dot: "bg-success-green",
    title: "Server Health Check",
    desc: "Region US-East node optimized (99.9% uptime).",
    time: "45 mins ago",
  },
  {
    dot: "bg-primary",
    title: "Developer API Key Created",
    desc: "New key generated for 'StudyLink' integration.",
    time: "1 hour ago",
  },
];

export default function SuperAdminDashboardPage() {
  const { toast } = useToast();
  const { platformStats, mrrSeries, institutes } = useLive(
    fetchSuperAdminOverview,
    mockSuperAdminOverviewData
  );
  const [growthRange, setGrowthRange] = React.useState("6M");
  const [planFilter, setPlanFilter] = React.useState("Filter by Plan");

  const filtered =
    planFilter === "Filter by Plan"
      ? institutes
      : institutes.filter((i) => i.plan === planFilter);

  const exportInstitutes = () => {
    downloadCsv(
      "institute-directory",
      ["Institute Name", "Admin Email", "Subscription Plan", "Status", "Onboarded"],
      filtered.map((i) => [i.name, i.adminEmail, i.plan, i.status, i.onboarded])
    );
    toast({ title: "Directory exported", description: `${filtered.length} institutes exported to CSV.` });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="System Overview"
          description="Monitoring global platform health and commercial growth metrics."
          actions={
            <>
              <ExportButton label="Export Report" onClick={exportInstitutes} />
              <Button onClick={() => toast({ title: "Onboard institute", description: "Use Institutes → New Institute to onboard a new institute." })}>
                <Icon name="add" className="h-4 w-4" />
                Onboard Institute
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            label="Total Institutes"
            value={platformStats.totalInstitutes.toLocaleString()}
            icon="apartment"
            trend="+4"
            trendUp
            sub="New signups this week"
            accent="primary"
          />
          <StatCard
            label="Total Students"
            value={platformStats.totalStudents.toLocaleString()}
            icon="groups"
            trend="+1.2k"
            trendUp
            sub="Active platform users today"
            accent="primary"
          />
          <StatCard
            label="Monthly Revenue"
            value={`₹${platformStats.mrr.toLocaleString()}`}
            icon="payments"
            trend={`${platformStats.revenueGrowth}%`}
            trendUp
            sub="Projection: ₹95k by end of month"
            accent="primary"
          />
          <StatCard
            label="Active Live Classes"
            value="12"
            icon="sensors"
            pulse
            sub="Currently streaming across nodes"
            accent="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-text-heading">Institute Growth</h4>
                <div className="flex gap-1 bg-background p-1 rounded-lg border border-border-subtle">
                  {["6M", "1Y", "ALL"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setGrowthRange(r)}
                      className={`px-3 py-1 text-[11px] font-mono rounded ${
                        growthRange === r
                          ? "bg-surface-container-high text-primary"
                          : "text-text-muted hover:text-on-surface"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueBarChart data={mrrSeries} yKey="revenue" color="#6366f1" highlightIndex={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>System Activity</CardTitle>
              <Icon name="history" className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {systemActivity.map((a) => (
                <div key={a.title} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${a.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{a.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
                    <p className="text-[10px] font-mono text-text-muted mt-1">{a.time}</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2 text-[11px] font-mono text-text-muted hover:text-on-surface h-9"
                onClick={() => toast({ title: "System logs", description: "All system activity logs are available here." })}
              >
                VIEW ALL SYSTEM LOGS
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <CardTitle>Recently Onboarded Institutes</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="h-8 rounded-lg border border-border-subtle bg-surface px-3 text-xs font-mono text-on-surface outline-none"
                >
                  {["Filter by Plan", "Enterprise", "Pro", "Starter"].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institute Name</TableHead>
                  <TableHead>Admin Email</TableHead>
                  <TableHead>Subscription Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarded</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary text-xs font-bold">
                          {i.initials}
                        </div>
                        <span className="font-medium text-on-surface">{i.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-on-surface-variant">{i.adminEmail}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-mono border ${
                          i.plan === "Enterprise"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-surface-container-high text-text-heading border-border-subtle"
                        }`}
                      >
                        {i.plan}
                      </span>
                    </TableCell>
                    <TableCell>
                      {i.status === "Active" ? (
                        <span className="flex items-center gap-1.5 text-xs text-on-surface">
                          <span className="h-2 w-2 rounded-full bg-success-green" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-error">
                          <span className="h-2 w-2 rounded-full bg-error animate-pulse" />
                          Verification Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-on-surface-variant font-mono">{i.onboarded}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-muted hover:text-on-surface"
                        onClick={() => toast({ title: i.name, description: `${i.adminEmail} • ${i.plan} plan • ${i.status}` })}
                      >
                        <Icon name="more_vert" className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between">
              <p className="text-[10px] font-mono text-text-muted">Showing {filtered.length} of 124 institutes</p>
              <div className="flex gap-2">
                <button className="p-1 border border-border-subtle rounded opacity-40 cursor-not-allowed" aria-label="Previous page">
                  <Icon name="chevron_left" className="h-4 w-4 text-text-muted" />
                </button>
                <button
                  className="p-1 border border-border-subtle rounded hover:bg-surface-container-high"
                  aria-label="Next page"
                  onClick={() => toast({ title: "Pagination", description: "Loading the next page of institutes." })}
                >
                  <Icon name="chevron_right" className="h-4 w-4 text-text-muted" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

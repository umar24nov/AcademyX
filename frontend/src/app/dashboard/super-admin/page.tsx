"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader, ExportButton } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueBarChart, MetricCardHeader } from "@/components/dashboard/charts";
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
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { fetchSuperAdminOverview, mockSuperAdminOverviewData } from "@/lib/live-data";

export default function SuperAdminDashboardPage() {
  const { platformStats, mrrSeries, institutes } = useLive(
    fetchSuperAdminOverview,
    mockSuperAdminOverviewData
  );
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="System Overview"
          description="Platform-wide health, revenue and growth across all institutes."
          actions={<ExportButton />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            label="Active Institutes"
            value={platformStats.activeInstitutes.toLocaleString()}
            icon="domain"
            trend="+12%"
            trendUp
            accent="primary"
          />
          <StatCard
            label="MRR"
            value={`₹${(platformStats.mrr / 1000).toFixed(0)}k`}
            icon="payments"
            trend="+18%"
            trendUp
            accent="success"
          />
          <StatCard
            label="Total Students"
            value={platformStats.totalStudents.toLocaleString()}
            icon="group"
            trend="+9%"
            trendUp
            accent="tertiary"
          />
          <StatCard
            label="Churn Rate"
            value={`${platformStats.churn}%`}
            icon="trending_up"
            trend="-0.4%"
            trendUp={false}
            accent="error"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <MetricCardHeader title="Platform MRR" ranges={["Last 6 Months", "Year to Date", "This Quarter"]} />
            </CardHeader>
            <CardContent>
              <RevenueBarChart data={mrrSeries} yKey="revenue" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Health</CardTitle>
              <p className="text-sm text-text-muted">Trial and conversion metrics.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-text-muted">Trial → Paid Conversion</span>
                  <span className="text-text-heading font-bold">{platformStats.trialConversions}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[38%] rounded-full shadow-[0_0_10px_rgba(192,193,255,0.4)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-text-muted">Avg Revenue / Institute</span>
                  <span className="text-text-heading font-bold">₹{platformStats.avgRevenuePerInstitute.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[62%] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-text-muted">Enterprise Adoption</span>
                  <span className="text-text-heading font-bold">14%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[14%] rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
              <CardTitle>Institute Directory</CardTitle>
              <Button variant="outline" className="h-8">
                <Icon name="add" className="h-4 w-4" />
                Invite Institute
              </Button>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institute</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutes.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium text-on-surface">{i.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.plan === "Enterprise"
                            ? "default"
                            : i.plan === "Professional"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {i.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{i.students.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">₹{i.mrr.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              i.health >= 80
                                ? "bg-success-green"
                                : i.health >= 50
                                  ? "bg-tertiary"
                                  : "bg-error"
                            }`}
                            style={{ width: `${i.health}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted font-mono">{i.health}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.status === "Active"
                            ? "success"
                            : i.status === "Trial"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {i.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

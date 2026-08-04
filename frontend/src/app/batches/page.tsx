"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
import { fetchBatches, mockBatchesData } from "@/lib/live-data";
import { Search } from "lucide-react";

export default function BatchManagementPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const batches = useLive(fetchBatches, mockBatchesData);
  const user = React.useMemo(() => getStoredUser(), []);
  const canManageBatches = user?.role === "INSTITUTE_ADMIN";

  const filtered = batches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Batch Management"
          description="Organize students into cohorts, assign teachers and track capacity."
          actions={
            canManageBatches ? (
              <Button>
                <Icon name="add" className="h-4 w-4" />
                New Batch
              </Button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Batches", value: 48, icon: "group" },
            { label: "Active", value: 34, icon: "check_circle", accent: "text-success-green" },
            { label: "Full", value: 6, icon: "warning", accent: "text-tertiary" },
            { label: "Upcoming", value: 8, icon: "schedule", accent: "text-primary" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm uppercase tracking-wide">{s.label}</p>
                  <p className="text-text-heading font-bold text-3xl mt-1">{s.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-surface-container-high ${s.accent ?? ""}`}>
                  <Icon name={s.icon} className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
            <CardTitle>All Batches</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  className="pl-10 h-9 w-56"
                  placeholder="Search batches..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Link href={`/batches/detail?id=${b.id}`} className="group/row">
                      <p className="font-medium text-on-surface group-hover/row:text-primary transition-colors">{b.name}</p>
                      <p className="text-xs text-text-muted font-mono">{b.code}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{b.course}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{b.teacher}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{b.schedule}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-36">
                      <Progress value={b.capacity > 0 ? (b.students / b.capacity) * 100 : 0} className="h-1.5" />
                      <span className="text-xs text-text-muted font-mono whitespace-nowrap">
                        {b.capacity > 0 ? `${b.students}/${b.capacity}` : b.students}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={b.status === "Active" ? "success" : b.status === "Full" ? "warning" : "secondary"}
                    >
                      {b.status}
                    </Badge>
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
      </div>
    </DashboardShell>
  );
}

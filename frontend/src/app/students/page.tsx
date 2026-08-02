"use client";

import * as React from "react";
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
import { fetchStudents, mockStudentsData } from "@/lib/live-data";
import { Search } from "lucide-react";

export default function StudentsPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const students = useLive(fetchStudents, mockStudentsData);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matches =
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
    const matchesStatus = status === "all" || s.status.toLowerCase() === status;
    return matches && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Students"
          description="Manage enrollment, attendance and student records."
          actions={
            <>
              <Button variant="outline">
                <Icon name="download" className="h-4 w-4" />
                Export
              </Button>
              <Button>
                <Icon name="add" className="h-4 w-4" />
                Add Student
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Students", value: "2,842", icon: "group", accent: "text-primary" },
            { label: "Active", value: "2,610", icon: "check_circle", accent: "text-success-green" },
            { label: "At Risk", value: "142", icon: "warning", accent: "text-tertiary" },
            { label: "New This Month", value: "96", icon: "trending_up", accent: "text-primary" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm uppercase tracking-wide">{s.label}</p>
                  <p className="text-text-heading font-bold text-3xl mt-1">{s.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-surface-container-high ${s.accent}`}>
                  <Icon name={s.icon} className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
            <CardTitle>Student Directory</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  className="pl-10 h-9 w-64"
                  placeholder="Search by name, ID or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{s.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{s.name}</p>
                        <p className="text-xs text-text-muted font-mono">{s.studentId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{s.course}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant font-mono">{s.batch}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-28">
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.attendance >= 90 ? "bg-success-green" : s.attendance >= 80 ? "bg-tertiary" : "bg-error"
                          }`}
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted font-mono">{s.attendance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Active" ? "success" : "destructive"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{s.enrolledOn}</TableCell>
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

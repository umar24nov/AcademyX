"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowActionsMenu } from "@/components/dashboard/row-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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
import { getStoredUser } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { fetchTeachers, mockTeachersData } from "@/lib/live-data";
import { Search } from "lucide-react";

export default function TeachersPage() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const teachers = useLive(fetchTeachers, mockTeachersData);
  const user = React.useMemo(() => getStoredUser(), []);
  const canManageTeachers = user?.role === "INSTITUTE_ADMIN";

  const exportRow = (t: (typeof teachers)[number]) => {
    downloadCsv(
      `teacher-${t.name.replace(/\s+/g, "-").toLowerCase()}`,
      ["Name", "Email", "Subjects", "Batches", "Students", "Attendance", "Status"],
      [[t.name, t.email, t.subjects.join(", "), t.batches, t.students, `${t.attendance}%`, t.status]]
    );
    toast({ title: "Teacher exported", description: `${t.name}'s record exported to CSV.` });
  };
  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Teachers"
          description="Manage faculty, their batches and teaching load."
          actions={
            <>
              <Button variant="outline">
                <Icon name="download" className="h-4 w-4" />
                Export
              </Button>
              {canManageTeachers ? (
                <Button>
                  <Icon name="add" className="h-4 w-4" />
                  Invite Teacher
                </Button>
              ) : null}
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Teachers", value: "96", icon: "admin_panel_settings", accent: "text-primary" },
            { label: "Active", value: "88", icon: "check_circle", accent: "text-success-green" },
            { label: "On Leave", value: "5", icon: "schedule", accent: "text-tertiary" },
            { label: "Avg Attendance", value: "94.8%", icon: "verified_user", accent: "text-primary" },
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
            <CardTitle>Faculty Directory</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                className="pl-10 h-9 w-64"
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{t.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{t.name}</p>
                        <p className="text-xs text-text-muted">{t.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant">
                    {t.subjects.join(", ")}
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant font-mono">{t.batches}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant font-mono">{t.students}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-28">
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.attendance >= 95 ? "bg-success-green" : "bg-tertiary"}`}
                          style={{ width: `${t.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted font-mono">{t.attendance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "Active" ? "success" : "warning"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: "View Profile",
                          icon: "visibility",
                          onSelect: () =>
                            toast({
                              title: t.name,
                              description: `${t.email} • ${t.subjects.join(", ")} • ${t.status}`,
                            }),
                        },
                        ...(canManageTeachers
                          ? [
                              {
                                label: "Edit Teacher",
                                icon: "edit",
                                onSelect: () =>
                                  toast({ title: "Edit teacher", description: `Open ${t.name}'s profile to edit.` }),
                              },
                              {
                                label: "Remove",
                                icon: "delete",
                                danger: true,
                                separator: true,
                                onSelect: () =>
                                  toast({ title: "Teacher removed", description: `${t.name} was removed from faculty.` }),
                              },
                            ]
                          : []),
                        {
                          label: "Export CSV",
                          icon: "download",
                          onSelect: () => exportRow(t),
                        },
                      ]}
                    />
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

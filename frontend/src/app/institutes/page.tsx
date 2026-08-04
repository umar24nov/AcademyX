"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/shared/icon";
import { RowActionsMenu } from "@/components/dashboard/row-menu";
import { useToast } from "@/components/ui/use-toast";
import { useLive } from "@/lib/live";
import { fetchInstitutes, mockInstitutesData } from "@/lib/live-data";
import { Search } from "lucide-react";

export default function InstitutesPage() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const institutes = useLive(fetchInstitutes, mockInstitutesData);

  const filtered = institutes.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      i.domain.toLowerCase().includes(q) ||
      i.owner.toLowerCase().includes(q)
    );
  });

  const totalStudents = institutes.reduce((s, i) => s + i.students, 0);
  const totalRevenue = institutes.reduce((s, i) => s + i.mrr, 0);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Institutes"
          description="Manage all institutes on the AcademyX platform."
          actions={
            <Button>
              <Icon name="add" className="h-4 w-4" />
              New Institute
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                <Icon name="school" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Active Institutes</p>
                <p className="text-xl font-bold text-text-heading">{institutes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success-container/10 text-success-green flex items-center justify-center">
                <Icon name="groups" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Students</p>
                <p className="text-xl font-bold text-text-heading">{totalStudents.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-tertiary-container/10 text-tertiary flex items-center justify-center">
                <Icon name="payments" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Monthly MRR</p>
                <p className="text-xl font-bold text-text-heading">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            className="pl-10"
            placeholder="Search institutes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Institutes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institute</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Courses</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center text-xs font-bold">
                          {i.initials}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{i.name}</p>
                          <p className="text-xs text-text-muted">{i.domain}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted">{i.owner}</TableCell>
                    <TableCell>
                      <Badge variant={i.plan === "Enterprise" ? "success" : i.plan === "Pro" ? "default" : "secondary"}>
                        {i.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-right">{i.students.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-right">{i.courses}</TableCell>
                    <TableCell className="font-mono text-right">₹{i.mrr.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={i.status === "Active" ? "success" : "destructive"}>{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        iconClassName="h-5 w-5"
                        triggerClassName="h-9 w-9"
                        actions={[
                          {
                            label: "View Details",
                            icon: "visibility",
                            onSelect: () =>
                              toast({
                                title: i.name,
                                description: `${i.domain} • ${i.plan} • ${i.students} students • ₹${i.mrr.toLocaleString()} MRR`,
                              }),
                          },
                          {
                            label: "Edit Institute",
                            icon: "edit",
                            onSelect: () =>
                              toast({ title: "Edit institute", description: `Open ${i.name}'s settings to edit.` }),
                          },
                          {
                            label: i.status === "Active" ? "Suspend" : "Activate",
                            icon: i.status === "Active" ? "pause" : "play_arrow",
                            danger: i.status === "Active",
                            separator: true,
                            onSelect: () =>
                              toast({
                                title: i.status === "Active" ? "Institute suspended" : "Institute activated",
                                description: i.status === "Active"
                                  ? `${i.name} is now suspended.`
                                  : `${i.name} is now active.`,
                              }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

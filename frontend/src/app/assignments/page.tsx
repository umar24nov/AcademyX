"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { fetchAssignments, mockAssignmentsData } from "@/lib/live-data";

export default function AssignmentsPage() {
  const assignments = useLive(fetchAssignments, mockAssignmentsData);
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Assignments"
          description="Create, distribute and grade student assignments."
          actions={
            <Button>
              <Icon name="add" className="h-4 w-4" />
              New Assignment
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {assignments.map((a) => (
            <Card key={a.id} className="hover:border-primary/30 hover:indigo-glow transition-all flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">{a.title}</CardTitle>
                  <Badge variant={a.status === "Active" ? "default" : "warning"}>{a.status}</Badge>
                </div>
                <p className="text-sm text-text-muted">{a.course} • {a.batch}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-sm text-text-muted mb-5">
                  <Icon name="schedule" className="h-4 w-4" />
                  Due {a.due}
                </div>
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-muted">Submissions</span>
                    <span className="font-mono text-text-heading">
                      {a.totalStudents > 0 ? `${a.submissions}/${a.totalStudents}` : `${a.submissions} submitted`}
                    </span>
                  </div>
                  <Progress value={a.totalStudents > 0 ? (a.submissions / a.totalStudents) * 100 : 0} />
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm" asChild>
                    <Link href={`/assignments/submission?id=${a.id}`}>Grade</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

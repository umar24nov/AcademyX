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
import { useLive, useStoredUser } from "@/lib/live";
import { fetchAssignments, mockAssignmentsData } from "@/lib/live-data";

export default function AssignmentsPage() {
  const assignments = useLive(fetchAssignments, mockAssignmentsData);
  const user = useStoredUser();
  const isStudent = user?.role === "STUDENT";
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Assignments"
          description={isStudent ? "Submit your assignments and track grades." : "Create, distribute and grade student assignments."}
          actions={
            !isStudent ? (
              <Button>
                <Icon name="add" className="h-4 w-4" />
                New Assignment
              </Button>
            ) : undefined
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
                {isStudent ? (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-muted">Your submission</span>
                      <span className="font-mono text-text-heading">
                        {a.myMarks !== null && a.myMarks !== undefined
                          ? `${a.myMarks} marks`
                          : a.myStatus
                            ? a.myStatus.charAt(0) + a.myStatus.slice(1).toLowerCase()
                            : "Not submitted"}
                      </span>
                    </div>
                    <Badge
                      variant={a.myMarks !== null && a.myMarks !== undefined ? "success" : a.myStatus ? "warning" : "secondary"}
                    >
                      {a.myMarks !== null && a.myMarks !== undefined
                        ? "Graded"
                        : a.myStatus
                          ? a.myStatus.charAt(0) + a.myStatus.slice(1).toLowerCase()
                          : "Pending"}
                    </Badge>
                  </div>
                ) : (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-muted">Submissions</span>
                      <span className="font-mono text-text-heading">
                        {a.totalStudents > 0 ? `${a.submissions}/${a.totalStudents}` : `${a.submissions} submitted`}
                      </span>
                    </div>
                    <Progress value={a.totalStudents > 0 ? (a.submissions / a.totalStudents) * 100 : 0} />
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={isStudent ? `/assignments/submission?id=${a.id}` : `/assignments/submissions?id=${a.id}`}>
                      {isStudent ? "View Details" : "View Details"}
                    </Link>
                  </Button>
                  {isStudent ? (
                    <Button size="sm" asChild>
                      <Link href={`/assignments/submission?id=${a.id}`}>
                        {a.myStatus ? "Update Submission" : "Submit"}
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href={`/assignments/submissions?id=${a.id}`}>Grade</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

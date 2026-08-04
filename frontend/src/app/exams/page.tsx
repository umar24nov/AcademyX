"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import { getStoredUser } from "@/lib/api";
import { fetchExams, mockExamsData } from "@/lib/live-data";

export default function ExamsPage() {
  const exams = useLive(fetchExams, mockExamsData);
  const user = React.useMemo(() => getStoredUser(), []);
  const isStudent = user?.role === "STUDENT";
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Exams"
          description={
            isStudent
              ? "Take your scheduled MCQ and subjective assessments."
              : "Create and manage MCQ and subjective assessments."
          }
          actions={
            !isStudent ? (
              <Button>
                <Icon name="add" className="h-4 w-4" />
                New Exam
              </Button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {exams.map((e) => (
            <Card key={e.id} className="hover:border-primary/30 hover:indigo-glow transition-all flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">{e.title}</CardTitle>
                  <Badge
                    variant={e.status === "Published" ? "success" : e.status === "Scheduled" ? "default" : "warning"}
                  >
                    {e.status}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted">{e.course} • {e.batch}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 bg-surface-container-low rounded-lg text-center">
                    <p className="text-xs text-text-muted">Questions</p>
                    <p className="font-bold text-text-heading mt-0.5">{e.questions}</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg text-center">
                    <p className="text-xs text-text-muted">Duration</p>
                    <p className="font-bold text-text-heading mt-0.5">{e.duration}</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg text-center">
                    <p className="text-xs text-text-muted">Marks</p>
                    <p className="font-bold text-text-heading mt-0.5">{e.totalMarks}</p>
                  </div>
                </div>
                <div className="text-sm text-text-muted mb-4">
                  <Icon name="schedule" className="h-4 w-4 inline mr-1" />
                  {e.scheduledFor}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-text-muted font-mono">
                    {isStudent
                      ? e.attempts > 0
                        ? "Attempted"
                        : "Not attempted"
                      : `${e.attempts} attempts`}
                  </span>
                  <div className="flex gap-2">
                    {!isStudent && <Button variant="outline" size="sm">Edit</Button>}
                    <Button size="sm" asChild>
                      <Link href={`/exams/mcq?id=${e.id}`}>
                        <Icon name="play_circle" className="h-4 w-4" />
                        {isStudent ? "Start Exam" : "Preview"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

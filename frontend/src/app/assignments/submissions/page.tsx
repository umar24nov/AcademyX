"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Inbox } from "lucide-react";
import { useLive } from "@/lib/live";
import {
  fetchAssignmentDetail,
  fetchAssignmentSubmissions,
  gradeSubmission,
  type AssignmentSubmissionRow,
} from "@/lib/live-data";
import { formatDate } from "@/lib/live-data";

export default function AssignmentGradingPage() {
  return (
    <React.Suspense fallback={null}>
      <AssignmentGradingPageInner />
    </React.Suspense>
  );
}

function AssignmentGradingPageInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const assignment = useLive(() => fetchAssignmentDetail(id), null);
  const submissions = useLive(() => fetchAssignmentSubmissions(id), [] as AssignmentSubmissionRow[]);

  const [drafts, setDrafts] = React.useState<Record<string, { marks: string; feedback: string }>>({});
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});

  const draftOf = (s: AssignmentSubmissionRow) => {
    const d = drafts[s.id];
    if (d) return d;
    return {
      marks: s.marks !== null && s.marks !== undefined ? String(s.marks) : "",
      feedback: s.feedback ?? "",
    };
  };

  const setDraft = (sid: string, patch: Partial<{ marks: string; feedback: string }>) => {
    setDrafts((prev) => ({ ...prev, [sid]: { ...draftOf(submissions.find((x) => x.id === sid)!), ...patch } }));
  };

  const save = async (s: AssignmentSubmissionRow) => {
    const d = draftOf(s);
    const marks = Number(d.marks);
    if (d.marks === "" || Number.isNaN(marks) || marks < 0) {
      toast({ title: "Enter valid marks", variant: "destructive" });
      return;
    }
    setSaving((prev) => ({ ...prev, [s.id]: true }));
    const ok = await gradeSubmission(s.id, { marks, feedback: d.feedback || undefined });
    setSaving((prev) => ({ ...prev, [s.id]: false }));
    if (ok) {
      toast({ title: "Graded", description: `${s.studentName}'s submission has been graded.` });
      setDrafts((prev) => ({ ...prev, [s.id]: { marks: String(marks), feedback: d.feedback } }));
    } else {
      toast({ title: "Failed to save grade", variant: "destructive" });
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Grade Submissions"
          description={
            assignment
              ? `${assignment.title} • ${assignment.course} • Max ${assignment.maxMarks} marks`
              : "Review and grade student submissions."
          }
        />

        <Card>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Inbox className="h-10 w-10 text-text-muted" />
                <p className="text-sm text-text-muted">No submissions yet.</p>
                <p className="text-xs text-text-muted/70">Submissions will appear here once students upload their work.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => {
                      const d = draftOf(s);
                      const graded = s.status === "GRADED";
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <p className="font-medium text-on-surface">{s.studentName}</p>
                            <p className="text-xs text-text-muted">{s.studentEmail}</p>
                          </TableCell>
                          <TableCell className="text-sm text-text-muted whitespace-nowrap">
                            {s.submittedAt ? formatDate(s.submittedAt) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-text-muted max-w-[220px]">
                            <p className="truncate">{s.notes || "—"}</p>
                            {s.attachments && s.attachments.length > 0 && (
                              <p className="text-xs text-primary truncate">{s.attachments.join(", ")}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={graded ? "success" : "warning"}>{graded ? "Graded" : "Submitted"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min={0}
                                value={d.marks}
                                onChange={(e) => setDraft(s.id, { marks: e.target.value })}
                                className="w-20"
                              />
                              <span className="text-xs text-text-muted">/ {assignment?.maxMarks ?? "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Textarea
                              rows={1}
                              value={d.feedback}
                              onChange={(e) => setDraft(s.id, { feedback: e.target.value })}
                              placeholder="Feedback..."
                              className="min-w-[180px] resize-none"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => save(s)}
                              disabled={saving[s.id]}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {graded ? "Update" : "Save Grade"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

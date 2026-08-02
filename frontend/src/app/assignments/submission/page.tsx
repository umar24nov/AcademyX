"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import { FileText, X, Paperclip, CheckCircle2 } from "lucide-react";
import { useLive } from "@/lib/live";
import {
  fetchAssignmentDetail,
  mockAssignmentDetailData,
  submitAssignment,
} from "@/lib/live-data";
import { formatDate } from "@/lib/live-data";

export default function AssignmentSubmissionPage() {
  return (
    <React.Suspense fallback={null}>
      <AssignmentSubmissionPageInner />
    </React.Suspense>
  );
}

function AssignmentSubmissionPageInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const assignment = useLive(() => fetchAssignmentDetail(id), mockAssignmentDetailData);

  const [files, setFiles] = React.useState<string[]>([]);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFiles((prev) => [...prev, f.name]);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (id) {
      const ok = await submitAssignment(id, {
        title: title || undefined,
        notes: notes || undefined,
        attachments: files.length ? files : undefined,
      });
      if (ok) {
        setDone(true);
        toast({
          title: "Assignment submitted",
          description: "Your submission has been uploaded for grading.",
        });
      } else {
        toast({
          title: "Submission failed",
          description: "Please make sure you are logged in and try again.",
          variant: "destructive",
        });
      }
    } else {
      setDone(true);
      toast({
        title: "Assignment submitted",
        description: "Your submission has been uploaded for grading.",
      });
    }
    setSubmitting(false);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Submit Assignment"
          description="Review the assignment details and upload your work."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Instructions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <p className="text-sm text-text-muted">
                {assignment.course} • {assignment.batch} • Due {formatDate(assignment.dueAt)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="text-xs text-text-muted">Marks</p>
                  <p className="font-bold text-text-heading mt-0.5">{assignment.maxMarks}</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="text-xs text-text-muted">Submissions</p>
                  <p className="font-bold text-text-heading mt-0.5">{assignment.submissions}</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="text-xs text-text-muted">Status</p>
                  <Badge variant="default" className="mt-1.5">{done ? "Submitted" : "Active"}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-heading mb-2">Instructions</h4>
                <div className="prose-sm text-text-muted space-y-2 text-sm">
                  <p>
                    {assignment.description ?? "Follow the instructions provided by your instructor. Make sure your submission is complete before the due date."}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-heading mb-2">Reference Material</h4>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface-container-low max-w-sm">
                  <div className="h-9 w-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">Course material</p>
                    <p className="text-xs text-text-muted">{assignment.course}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icon name="download" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block">
                <span className="text-sm text-text-muted mb-1.5 block">Title</span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 4-bit counter design"
                />
              </label>

              <label className="block">
                <span className="text-sm text-text-muted mb-1.5 block">Notes for instructor</span>
                <Textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any comments about your submission..."
                />
              </label>

              <div>
                <span className="text-sm text-text-muted mb-1.5 block">Attachments</span>
                <div className="space-y-2">
                  {files.length === 0 && (
                    <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border-subtle rounded-lg p-6 cursor-pointer hover:border-primary/40 transition-colors text-center">
                      <Icon name="cloud_upload" className="h-8 w-8 text-text-muted" />
                      <span className="text-sm text-text-muted">Drop files here or click to browse</span>
                      <span className="text-xs text-text-muted/70">PDF, ZIP, PNG up to 10MB each</span>
                      <input type="file" className="hidden" onChange={addFile} />
                    </label>
                  )}
                  {files.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border-subtle bg-surface-container-low"
                    >
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="text-sm flex-1 min-w-0 truncate">{f}</span>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                        className="text-text-muted hover:text-error"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={submit} disabled={submitting}>
                <CheckCircle2 className="h-4 w-4" />
                Submit Assignment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

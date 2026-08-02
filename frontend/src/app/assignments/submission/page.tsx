"use client";

import * as React from "react";
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

export default function AssignmentSubmissionPage() {
  const { toast } = useToast();
  const [files, setFiles] = React.useState<string[]>([]);

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFiles((prev) => [...prev, f.name]);
  };

  const submit = () => {
    toast({
      title: "Assignment submitted",
      description: "Your submission has been uploaded for grading.",
    });
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
              <CardTitle className="text-lg">Digital Logic Design — Project 3</CardTitle>
              <p className="text-sm text-text-muted">Software Engineering • CS-B1 • Due in 3 days</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="text-xs text-text-muted">Marks</p>
                  <p className="font-bold text-text-heading mt-0.5">20</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="text-xs text-text-muted">Submissions</p>
                  <p className="font-bold text-text-heading mt-0.5">12/40</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="text-xs text-text-muted">Status</p>
                  <Badge variant="default" className="mt-1.5">Active</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-heading mb-2">Instructions</h4>
                <div className="prose-sm text-text-muted space-y-2 text-sm">
                  <p>
                    Design a 4-bit synchronous counter with parallel load. Your submission must
                    include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gate-level schematic (draw.io or PNG)</li>
                    <li>Verilog implementation with testbench</li>
                    <li>Truth table and K-map simplification</li>
                    <li>Simulation waveform screenshot</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-heading mb-2">Reference Material</h4>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface-container-low max-w-sm">
                  <div className="h-9 w-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">DLD-Lab-Manual.pdf</p>
                    <p className="text-xs text-text-muted">2.4 MB</p>
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
                <Input placeholder="e.g. 4-bit counter design" />
              </label>

              <label className="block">
                <span className="text-sm text-text-muted mb-1.5 block">Notes for instructor</span>
                <Textarea rows={4} placeholder="Add any comments about your submission..." />
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

              <Button className="w-full" onClick={submit}>
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

"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Icon } from "@/components/shared/icon";
import { RowActionsMenu } from "@/components/dashboard/row-menu";
import { useToast } from "@/components/ui/use-toast";
import { useLive } from "@/lib/live";
import { downloadCsv } from "@/lib/csv";
import { fetchReports, mockReportsData } from "@/lib/live-data";

function gradeFor(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "F";
}

export default function ReportsPage() {
  const { toast } = useToast();
  const reports = useLive(fetchReports, mockReportsData);

  const exportResults = () => {
    downloadCsv(
      "exam-results",
      ["Student", "Course", "Score", "Max", "Percentage", "Grade"],
      reports.examResults.map((r) => [r.student, r.course, r.score, r.max, `${r.percentage}%`, gradeFor(r.percentage)])
    );
    toast({ title: "Results exported", description: "Exam results exported to CSV." });
  };

  const generateReport = () => {
    const rows = [
      ...reports.examResults.map((r) => ["Exam", r.student, r.course, r.score, r.max, `${r.percentage}%`, gradeFor(r.percentage)]),
      ...reports.attendanceByBatch.map((a) => ["Attendance", a.batch, "—", "—", "—", `${a.rate}%`, "—"]),
    ];
    downloadCsv(
      "academic-report",
      ["Type", "Student / Batch", "Course", "Score", "Max", "Value", "Grade"],
      rows
    );
    toast({ title: "Report generated", description: "Academic report downloaded as CSV." });
  };

  const exportRow = (r: (typeof reports.examResults)[number]) => {
    downloadCsv(
      `result-${r.student.replace(/\s+/g, "-").toLowerCase()}`,
      ["Student", "Course", "Score", "Max", "Percentage", "Grade"],
      [[r.student, r.course, r.score, r.max, `${r.percentage}%`, gradeFor(r.percentage)]]
    );
    toast({ title: "Result exported", description: `${r.student}'s result exported to CSV.` });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Reports"
          description="Generate and export academic and financial reports."
          actions={
            <>
              <Button variant="outline" onClick={exportResults}>
                <Icon name="download" className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={generateReport}>
                <Icon name="description" className="h-4 w-4" />
                Generate Report
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue="cs-b1">
                <SelectTrigger className="mb-4"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs-b1">CS-B1</SelectItem>
                  <SelectItem value="cs-b2">CS-B2</SelectItem>
                  <SelectItem value="mech-a1">ME-A1</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-3">
                {reports.attendanceByBatch.map((a) => (
                  <div key={a.batch}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-muted">{a.batch}</span>
                      <span className="font-mono font-medium">{a.rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          a.rate >= 75 ? "bg-success-green" : "bg-tertiary"
                        }`}
                        style={{ width: `${a.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Exam Results</CardTitle>
              <Badge variant="success" className="font-mono">Term 1</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.examResults.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-on-surface">{r.student}</TableCell>
                      <TableCell className="text-text-muted">{r.course}</TableCell>
                      <TableCell className="font-mono text-right">{r.score}</TableCell>
                      <TableCell className="text-right text-text-muted">{r.max}</TableCell>
                      <TableCell className="font-mono text-right">{r.percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={r.percentage >= 75 ? "success" : r.percentage >= 50 ? "warning" : "destructive"}>
                          {gradeFor(r.percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <RowActionsMenu
                          iconClassName="h-5 w-5"
                          actions={[
                            {
                              label: "View Result",
                              icon: "visibility",
                              onSelect: () =>
                                toast({
                                  title: `${r.student} — ${gradeFor(r.percentage)}`,
                                  description: `${r.course} • ${r.score}/${r.max} (${r.percentage}%)`,
                                }),
                            },
                            {
                              label: "Export CSV",
                              icon: "download",
                              onSelect: () => exportRow(r),
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
      </div>
    </DashboardShell>
  );
}

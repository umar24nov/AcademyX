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
import { attendanceData, examResults } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Reports"
          description="Generate and export academic and financial reports."
          actions={
            <>
              <Button variant="outline">
                <Icon name="download" className="h-4 w-4" />
                Export CSV
              </Button>
              <Button>
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
                {attendanceData.byBatch.map((a) => (
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
                  {examResults.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-on-surface">{r.student}</TableCell>
                      <TableCell className="text-text-muted">{r.course}</TableCell>
                      <TableCell className="font-mono text-right">{r.score}</TableCell>
                      <TableCell className="text-right text-text-muted">{r.max}</TableCell>
                      <TableCell className="font-mono text-right">{r.percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={r.percentage >= 75 ? "success" : r.percentage >= 50 ? "warning" : "destructive"}>
                          {r.percentage >= 90 ? "A+" : r.percentage >= 80 ? "A" : r.percentage >= 70 ? "B+" : r.percentage >= 60 ? "B" : r.percentage >= 50 ? "C" : "F"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-text-muted">
                          <Icon name="more_vert" className="h-5 w-5" />
                        </Button>
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

"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/shared/icon";
import { useLive } from "@/lib/live";
import {
  fetchStudentDashboard,
  mockStudentDashboardData,
  fetchLiveClasses,
  mockLiveClassesData,
  formatTime,
} from "@/lib/live-data";
import { getStoredUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { attendanceRate, courses, assignments } = useLive(
    fetchStudentDashboard,
    mockStudentDashboardData
  );
  const liveClasses = useLive(fetchLiveClasses, mockLiveClassesData);
  const firstName = getStoredUser()?.name?.split(" ")[0] ?? "Student";

  const focus = courses[0];
  const upcoming = liveClasses.filter((c) => c.status !== "Ended").slice(0, 3);
  const nextUpcoming = upcoming[0];
  const chipLabel = !nextUpcoming
    ? liveClasses.some((c) => c.status === "Ended")
      ? "All today's classes are completed"
      : "No classes scheduled today"
    : nextUpcoming.status === "Live"
      ? "Live class is happening now"
      : `Next Class Starts in ${nextUpcoming.startsIn}`;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-heading mb-2">
              Welcome back, {firstName}.
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-medium border border-tertiary/20">
                <Icon name="schedule" className="h-4 w-4" />
                {chipLabel}
              </span>
              <p className="text-sm text-text-muted">
                Your learning streak: <span className="text-primary font-bold">12 Days</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/lectures">
              <Button variant="outline">Recorded Lectures</Button>
            </Link>
            <Link href="/courses">
              <Button>Latest Course Notes</Button>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          {focus ? (
            <div className="col-span-12 lg:col-span-8 p-6 rounded-xl bg-surface-container-low border border-border-subtle relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-text-heading">
                      {focus.title}
                    </h3>
                    <p className="text-sm text-text-muted">Next: {focus.next}</p>
                  </div>
                  <span className="text-primary font-mono text-xl">{focus.progress}%</span>
                </div>
                <div className="w-full h-3 bg-surface-container-lowest rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full"
                    style={{ width: `${focus.progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-surface-container">
                    <p className="text-text-muted text-[11px] uppercase tracking-tighter mb-1">
                      Upcoming Milestone
                    </p>
                    <p className="text-sm text-text-heading">{focus.next}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container">
                    <p className="text-text-muted text-[11px] uppercase tracking-tighter mb-1">
                      Lessons
                    </p>
                    <p className="text-sm text-text-heading">{focus.lessons}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container">
                    <p className="text-text-muted text-[11px] uppercase tracking-tighter mb-1">
                      Attendance
                    </p>
                    <p className="text-sm text-text-heading">{attendanceRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-12 lg:col-span-8 p-6 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-center text-center">
              <div>
                <Icon name="menu_book" className="h-10 w-10 mx-auto text-text-muted" />
                <p className="text-sm text-text-muted mt-3">No active course yet.</p>
                <Link href="/courses" className="text-primary text-sm hover:underline mt-1 inline-block">
                  Browse courses
                </Link>
              </div>
            </div>
          )}

          <div className="col-span-12 lg:col-span-4 p-6 rounded-xl bg-surface-container-low border border-border-subtle flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-text-heading">Achievements</h3>
              <Icon name="award" className="text-tertiary" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4 bg-surface-container-lowest rounded-lg border border-border-subtle/50 mb-4">
              <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mb-1">
                Global Standing
              </p>
              <h4 className="text-4xl font-bold text-primary mb-1">Rank #12</h4>
              <p className="text-sm text-success-green">Section A Top 1%</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container/50">
                <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center">
                  <Icon name="trending_up" className="h-[18px] w-[18px] text-tertiary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-text-heading">Speed Coder</p>
                  <div className="w-full h-1 bg-surface-container-lowest rounded-full mt-1">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container/50">
                <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center">
                  <Icon name="verified_user" className="h-[18px] w-[18px] text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-text-heading">Peer Mentor</p>
                  <div className="w-full h-1 bg-surface-container-lowest rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-text-heading">
                Today&apos;s Live Classes
              </h3>
              <Link href="/live-classes" className="text-primary text-sm hover:underline">
                View Schedule
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface-container-low border border-border-subtle text-center text-sm text-text-muted">
                No live classes scheduled today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((c) => {
                  const isLive = c.status === "Live";
                  const isEnded = c.status === "Ended";
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "p-5 rounded-xl bg-surface-container-low border border-border-subtle",
                        isLive && "hover:border-primary/50 transition-all"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center">
                          <Icon name="video" className="text-primary" />
                        </div>
                        {isLive ? (
                          <span className="px-2 py-1 rounded text-[10px] font-mono bg-success-green/20 text-success-green border border-success-green/20">
                            LIVE NOW
                          </span>
                        ) : isEnded ? (
                          <span className="px-2 py-1 rounded text-[10px] font-mono bg-surface-container-high text-text-muted">
                            ENDED
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-mono bg-surface-container-high text-text-muted">
                            {formatTime(c.startTime)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-text-heading mb-1">{c.title}</h4>
                      <p className="text-sm text-text-muted mb-4">
                        {c.teacher} • {c.location}
                      </p>
                      {isLive ? (
                        <Link href={`/live-classes/session?id=${c.id}`}>
                          <Button className="w-full">Join Now</Button>
                        </Link>
                      ) : isEnded ? (
                        c.recordingUrl ? (
                          <a href={c.recordingUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="w-full">
                              Watch Recording
                            </Button>
                          </a>
                        ) : (
                          <Link href={`/live-classes/session?id=${c.id}`}>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        )
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 border border-border-subtle text-sm rounded-lg text-text-muted cursor-not-allowed"
                        >
                          Starts in {c.startsIn}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-12 p-6 rounded-xl bg-surface-container-low border border-border-subtle">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-text-heading">
                Recent Assignments
              </h3>
              <Link href="/assignments" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>
            {assignments.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No recent assignments.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border-subtle">
                      <TableHead className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
                        Assignment Name
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
                        Course
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
                        Deadline
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
                        Status
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-wide text-text-muted text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a) => {
                      const badge =
                        a.status === "Submitted"
                          ? { variant: "success" as const, label: a.status, action: "View Details" }
                          : a.status === "Pending"
                            ? { variant: "warning" as const, label: a.status, action: "Submit Now" }
                            : { variant: "secondary" as const, label: a.status, action: "Continue" };
                      return (
                        <TableRow key={a.title} className="hover:bg-surface-variant/30 transition-colors">
                          <TableCell className="text-sm font-medium text-text-heading">
                            {a.title}
                          </TableCell>
                          <TableCell className="text-sm text-text-muted">{a.course}</TableCell>
                          <TableCell className="text-sm text-text-muted">{a.due}</TableCell>
                          <TableCell>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              href="/assignments"
                              className="text-primary hover:underline font-mono text-xs"
                            >
                              {badge.action}
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

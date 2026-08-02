"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/shared/icon";
import { Star, Search } from "lucide-react";
import { useLive } from "@/lib/live";
import {
  fetchCourses,
  fetchContinueWatching,
  mockCoursesData,
  mockContinueWatchingData,
} from "@/lib/live-data";

export default function CoursesLibraryPage() {
  const [search, setSearch] = React.useState("");
  const courses = useLive(fetchCourses, mockCoursesData);
  const continueWatching = useLive(fetchContinueWatching, mockContinueWatchingData);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Courses Library"
          description="Continue where you left off or explore the full lecture catalog."
          actions={
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                className="pl-10"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />

        {/* Continue watching */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-heading text-lg">Continue Watching</h3>
            <Link href="/lectures" className="text-sm text-primary hover:underline">
              View all lectures
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {continueWatching.map((c) => (
              <Card key={c.id} className="overflow-hidden group">
                <div className="relative h-32 bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
                  <Icon name="play_circle" className="h-10 w-10 text-white/90" />
                  <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {c.lessons}
                  </span>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-text-heading line-clamp-1">{c.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">Up next: {c.next}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Progress value={c.progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-mono text-text-muted">{c.progress}%</span>
                  </div>
                  <Button asChild size="sm" className="mt-4 w-full">
                    <Link href="/lectures">
                      <Icon name="play_circle" className="h-4 w-4" />
                      Resume
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Lecture catalog */}
        <section>
          <h3 className="font-semibold text-text-heading text-lg mb-3">Lecture Catalog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card key={c.id} className="overflow-hidden group">
                <div className="relative h-28 bg-surface-container-high flex items-center justify-center">
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="menu_book" className="h-9 w-9 text-text-muted" />
                  )}
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <Badge
                    variant={c.status === "Published" ? "success" : "secondary"}
                    className="absolute top-3 right-3"
                  >
                    {c.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-text-heading line-clamp-1 group-hover:text-primary transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {c.instructor} • {c.track}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
                    <span>
                      {c.modules} modules • {c.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-tertiary fill-tertiary" />
                      {c.rating > 0 ? c.rating.toFixed(1) : "New"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-text-muted">
                  <Icon name="search" className="h-8 w-8 mx-auto mb-2 text-text-muted/60" />
                  No courses match your search.
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

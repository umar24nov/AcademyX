"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/shared/icon";
import { useLive, useStoredUser } from "@/lib/live";
import { fetchLectures, mockLecturesData } from "@/lib/live-data";
import { Search, Play } from "lucide-react";

export default function RecordedLecturesPage() {
  const [search, setSearch] = React.useState("");
  const [visibility, setVisibility] = React.useState("all");
  const recordedLectures = useLive(fetchLectures, mockLecturesData);
  const user = useStoredUser();
  const isStudent = user?.role === "STUDENT";

  const filtered = recordedLectures.filter((l) => {
    const q = search.toLowerCase();
    const matches = l.title.toLowerCase().includes(q) || l.course.toLowerCase().includes(q);
    const matchesVis = visibility === "all" || l.visibility.toLowerCase() === visibility;
    return matches && matchesVis;
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Recorded Lectures"
          description={
            isStudent
              ? "Browse and watch recorded lectures from your courses."
              : "Upload and manage lecture recordings for your courses."
          }
          actions={
            !isStudent ? (
              <Button>
                <Icon name="upload" className="h-4 w-4" />
                Upload Lecture
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              className="pl-10"
              placeholder="Search lectures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="course wide">Course Wide</SelectItem>
              <SelectItem value="batch only">Batch Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <Card key={l.id} className="overflow-hidden group hover:border-primary/30 hover:indigo-glow transition-all">
              <div className="relative h-40 bg-surface-container-highest flex items-center justify-center">
                <Icon name="play_circle" className="h-14 w-14 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all" />
                <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-xs font-mono text-text-heading rounded">
                  {l.duration}
                </span>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-text-heading leading-snug">{l.title}</h4>
                  <Badge variant={l.visibility === "Public" ? "success" : l.visibility === "Course Wide" ? "default" : "secondary"}>
                    {l.visibility}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted mb-1">{l.course}</p>
                <p className="text-xs text-text-muted mb-4">{l.module}</p>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>
                    {l.uploadedBy} • {l.uploadedAt}
                  </span>
                  <Button size="sm" variant="outline" className="h-8">
                    <Play className="h-3.5 w-3.5" />
                    Play
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

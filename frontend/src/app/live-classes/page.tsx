"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import { useLive } from "@/lib/live";
import { getStoredUser } from "@/lib/api";
import { fetchLiveClasses, mockLiveClassesData } from "@/lib/live-data";

export default function LiveClassesPage() {
  const { toast } = useToast();
  const liveClasses = useLive(fetchLiveClasses, mockLiveClassesData);
  const user = React.useMemo(() => getStoredUser(), []);
  const isStudent = user?.role === "STUDENT";

  const startClass = (title: string) => {
    toast({
      title: "Launching live session",
      description: `Creating 100ms room for "${title}"...`,
    });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Live Classes"
          description={
            isStudent
              ? "Join your scheduled live classroom sessions."
              : "Schedule and manage real-time classroom sessions."
          }
          actions={
            !isStudent ? (
              <Button onClick={() => startClass("New session")}>
                <Icon name="video" className="h-4 w-4" />
                Schedule Live Class
              </Button>
            ) : undefined
          }
        />

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="live">Live Now</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {liveClasses.map((l) => (
              <Card key={l.id} className={l.status === "Live" ? "border-primary/40" : ""}>
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                      l.status === "Live"
                        ? "bg-error-container/10 text-error"
                        : l.status === "Ended"
                          ? "bg-surface-container-high text-text-muted"
                          : "bg-primary-container/10 text-primary"
                    }`}
                  >
                    <Icon name="video" className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-text-heading">{l.title}</h4>
                      <Badge
                        variant={l.status === "Live" ? "destructive" : l.status === "Ended" ? "outline" : "default"}
                        className="font-mono uppercase"
                      >
                        {l.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted mt-0.5">
                      {l.course} • {l.batch} • {l.teacher}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      <Icon name="schedule" className="h-3.5 w-3.5 inline mr-1" />
                      {l.location} • Starts in {l.startsIn} • {l.registered} registered
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isStudent ? (
                      <>
                        {l.status === "Live" ? (
                          <Button asChild>
                            <Link href={`/live-classes/session?id=${l.id}`}>
                              <Icon name="video" className="h-4 w-4" />
                              Join Now
                            </Link>
                          </Button>
                        ) : l.status === "Ended" ? (
                          l.recordingUrl ? (
                            <Button variant="outline" asChild>
                              <a href={l.recordingUrl} target="_blank" rel="noreferrer">
                                <Icon name="play_circle" className="h-4 w-4" />
                                Watch Recording
                              </a>
                            </Button>
                          ) : (
                            <Button variant="outline" asChild>
                              <Link href={`/live-classes/session?id=${l.id}`}>
                                <Icon name="play_circle" className="h-4 w-4" />
                                Details
                              </Link>
                            </Button>
                          )
                        ) : (
                          <button
                            disabled
                            className="h-9 px-4 border border-border-subtle text-sm rounded-lg text-text-muted cursor-not-allowed"
                          >
                            Starts in {l.startsIn}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {l.status !== "Ended" && (
                          <Button asChild>
                            <Link href={`/live-classes/session?id=${l.id}`}>
                              <Icon name="video" className="h-4 w-4" />
                              {l.status === "Live" ? "Join Now" : "Start Class"}
                            </Link>
                          </Button>
                        )}
                        {l.recordingUrl && (
                          <Button variant="outline" asChild>
                            <a href={l.recordingUrl} target="_blank" rel="noreferrer">
                              <Icon name="play_circle" className="h-4 w-4" />
                              Recording
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-text-muted">
                          <Icon name="more_vert" className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            {liveClasses.filter((l) => l.status === "Live").map((l) => (
              <LiveCard key={l.id} id={l.id} title={l.title} course={l.course} teacher={l.teacher} />
            ))}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {liveClasses.filter((l) => l.status === "Scheduled").map((l) => (
              <LiveCard key={l.id} id={l.id} title={l.title} course={l.course} teacher={l.teacher} />
            ))}
          </TabsContent>

          <TabsContent value="ended" className="space-y-4">
            {liveClasses.filter((l) => l.status === "Ended").map((l) => (
              <LiveCard key={l.id} id={l.id} title={l.title} course={l.course} teacher={l.teacher} ended />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function LiveCard({
  id,
  title,
  course,
  teacher,
  ended,
}: {
  id: string;
  title: string;
  course: string;
  teacher: string;
  ended?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-text-heading">{title}</h4>
          <p className="text-sm text-text-muted mt-0.5">{course} • {teacher}</p>
        </div>
        <Button asChild variant={ended ? "outline" : "default"}>
          <Link href={`/live-classes/session?id=${id}`}>
            <Icon name="video" className="h-4 w-4" />
            {ended ? "Details" : "Join"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Timer, Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLive } from "@/lib/live";
import {
  fetchExamDetail,
  mockExamDetailData,
  startExamAttempt,
  submitExamAttempt,
  type ExamAttemptPayload,
} from "@/lib/live-data";

export default function McqExamPage() {
  return (
    <React.Suspense fallback={null}>
      <McqExamPageInner />
    </React.Suspense>
  );
}

function McqExamPageInner() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("id") ?? undefined;
  const exam = useLive(() => fetchExamDetail(examId), mockExamDetailData);

  const questions = exam.questions;
  const TOTAL = Math.max(questions.length, 1);

  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [flagged, setFlagged] = React.useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ score?: number; status?: string } | null>(null);
  const [attemptId, setAttemptId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (examId) {
      startExamAttempt(examId).then(setAttemptId);
    }
  }, [examId]);

  const selected = answers[current];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / TOTAL) * 100;
  const q = questions[Math.min(current, TOTAL - 1)];

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    let score: number | undefined;
    if (examId && attemptId && questions.length) {
      const payload: ExamAttemptPayload[] = questions.map((qq, i) => ({
        questionId: qq.id,
        selectedOption: answers[i] !== undefined ? answers[i] : null,
      }));
      const res = await submitExamAttempt(examId, attemptId, payload);
      score = res?.score;
    }
    setResult({ score });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md border border-border-subtle bg-surface rounded-xl p-8 text-center flex flex-col gap-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-success-green/10 text-success-green flex items-center justify-center">
            <Send className="h-8 w-8" />
          </div>
          <h1 className="font-bold text-2xl text-text-heading">Exam Submitted</h1>
          <p className="text-sm text-text-muted">
            You answered <span className="font-bold text-on-surface">{answeredCount}</span> of{" "}
            <span className="font-bold text-on-surface">{TOTAL}</span> questions.
            {result?.score !== undefined
              ? ` Your score: ${result.score} / ${exam.totalMarks}.`
              : " Your results will be published after review."}
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button asChild>
              <Link href="/dashboard/student">Back to Dashboard</Link>
            </Button>
            <Button variant="outline" onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setCurrent(0);
              setFlagged(new Set());
            }}>
              Review Answers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-text-heading leading-none">{exam.title}</p>
              <p className="text-xs text-text-muted mt-1">{exam.course} • {exam.batch}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="warning" className="font-mono">
              <Timer className="h-3.5 w-3.5 mr-1" />
              {exam.durationMin * 60 - Math.round((Date.now() % 60000) / 1000)}:00 left
            </Badge>
            <Badge variant="secondary" className="font-mono">
              {answeredCount}/{TOTAL}
            </Badge>
            <Button onClick={submit} disabled={submitting} className="hidden sm:inline-flex">
              Submit
            </Button>
          </div>
        </div>
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      </header>

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
          {/* Question */}
          <div>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-sm text-primary">QUESTION {current + 1} OF {TOTAL}</span>
                  <button
                    onClick={toggleFlag}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium transition-colors",
                      flagged.has(current) ? "text-tertiary" : "text-text-muted hover:text-tertiary"
                    )}
                  >
                    <Flag className={cn("h-4 w-4", flagged.has(current) && "fill-current")} />
                    {flagged.has(current) ? "Flagged" : "Flag for review"}
                  </button>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-text-heading leading-snug mb-8">
                  {q.text}
                </h2>

                <div className="space-y-3">
                  {(q.options ?? []).map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswers((prev) => ({ ...prev, [current]: i }))}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3",
                        selected === i
                          ? "border-primary bg-primary/10 text-on-surface"
                          : "border-border-subtle bg-surface-container-low hover:border-primary/40 hover:bg-surface-container-high"
                      )}
                    >
                      <span
                        className={cn(
                          "h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0",
                          selected === i
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border-subtle text-text-muted"
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              {current < TOTAL - 1 ? (
                <Button onClick={() => setCurrent((c) => c + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting}>
                  Submit Exam
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Palette */}
          <aside className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-text-muted mb-4">Question Palette</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: TOTAL }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center border transition-colors",
                        i === current
                          ? "border-primary bg-primary text-primary-foreground"
                          : answers[i] !== undefined
                            ? "border-success-green/40 bg-success-green/10 text-success-green"
                            : flagged.has(i)
                              ? "border-tertiary/40 bg-tertiary-container/10 text-tertiary"
                              : "border-border-subtle text-text-muted hover:border-primary"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-2 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-success-green/40 bg-success-green/10" />
                    Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-tertiary/40 bg-tertiary-container/10" />
                    Flagged
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-border-subtle" />
                    Not visited
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={submit} disabled={submitting} className="w-full">
              Submit Exam
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}

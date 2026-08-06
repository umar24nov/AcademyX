"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Sparkles, ArrowRight, PartyPopper, ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { dashboardPathFor } from "@/lib/api";
import { useStoredUser } from "@/lib/live";
import {
  fetchOnboardingState,
  fetchOnboardingCourses,
  fetchOnboardingBatches,
  updateInstituteProfile,
  createTeacherOnboarding,
  createCourseOnboarding,
  createBatchOnboarding,
  createStudentOnboarding,
  onboardingStepLabels,
  type OnboardingState,
  type OnboardingStep,
} from "@/lib/live-data";

const steps: OnboardingStep[] = ["profile", "teacher", "course", "batch", "student"];

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={null}>
      <OnboardingInner />
    </React.Suspense>
  );
}

function OnboardingInner() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useStoredUser();
  const instituteId = user?.instituteId;

  const [state, setState] = React.useState<OnboardingState | null>(null);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const loadState = React.useCallback(async () => {
    const s = await fetchOnboardingState(instituteId ?? undefined);
    if (s) setState(s);
  }, [instituteId]);

  React.useEffect(() => {
    loadState();
  }, [loadState]);

  React.useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "INSTITUTE_ADMIN") {
      router.replace(dashboardPathFor(user.role));
    }
  }, [user, router]);

  React.useEffect(() => {
    if (state && !state.complete) {
      const firstIncomplete = steps.findIndex((s) => !state.done.includes(s));
      setStepIndex(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);
    }
  }, [state]);

  if (!user || user.role !== "INSTITUTE_ADMIN" || !instituteId) {
    return <DashboardShell><div className="h-64" /></DashboardShell>;
  }

  const current = steps[stepIndex];
  const done = state?.done ?? [];
  const complete = Boolean(state?.complete);
  const progress = Math.round((done.length / steps.length) * 100);

  const handleSaved = async () => {
    await loadState();
    setBusy(false);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Welcome to AcademyX"
          description={state ? `Set up ${state.instituteName} in under five minutes.` : "Set up your institute."}
        />

        {complete ? (
          <Card>
            <CardContent className="flex flex-col items-center text-center gap-4 py-16">
              <div className="w-16 h-16 rounded-full bg-success-green/10 text-success-green flex items-center justify-center">
                <PartyPopper className="h-8 w-8" />
              </div>
              <h2 className="font-bold text-2xl text-text-heading">Your institute is all set!</h2>
              <p className="text-sm text-text-muted max-w-md">
                You have completed every setup step. Start adding courses, live classes and exams — or invite your
                team to join.
              </p>
              <div className="mt-2 flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/dashboard/admin">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/students">Add more students</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-muted">
                  Setup progress
                </span>
                <span className="font-mono text-text-heading">{done.length}/{steps.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
              <Card>
                <CardContent className="p-4 flex flex-col gap-1">
                  {steps.map((s, i) => {
                    const isDone = done.includes(s);
                    const isActive = i === stepIndex;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStepIndex(i)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-on-surface-variant"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-success-green shrink-0" />
                        ) : (
                          <Circle className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-text-muted")} />
                        )}
                        <span className="text-sm font-medium">{onboardingStepLabels[s]}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  {current === "profile" && (
                    <ProfileStep
                      state={state}
                      busy={busy}
                      setBusy={setBusy}
                      onSaved={handleSaved}
                      toast={toast}
                    />
                  )}
                  {current === "teacher" && (
                    <TeacherStep busy={busy} setBusy={setBusy} onSaved={handleSaved} toast={toast} />
                  )}
                  {current === "course" && (
                    <CourseStep busy={busy} setBusy={setBusy} onSaved={handleSaved} toast={toast} />
                  )}
                  {current === "batch" && (
                    <BatchStep busy={busy} setBusy={setBusy} onSaved={handleSaved} toast={toast} />
                  )}
                  {current === "student" && (
                    <StudentStep busy={busy} setBusy={setBusy} onSaved={handleSaved} toast={toast} />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

interface StepProps {
  busy: boolean;
  setBusy: (v: boolean) => void;
  onSaved: () => Promise<void>;
  toast: ReturnType<typeof useToast>["toast"];
}

function StepNav({ onBack, showBack }: { onBack: () => void; showBack: boolean }) {
  return (
    <div className="flex items-center justify-between mt-6">
      {showBack ? (
        <Button variant="ghost" type="button" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : <span />}
      <p className="text-xs text-text-muted">
        <Sparkles className="h-3.5 w-3.5 inline mr-1" />
        Save to continue
      </p>
    </div>
  );
}

function ProfileStep({ state, busy, setBusy, onSaved, toast }: StepProps & { state: OnboardingState | null }) {
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [about, setAbout] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;
    setBusy(true);
    const ok = await updateInstituteProfile(state.instituteId, {
      phone,
      address,
      about: about || undefined,
      contactEmail: email || undefined,
    });
    if (ok) {
      toast({ title: "Profile saved", description: "Your institute details have been updated." });
      await onSaved();
    } else {
      toast({ title: "Save failed", description: "Please make sure you are logged in and try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-text-heading">Institute profile</h3>
        <p className="text-sm text-text-muted">
          Add your contact details so parents and students can reach your institute.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">Institute name</Label>
        <Input value={state?.instituteName ?? ""} disabled />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Contact email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@institute.com" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">About</Label>
        <Textarea
          rows={3}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="A short description of your institute..."
        />
      </div>
      <StepNav onBack={() => {}} showBack={false} />
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "Saving..." : "Save & Continue"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function TeacherStep({ busy, setBusy, onSaved, toast }: StepProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [department, setDepartment] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await createTeacherOnboarding({ name, email, employeeId, department: department || undefined });
    if (ok) {
      toast({
        title: "Teacher added",
        description: "Sign-in credentials: email + AcademyX@12345",
      });
      await onSaved();
    } else {
      toast({ title: "Save failed", description: "Check the details and try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-text-heading">Add your first teacher</h3>
        <p className="text-sm text-text-muted">
          Teachers can take live classes, grade assignments and track student progress.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">Full name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Ayesha Ansari" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@institute.com" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Employee ID</Label>
          <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP-001" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Department</Label>
          <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Physics" />
        </div>
      </div>
      <p className="text-xs text-text-muted bg-surface-container-low rounded-lg p-3">
        Default sign-in password is <code className="font-mono text-primary">AcademyX@12345</code>. They can change it
        after first login.
      </p>
      <StepNav onBack={() => {}} showBack={false} />
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "Adding..." : "Save & Continue"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function CourseStep({ busy, setBusy, onSaved, toast }: StepProps) {
  const [title, setTitle] = React.useState("");
  const [code, setCode] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [description, setDescription] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await createCourseOnboarding({
      title,
      code: code || undefined,
      category: category || undefined,
      level: level || undefined,
      description: description || undefined,
    });
    if (ok) {
      toast({ title: "Course created", description: "Add modules and lessons from the curriculum page." });
      await onSaved();
    } else {
      toast({ title: "Save failed", description: "Check the details and try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-text-heading">Create your first course</h3>
        <p className="text-sm text-text-muted">
          A course is the container for your curriculum — modules, lessons and lectures.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">Course title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. JEE Advanced Physics" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PHY-JEE" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Engineering" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-on-surface">Description</Label>
        <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" />
      </div>
      <StepNav onBack={() => {}} showBack={false} />
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "Creating..." : "Save & Continue"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function BatchStep({ busy, setBusy, onSaved, toast }: StepProps) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [courseId, setCourseId] = React.useState<string>("");
  const [capacity, setCapacity] = React.useState("");
  const [courses, setCourses] = React.useState<{ id: string; title: string }[]>([]);

  React.useEffect(() => {
    fetchOnboardingCourses().then(setCourses);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await createBatchOnboarding({
      name,
      code,
      courseId: courseId || null,
      capacity: capacity ? Number(capacity) : undefined,
    });
    if (ok) {
      toast({ title: "Batch created", description: "Students can now be added to this batch." });
      await onSaved();
    } else {
      toast({ title: "Save failed", description: "Check the details and try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-text-heading">Create a batch</h3>
        <p className="text-sm text-text-muted">
          Batches group students by course and schedule — perfect for morning, evening or weekend cohorts.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Batch name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. JEE 2027 Morning" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Batch code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="JEE27-M" required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Course</Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger><SelectValue placeholder={courses.length ? "Select a course" : "No courses yet"} /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Capacity</Label>
          <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="40" />
        </div>
      </div>
      <StepNav onBack={() => {}} showBack={false} />
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "Creating..." : "Save & Continue"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function StudentStep({ busy, setBusy, onSaved, toast }: StepProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [rollNumber, setRollNumber] = React.useState("");
  const [guardianName, setGuardianName] = React.useState("");
  const [guardianPhone, setGuardianPhone] = React.useState("");
  const [batchId, setBatchId] = React.useState("");
  const [batches, setBatches] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    fetchOnboardingBatches().then(setBatches);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await createStudentOnboarding({
      name,
      email,
      rollNumber,
      guardianName: guardianName || undefined,
      guardianPhone: guardianPhone || undefined,
      batchId: batchId || null,
    });
    if (ok) {
      toast({
        title: "Student added",
        description: "Sign-in credentials: email + AcademyX@12345",
      });
      await onSaved();
    } else {
      toast({ title: "Save failed", description: "Check the details and try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-text-heading">Add your first student</h3>
        <p className="text-sm text-text-muted">
          Students get their own portal with courses, live classes, exams and assignments.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Khan" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@institute.com" required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Roll number</Label>
          <Input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="AX-2026-001" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Batch</Label>
          <Select value={batchId} onValueChange={setBatchId}>
            <SelectTrigger><SelectValue placeholder={batches.length ? "Select a batch" : "No batches yet"} /></SelectTrigger>
            <SelectContent>
              {batches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Guardian name</Label>
          <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Parent / guardian" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-on-surface">Guardian phone</Label>
          <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
      </div>
      <p className="text-xs text-text-muted bg-surface-container-low rounded-lg p-3">
        Default sign-in password is <code className="font-mono text-primary">AcademyX@12345</code>.
      </p>
      <StepNav onBack={() => {}} showBack={false} />
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "Adding..." : "Finish & Continue"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

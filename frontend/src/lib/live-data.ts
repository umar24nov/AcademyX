import { api } from "@/lib/api";
import {
  courses as mockCourses,
  batches as mockBatches,
  students as mockStudents,
  teachers as mockTeachers,
  liveClasses as mockLiveClasses,
  recordedLectures as mockLectures,
  exams as mockExams,
  assignments as mockAssignments,
  payments as mockPayments,
  revenueSeries as mockRevenueSeries,
  messages as mockConversations,
  institutes as mockInstitutes,
  dashboardStats as mockDashboardStats,
  announcements as mockAnnouncements,
  recentAdmissions as mockRecentAdmissions,
  activity as mockActivity,
  attendanceData as mockAttendanceData,
  examResults as mockExamResults,
  chatThread as mockChatThread,
  examQuestions as mockExamQuestions,
} from "@/lib/mock-data";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_FULL = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  const hrs = dt.getHours();
  const mins = dt.getMinutes();
  const ampm = hrs >= 12 ? "PM" : "AM";
  const h12 = hrs % 12 === 0 ? 12 : hrs % 12;
  return `${MONTH_FULL[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()} • ${h12}:${mins
    .toString()
    .padStart(2, "0")} ${ampm}`;
}

export function formatTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  const hrs = dt.getHours();
  const mins = dt.getMinutes();
  const ampm = hrs >= 12 ? "PM" : "AM";
  const h12 = hrs % 12 === 0 ? 12 : hrs % 12;
  return `${h12}:${mins.toString().padStart(2, "0")} ${ampm}`;
}

export function timeAgo(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function tryGet<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export interface CourseRow {
  id: string;
  code: string;
  title: string;
  track: string;
  status: string;
  enrolled: number;
  rating: number;
  reviews: number;
  thumbnail: string | null;
  instructor: string;
  modules: number;
  lessons: number;
}

interface ApiCourse {
  id: string;
  title: string;
  code?: string | null;
  category?: string | null;
  status: string;
  thumbnailUrl?: string | null;
  createdByName?: string | null;
  _count?: { modules?: number; batches?: number };
}

export const mockCoursesData: CourseRow[] = mockCourses;

export async function fetchCourses(): Promise<CourseRow[]> {
  const live = await tryGet<{ courses: ApiCourse[] }>("/courses");
  if (!live) return mockCoursesData;
  return live.courses.map((c) => ({
    id: c.id,
    code: c.code ?? c.title.slice(0, 3).toUpperCase(),
    title: c.title,
    track: c.category ?? "General",
    status: c.status === "PUBLISHED" ? "Published" : c.status === "ARCHIVED" ? "Archived" : "Draft",
    enrolled: c._count?.batches ?? 0,
    rating: 0,
    reviews: 0,
    thumbnail: c.thumbnailUrl ?? null,
    instructor: c.createdByName ?? "—",
    modules: c._count?.modules ?? 0,
    lessons: 0,
  }));
}

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------

export interface BatchRow {
  id: string;
  name: string;
  code: string;
  course: string;
  teacher: string;
  schedule: string;
  students: number;
  capacity: number;
  status: string;
  startDate: string;
}

interface ApiBatch {
  id: string;
  name: string;
  code: string;
  course?: { title: string } | null;
  capacity?: number | null;
  startDate?: string | null;
  status: string;
  _count?: { students?: number };
}

export const mockBatchesData: BatchRow[] = mockBatches;

export async function fetchBatches(): Promise<BatchRow[]> {
  const live = await tryGet<{ batches: ApiBatch[] }>("/batches");
  if (!live) return mockBatchesData;
  return live.batches.map((b) => {
    const students = b._count?.students ?? 0;
    const capacity = b.capacity ?? 0;
    const status =
      b.status === "UPCOMING"
        ? "Upcoming"
        : b.status === "COMPLETED"
          ? "Completed"
          : capacity > 0 && students >= capacity
            ? "Full"
            : "Active";
    return {
      id: b.id,
      name: b.name,
      code: b.code,
      course: b.course?.title ?? "—",
      teacher: "—",
      schedule: "—",
      students,
      capacity,
      status,
      startDate: b.startDate ? new Date(b.startDate).toISOString().slice(0, 10) : "",
    };
  });
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export interface StudentRow {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  attendance: number;
  status: string;
  enrolledOn: string;
}

interface ApiStudent {
  id: string;
  rollNumber?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
  createdAt?: string;
  batch?: { id: string; name: string; code: string } | null;
}

export const mockStudentsData: StudentRow[] = mockStudents;

export async function fetchStudents(): Promise<StudentRow[]> {
  const live = await tryGet<{ students: ApiStudent[] }>("/students");
  if (!live) return mockStudentsData;
  return live.students.map((s) => ({
    id: s.id,
    studentId: s.rollNumber ?? s.id,
    name: s.name ?? "—",
    initials: initialsOf(s.name ?? "—"),
    email: s.email ?? "—",
    phone: s.phone ?? "—",
    course: s.batch?.name ?? "—",
    batch: s.batch?.code ?? s.batch?.name ?? "—",
    attendance: 0,
    status: s.status === "ACTIVE" ? "Active" : "Suspended",
    enrolledOn: formatDate(s.createdAt),
  }));
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

export interface TeacherRow {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  subjects: string[];
  batches: number;
  students: number;
  attendance: number;
  status: string;
}

interface ApiTeacher {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  specialization?: string | null;
  status?: string;
  _count?: { courses?: number };
}

export const mockTeachersData: TeacherRow[] = mockTeachers;

export async function fetchTeachers(): Promise<TeacherRow[]> {
  const live = await tryGet<{ teachers: ApiTeacher[] }>("/teachers");
  if (!live) return mockTeachersData;
  return live.teachers.map((t) => ({
    id: t.id,
    name: t.name ?? "—",
    initials: initialsOf(t.name ?? "—"),
    email: t.email ?? "—",
    phone: t.phone ?? "—",
    subjects: [t.department, t.specialization].filter((x): x is string => Boolean(x)),
    batches: 0,
    students: 0,
    attendance: 0,
    status: t.status === "ACTIVE" ? "Active" : t.status === "INVITED" ? "Invited" : "Suspended",
  }));
}

// ---------------------------------------------------------------------------
// Live classes
// ---------------------------------------------------------------------------

export interface LiveClassRow {
  id: string;
  title: string;
  course: string;
  batch: string;
  teacher: string;
  roomId?: string;
  status: string;
  startsIn: string;
  location: string;
  registered: number;
  startTime: string;
  recordingUrl?: string;
}

interface ApiLiveClass {
  id: string;
  title: string;
  course: string;
  batch: string;
  teacher: string;
  roomId?: string | null;
  status: string;
  startsIn: string;
  location: string;
  registered: number;
  startsAt: string;
  recordingUrl?: string | null;
}

export const mockLiveClassesData: LiveClassRow[] = mockLiveClasses;

export async function fetchLiveClasses(): Promise<LiveClassRow[]> {
  const live = await tryGet<{ liveClasses: ApiLiveClass[] }>("/live-classes");
  if (!live) return mockLiveClassesData;
  return live.liveClasses.map((l) => ({
    id: l.id,
    title: l.title,
    course: l.course,
    batch: l.batch,
    teacher: l.teacher,
    roomId: l.roomId ?? undefined,
    status: l.status,
    startsIn: l.startsIn,
    location: l.location,
    registered: l.registered,
    startTime: l.startsAt,
    recordingUrl: l.recordingUrl ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Recorded lectures
// ---------------------------------------------------------------------------

export interface LectureRow {
  id: string;
  title: string;
  course: string;
  module: string;
  duration: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  visibility: string;
  thumbnail: string | null;
}

interface ApiLecture {
  id: string;
  title: string;
  course: string;
  module: string;
  duration?: string | null;
  size?: string | null;
  visibility: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const mockLecturesData: LectureRow[] = mockLectures;

export async function fetchLectures(): Promise<LectureRow[]> {
  const live = await tryGet<{ lectures: ApiLecture[] }>("/lectures");
  if (!live) return mockLecturesData;
  return live.lectures.map((l) => ({
    id: l.id,
    title: l.title,
    course: l.course,
    module: l.module,
    duration: l.duration ?? "—",
    size: l.size ?? "—",
    uploadedBy: l.uploadedBy,
    uploadedAt: l.uploadedAt,
    visibility: l.visibility,
    thumbnail: null,
  }));
}

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

export interface ExamRow {
  id: string;
  title: string;
  course: string;
  batch: string;
  type: string;
  questions: number;
  duration: string;
  totalMarks: number;
  scheduledFor: string;
  status: string;
  attempts: number;
}

interface ApiExam {
  id: string;
  title: string;
  type: string;
  durationMin: number;
  totalMarks: number;
  scheduledAt?: string | null;
  status: string;
  course?: { title: string } | null;
  batch?: { name: string } | null;
  _count?: { questions?: number; attempts?: number };
}

export const mockExamsData: ExamRow[] = mockExams;

function examStatusLabel(s: string): string {
  switch (s) {
    case "PUBLISHED": return "Published";
    case "SCHEDULED": return "Scheduled";
    case "LIVE": return "Live";
    case "COMPLETED": return "Completed";
    default: return "Draft";
  }
}

export async function fetchExams(): Promise<ExamRow[]> {
  const live = await tryGet<{ exams: ApiExam[] }>("/exams");
  if (!live) return mockExamsData;
  return live.exams.map((e) => ({
    id: e.id,
    title: e.title,
    course: e.course?.title ?? "—",
    batch: e.batch?.name ?? "—",
    type: e.type === "SUBJECTIVE" ? "Subjective" : e.type === "MIXED" ? "Mixed" : "MCQ",
    questions: e._count?.questions ?? 0,
    duration: `${e.durationMin} min`,
    totalMarks: e.totalMarks,
    scheduledFor: e.scheduledAt ? formatDate(e.scheduledAt) : "—",
    status: examStatusLabel(e.status),
    attempts: e._count?.attempts ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

export interface AssignmentRow {
  id: string;
  title: string;
  course: string;
  batch: string;
  due: string;
  submissions: number;
  totalStudents: number;
  status: string;
}

interface ApiAssignment {
  id: string;
  title: string;
  dueAt?: string | null;
  status: string;
  course?: { title: string } | null;
  batch?: { name: string } | null;
  _count?: { submissions?: number };
}

export const mockAssignmentsData: AssignmentRow[] = mockAssignments;

export async function fetchAssignments(): Promise<AssignmentRow[]> {
  const live = await tryGet<{ assignments: ApiAssignment[] }>("/assignments");
  if (!live) return mockAssignmentsData;
  return live.assignments.map((a) => ({
    id: a.id,
    title: a.title,
    course: a.course?.title ?? "—",
    batch: a.batch?.name ?? "—",
    due: a.dueAt ? formatDate(a.dueAt) : "—",
    submissions: a._count?.submissions ?? 0,
    totalStudents: 0,
    status: a.status === "GRADING" ? "Grading" : "Active",
  }));
}

// ---------------------------------------------------------------------------
// Financials (payments + revenue series)
// ---------------------------------------------------------------------------

export interface PaymentRow {
  id: string;
  txId: string;
  student: string;
  studentId: string;
  course: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  invoice: string;
}

interface ApiPayment {
  id: string;
  txId: string;
  student?: string | null;
  amount: number;
  method?: string;
  status?: string;
  date?: string;
  purpose?: string | null;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  enrollments: number;
  [key: string]: string | number;
}

export interface FinancialsData {
  payments: PaymentRow[];
  revenueSeries: RevenuePoint[];
}

export const mockFinancialsData: FinancialsData = {
  payments: mockPayments,
  revenueSeries: mockRevenueSeries,
};

function methodLabel(m: string | undefined): string {
  switch (m) {
    case "RAZORPAY": return "Razorpay";
    case "CARD": return "Card";
    case "UPI": return "UPI";
    case "NETBANKING": return "Net Banking";
    case "OFFLINE": return "Offline";
    default: return m ?? "—";
  }
}

function paymentStatusLabel(s: string | undefined): string {
  switch (s) {
    case "SUCCESS": return "Success";
    case "PENDING": return "Pending";
    case "FAILED": return "Failed";
    case "REFUNDED": return "Refunded";
    default: return s ?? "—";
  }
}

function buildRevenueSeries(payments: { amount: number; date?: string }[]): RevenuePoint[] {
  const now = new Date();
  const map = new Map<string, RevenuePoint>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map.set(`${d.getFullYear()}-${d.getMonth()}`, {
      month: MONTHS[d.getMonth()],
      revenue: 0,
      enrollments: 0,
    });
  }
  for (const p of payments) {
    const dt = new Date(p.date ?? "");
    if (Number.isNaN(dt.getTime())) continue;
    const bucket = map.get(`${dt.getFullYear()}-${dt.getMonth()}`);
    if (bucket) bucket.revenue += Number(p.amount) || 0;
  }
  const series = [...map.values()];
  return series.some((p) => p.revenue > 0) ? series : mockRevenueSeries;
}

export async function fetchFinancials(): Promise<FinancialsData> {
  const live = await tryGet<{ payments: ApiPayment[] }>("/payments");
  if (!live) return mockFinancialsData;
  const payments: PaymentRow[] = live.payments.map((p) => ({
    id: p.id,
    txId: p.txId,
    student: p.student ?? "—",
    studentId: "—",
    course: p.purpose ?? "—",
    amount: p.amount,
    method: methodLabel(p.method),
    status: paymentStatusLabel(p.status),
    date: formatDate(p.date),
    invoice: "—",
  }));
  return { payments, revenueSeries: buildRevenueSeries(live.payments) };
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface ConversationRow {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  initials: string;
}

interface ApiConversation {
  id: string;
  title?: string | null;
  isGroup: boolean;
  members: { id: string; name: string; role: string }[];
  preview?: string;
  time?: string;
  unread?: number;
}

export const mockConversationsData: ConversationRow[] = mockConversations;

export async function fetchConversations(): Promise<ConversationRow[]> {
  const live = await tryGet<{ conversations: ApiConversation[] }>("/messages/conversations");
  if (!live) return mockConversationsData;
  return live.conversations.map((c) => {
    const name = c.title ?? c.members[0]?.name ?? "Chat";
    return {
      id: c.id,
      name,
      role: c.isGroup ? "Group" : c.members[0]?.role ?? "Member",
      preview: c.preview ?? "",
      time: timeAgo(c.time),
      unread: c.unread ?? 0,
      online: false,
      initials: initialsOf(name),
    };
  });
}

// ---------------------------------------------------------------------------
// Institutes
// ---------------------------------------------------------------------------

export interface InstituteRow {
  id: string;
  name: string;
  initials: string;
  domain: string;
  owner: string;
  plan: string;
  students: number;
  courses: number;
  mrr: number;
  status: string;
  joined: string;
}

interface ApiInstitute {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  owner?: string;
  students?: number;
  courses?: number;
  mrr?: number;
  initials?: string;
}

export const mockInstitutesData: InstituteRow[] = mockInstitutes;

function planLabel(p: string): string {
  switch (p) {
    case "ENTERPRISE": return "Enterprise";
    case "PRO": return "Pro";
    case "BASIC": return "Basic";
    case "FREE": return "Free";
    default: return p;
  }
}

function instituteStatusLabel(s: string): string {
  switch (s) {
    case "ACTIVE": return "Active";
    case "SUSPENDED": return "Suspended";
    case "TRIAL": return "Trial";
    default: return s;
  }
}

export async function fetchInstitutes(): Promise<InstituteRow[]> {
  const live = await tryGet<{ institutes: ApiInstitute[] }>("/institutes");
  if (!live) return mockInstitutesData;
  return live.institutes.map((i) => ({
    id: i.id,
    name: i.name,
    initials: i.initials ?? initialsOf(i.name),
    domain: i.slug,
    owner: i.owner ?? "—",
    plan: planLabel(i.plan),
    students: i.students ?? 0,
    courses: i.courses ?? 0,
    mrr: i.mrr ?? 0,
    status: instituteStatusLabel(i.status),
    joined: "—",
  }));
}

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

export interface AnnouncementRow {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  audience: string;
}

export interface AdmissionRow {
  id: string;
  name: string;
  initials: string;
  department: string;
  date: string;
  status: string;
  fees: string;
}

export interface AdminOverviewData {
  dashboardStats: typeof mockDashboardStats;
  revenueSeries: RevenuePoint[];
  announcements: AnnouncementRow[];
  recentAdmissions: AdmissionRow[];
  activity: typeof mockActivity;
}

export const mockAdminOverviewData: AdminOverviewData = {
  dashboardStats: mockDashboardStats,
  revenueSeries: mockRevenueSeries,
  announcements: mockAnnouncements,
  recentAdmissions: mockRecentAdmissions,
  activity: mockActivity,
};

interface ApiOverviewStats {
  students?: number;
  teachers?: number;
  courses?: number;
  batches?: number;
  exams?: number;
  activeAssignments?: number;
  liveNow?: number;
  revenue?: number;
}

interface ApiAnnouncement {
  id: string;
  title: string;
  content?: string | null;
  author?: string | null;
  createdAt: string;
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  const [overview, payments, studentList] = await Promise.all([
    tryGet<{ stats: ApiOverviewStats; announcements?: ApiAnnouncement[] }>("/dashboard/overview"),
    tryGet<{ payments: ApiPayment[] }>("/payments"),
    tryGet<{ students: ApiStudent[] }>("/students"),
  ]);

  if (!overview) return mockAdminOverviewData;

  const successSum = (payments?.payments ?? [])
    .filter((p) => p.status === "SUCCESS")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pendingSum = (payments?.payments ?? [])
    .filter((p) => p.status === "PENDING")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const stats = {
    ...mockDashboardStats,
    activeStudents: { ...mockDashboardStats.activeStudents, total: overview.stats.students ?? mockDashboardStats.activeStudents.total },
    netGrowth: { ...mockDashboardStats.netGrowth, total: successSum || (overview.stats.revenue ?? mockDashboardStats.netGrowth.total) },
    pendingFees: { ...mockDashboardStats.pendingFees, total: pendingSum || mockDashboardStats.pendingFees.total },
    todayClasses: { ...mockDashboardStats.todayClasses, total: overview.stats.liveNow ?? mockDashboardStats.todayClasses.total },
  };

  const announcements: AnnouncementRow[] =
    overview.announcements && overview.announcements.length
      ? overview.announcements.map((a) => ({
          id: a.id,
          type: "Update",
          title: a.title,
          description: a.content ?? "",
          time: timeAgo(a.createdAt),
          audience: "Institute",
        }))
      : mockAnnouncements;

  const recentAdmissions: AdmissionRow[] =
    studentList && studentList.students.length
      ? studentList.students.slice(0, 5).map((s) => ({
          id: s.rollNumber ?? s.id,
          name: s.name ?? "—",
          initials: initialsOf(s.name ?? "—"),
          department: s.batch?.name ?? "—",
          date: formatDate(s.createdAt),
          status: s.status === "ACTIVE" ? "Verified" : "Processing",
          fees: "Paid",
        }))
      : mockRecentAdmissions;

  return {
    dashboardStats: stats,
    revenueSeries: buildRevenueSeries(payments?.payments ?? []),
    announcements,
    recentAdmissions,
    activity: mockActivity,
  };
}

// ---------------------------------------------------------------------------
// Super-admin dashboard
// ---------------------------------------------------------------------------

export interface SuperAdminInstituteRow {
  id: string;
  name: string;
  plan: string;
  students: number;
  mrr: number;
  status: string;
  health: number;
}

export interface SuperAdminOverviewData {
  platformStats: {
    totalInstitutes: number;
    activeInstitutes: number;
    totalStudents: number;
    mrr: number;
    revenueGrowth: number;
    churn: number;
    trialConversions: number;
    avgRevenuePerInstitute: number;
  };
  mrrSeries: RevenuePoint[];
  institutes: SuperAdminInstituteRow[];
}

export const mockSuperAdminOverviewData: SuperAdminOverviewData = {
  platformStats: {
    totalInstitutes: 1284,
    activeInstitutes: 1022,
    totalStudents: 348200,
    mrr: 465000,
    revenueGrowth: 18,
    churn: 2.4,
    trialConversions: 38,
    avgRevenuePerInstitute: 455,
  },
  mrrSeries: mockRevenueSeries.map((p) => ({ ...p, institutes: p.enrollments })),
  institutes: [
    { id: "inst_001", name: "Sunrise Academy", plan: "Professional", students: 2842, mrr: 1240, status: "Active", health: 96 },
    { id: "inst_002", name: "Sharma Classes", plan: "Starter", students: 540, mrr: 340, status: "Active", health: 82 },
    { id: "inst_003", name: "Al-Madina Coaching Centre", plan: "Enterprise", students: 12300, mrr: 8900, status: "Active", health: 99 },
    { id: "inst_004", name: "Navodaya Academy", plan: "Professional", students: 2100, mrr: 980, status: "Trial", health: 61 },
    { id: "inst_005", name: "Crescent Institute", plan: "Starter", students: 320, mrr: 0, status: "Paused", health: 40 },
  ],
};

export async function fetchSuperAdminOverview(): Promise<SuperAdminOverviewData> {
  const [overview, institutes] = await Promise.all([
    tryGet<{ stats: { institutes?: number; totalUsers?: number; totalCourses?: number; mrr?: number } }>("/dashboard/overview"),
    tryGet<{ institutes: ApiInstitute[] }>("/institutes"),
  ]);

  if (!overview) return mockSuperAdminOverviewData;

  const base = mockSuperAdminOverviewData.platformStats;
  const stats = {
    ...base,
    totalInstitutes: overview.stats.institutes ?? base.totalInstitutes,
    activeInstitutes: overview.stats.institutes ?? base.activeInstitutes,
    totalStudents: overview.stats.totalUsers ?? base.totalStudents,
    mrr: overview.stats.mrr ?? base.mrr,
  };

  const rows: SuperAdminInstituteRow[] =
    institutes && institutes.institutes.length
      ? institutes.institutes.map((i) => ({
          id: i.id,
          name: i.name,
          plan: planLabel(i.plan),
          students: i.students ?? 0,
          mrr: i.mrr ?? 0,
          status: instituteStatusLabel(i.status),
          health: 0,
        }))
      : mockSuperAdminOverviewData.institutes;

  return {
    platformStats: stats,
    mrrSeries: mockSuperAdminOverviewData.mrrSeries,
    institutes: rows,
  };
}

// ---------------------------------------------------------------------------
// Student dashboard
// ---------------------------------------------------------------------------

export interface StudentCourseRow {
  title: string;
  progress: number;
  lessons: string;
  next: string;
}

export interface StudentAssignmentRow {
  title: string;
  course: string;
  due: string;
  status: "Pending" | "In Progress" | "Submitted";
}

export interface StudentDashboardData {
  attendanceRate: number;
  avgScore: number;
  courseCount: number;
  certificates: number;
  courses: StudentCourseRow[];
  nextClass: { title: string; meta: string; time: string };
  assignments: StudentAssignmentRow[];
}

export const mockStudentDashboardData: StudentDashboardData = {
  attendanceRate: 92,
  avgScore: 87,
  courseCount: 3,
  certificates: 2,
  courses: [
    { title: "Advanced Distributed Systems", progress: 68, lessons: "24/35 lessons", next: "CAP Theorem Deep Dive" },
    { title: "Foundations of Neural Networks", progress: 42, lessons: "11/26 lessons", next: "Backpropagation" },
    { title: "Data Visualization with D3", progress: 85, lessons: "19/22 lessons", next: "Final Project Brief" },
  ],
  nextClass: {
    title: "Introduction to UI Design Systems",
    meta: "WEB-W1 • Dr. Kavya Reddy • 2:00 PM",
    time: "LIVE TODAY",
  },
  assignments: [
    { title: "Distributed KV Store Implementation", course: "Distributed Systems", due: "Due in 3 days", status: "Pending" },
    { title: "Backpropagation Notebook", course: "Neural Networks", due: "Due in 6 days", status: "In Progress" },
    { title: "D3 Interactive Dashboard", course: "Data Visualization", due: "Submitted", status: "Submitted" },
  ],
};

interface ApiStudentDashboard {
  enrollments?: { course?: { id?: string; title?: string } | null }[];
  upcomingClasses?: {
    title: string;
    startsAt: string;
    status: string;
  }[];
  pendingAssignments?: {
    id: string;
    title: string;
    course?: string | null;
    dueAt?: string | null;
    submitted: boolean;
  }[];
  attendanceRate?: number;
}

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  const live = await tryGet<ApiStudentDashboard>("/dashboard/student");
  if (!live) return mockStudentDashboardData;

  const courses: StudentCourseRow[] = (live.enrollments ?? []).map((e) => ({
    title: e.course?.title ?? "Untitled Course",
    progress: 0,
    lessons: "0 lessons",
    next: "—",
  }));

  const nextClass =
    live.upcomingClasses && live.upcomingClasses.length
      ? (() => {
          const c = live.upcomingClasses[0];
          return {
            title: c.title,
            meta: c.status === "LIVE" ? formatTime(c.startsAt) : `Starts at ${formatTime(c.startsAt)}`,
            time: c.status === "LIVE" ? "LIVE TODAY" : "UPCOMING",
          };
        })()
      : mockStudentDashboardData.nextClass;

  const assignments: StudentAssignmentRow[] =
    live.pendingAssignments && live.pendingAssignments.length
      ? live.pendingAssignments.slice(0, 6).map((a) => ({
          title: a.title,
          course: a.course ?? "—",
          due: a.submitted ? "Submitted" : formatDate(a.dueAt),
          status: a.submitted ? "Submitted" : "Pending",
        }))
      : mockStudentDashboardData.assignments;

  return {
    attendanceRate: live.attendanceRate ?? mockStudentDashboardData.attendanceRate,
    avgScore: mockStudentDashboardData.avgScore,
    courseCount: courses.length || mockStudentDashboardData.courseCount,
    certificates: mockStudentDashboardData.certificates,
    courses: courses.length ? courses : mockStudentDashboardData.courses,
    nextClass,
    assignments: assignments.length ? assignments : mockStudentDashboardData.assignments,
  };
}

// ---------------------------------------------------------------------------
// Teacher dashboard
// ---------------------------------------------------------------------------

export interface TeacherClassRow {
  id: string;
  title: string;
  meta: string;
  time: string;
  label: string;
}

export interface TeacherMaterialRow {
  id: string;
  icon: string;
  title: string;
  meta: string;
}

export interface TeacherDashboardData {
  name: string;
  stats: {
    classesToday: number;
    ungradedAssignments: number;
    students: number;
    attendanceRate: number;
  };
  weeklyPerformance: number[];
  attendanceToday: { present: number; total: number; rate: number };
  nextClass: TeacherClassRow | null;
  upcomingClasses: TeacherClassRow[];
  materials: TeacherMaterialRow[];
}

function materialIcon(fileType: string): string {
  const t = (fileType ?? "").toLowerCase();
  if (t.includes("video") || t.includes("mp4")) return "play_circle";
  if (t.includes("zip") || t.includes("rar")) return "folder_zip";
  return "description";
}

function sizeLabel(size: string | null | undefined): string {
  if (!size) return "";
  return ` • ${size}`;
}

function startsLabel(startsAt: string | Date): string {
  const dt = new Date(startsAt);
  if (Number.isNaN(dt.getTime())) return formatTime(startsAt);
  const mins = Math.round((dt.getTime() - Date.now()) / 60000);
  if (mins > 0 && mins <= 90) return `Starts in ${mins}m`;
  return formatTime(startsAt);
}

interface ApiTeacherDashboard {
  name?: string;
  stats?: {
    classesToday?: number;
    ungradedAssignments?: number;
    students?: number;
    attendanceRate?: number;
  };
  weeklyPerformance?: number[];
  attendanceToday?: { present?: number; total?: number; rate?: number };
  nextClass?: {
    id: string;
    title: string;
    batch?: string | null;
    course?: string | null;
    startsAt: string;
    status?: string;
  } | null;
  upcomingClasses?: {
    id: string;
    title: string;
    batch?: string | null;
    course?: string | null;
    startsAt: string;
    status?: string;
  }[];
  materials?: {
    id: string;
    title: string;
    fileType: string;
    size?: string | null;
    createdAt?: string;
  }[];
}

function teacherClassRow(c: NonNullable<ApiTeacherDashboard["nextClass"]>, next: boolean): TeacherClassRow {
  const meta = [c.batch, c.course].filter(Boolean).join(" • ") || "—";
  const isLive = c.status === "LIVE";
  return {
    id: c.id,
    title: c.title,
    meta,
    time: isLive ? "LIVE NOW" : startsLabel(c.startsAt),
    label: next ? "NEXT CLASS" : isLive ? "LIVE NOW" : "UPCOMING",
  };
}

export const mockTeacherDashboardData: TeacherDashboardData = {
  name: "Prof. Imtiaz Ahmed",
  stats: { classesToday: 3, ungradedAssignments: 12, students: 96, attendanceRate: 94 },
  weeklyPerformance: [40, 65, 55, 80, 72, 90, 45],
  attendanceToday: { present: 42, total: 45, rate: 94 },
  nextClass: {
    id: "c1",
    title: "Introduction to UI Design Systems",
    meta: "Main Lecture Hall A2 • 28 Registered Students",
    time: "Starts in 14m",
    label: "NEXT CLASS",
  },
  upcomingClasses: [
    {
      id: "c1",
      title: "Introduction to UI Design Systems",
      meta: "Main Lecture Hall A2 • 28 Registered Students",
      time: "Starts in 14m",
      label: "NEXT CLASS",
    },
  ],
  materials: [
    { id: "m1", icon: "description", title: "Modernist Architecture: Level 4", meta: "Uploaded 2 hours ago • PDF • 12.4 MB" },
    { id: "m2", icon: "play_circle", title: "React Fundamentals Workshop", meta: "Uploaded Yesterday • Video • 1.2 GB" },
    { id: "m3", icon: "folder_zip", title: "Data Science Asset Kit", meta: "Uploaded 3 days ago • ZIP • 450 MB" },
  ],
};

export async function fetchTeacherDashboard(): Promise<TeacherDashboardData> {
  const live = await tryGet<ApiTeacherDashboard>("/dashboard/teacher");
  if (!live) return mockTeacherDashboardData;

  const upcoming = (live.upcomingClasses ?? []).map((c, i) => teacherClassRow(c, i === 0));
  const nextClass = live.nextClass ? teacherClassRow(live.nextClass, true) : upcoming[0] ?? null;

  return {
    name: live.name ?? mockTeacherDashboardData.name,
    stats: {
      classesToday: live.stats?.classesToday ?? mockTeacherDashboardData.stats.classesToday,
      ungradedAssignments: live.stats?.ungradedAssignments ?? mockTeacherDashboardData.stats.ungradedAssignments,
      students: live.stats?.students ?? mockTeacherDashboardData.stats.students,
      attendanceRate: live.stats?.attendanceRate ?? mockTeacherDashboardData.stats.attendanceRate,
    },
    weeklyPerformance: live.weeklyPerformance?.length
      ? live.weeklyPerformance
      : mockTeacherDashboardData.weeklyPerformance,
    attendanceToday: {
      present: live.attendanceToday?.present ?? mockTeacherDashboardData.attendanceToday.present,
      total: live.attendanceToday?.total ?? mockTeacherDashboardData.attendanceToday.total,
      rate: live.attendanceToday?.rate ?? mockTeacherDashboardData.attendanceToday.rate,
    },
    nextClass,
    upcomingClasses: upcoming.length ? upcoming : mockTeacherDashboardData.upcomingClasses,
    materials: live.materials?.length
      ? live.materials.map((m) => ({
          id: m.id,
          icon: materialIcon(m.fileType),
          title: m.title,
          meta: `Uploaded ${timeAgo(m.createdAt)} • ${m.fileType}${sizeLabel(m.size)}`,
        }))
      : mockTeacherDashboardData.materials,
  };
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface AttendanceByBatchRow {
  batch: string;
  rate: number;
}

export interface ExamResultRow {
  id: string;
  student: string;
  course: string;
  score: number;
  max: number;
  percentage: number;
}

export interface ReportsData {
  attendanceByBatch: AttendanceByBatchRow[];
  examResults: ExamResultRow[];
}

export const mockReportsData: ReportsData = {
  attendanceByBatch: mockAttendanceData.byBatch,
  examResults: mockExamResults,
};

export async function fetchReports(): Promise<ReportsData> {
  const live = await tryGet<{ attendanceByBatch?: AttendanceByBatchRow[]; examResults?: ExamResultRow[] }>(
    "/reports/overview"
  );
  if (!live) return mockReportsData;
  return {
    attendanceByBatch: live.attendanceByBatch?.length
      ? live.attendanceByBatch
      : mockReportsData.attendanceByBatch,
    examResults: live.examResults?.length ? live.examResults : mockReportsData.examResults,
  };
}

// ---------------------------------------------------------------------------
// Exam detail + attempt
// ---------------------------------------------------------------------------

export interface ExamQuestionRow {
  id: string;
  text: string;
  options: string[];
  type?: string;
  marks?: number;
}

export interface ExamDetailData {
  id: string;
  title: string;
  course: string;
  batch: string;
  type: string;
  totalMarks: number;
  durationMin: number;
  questions: ExamQuestionRow[];
}

export const mockExamDetailData: ExamDetailData = {
  id: "exm_001",
  title: "Advanced Algorithms Midterm",
  course: "Advanced Distributed Systems",
  batch: "DS-M1",
  type: "MCQ",
  totalMarks: 100,
  durationMin: 90,
  questions: mockExamQuestions,
};

export async function fetchExamDetail(id?: string): Promise<ExamDetailData> {
  if (!id) return mockExamDetailData;
  const live = await tryGet<{ exam: ApiExamDetail }>(`/exams/${id}`);
  if (!live) return mockExamDetailData;
  const e = live.exam;
  return {
    id: e.id,
    title: e.title ?? mockExamDetailData.title,
    course: e.course?.title ?? "—",
    batch: e.batch?.name ?? "—",
    type: e.type ?? "MCQ",
    totalMarks: e.totalMarks ?? mockExamDetailData.totalMarks,
    durationMin: e.durationMin ?? mockExamDetailData.durationMin,
    questions:
      e.questions && e.questions.length
        ? e.questions.map((q) => ({
            id: q.id,
            text: q.text,
            options: q.options ?? [],
            type: q.type ?? "mcq",
            marks: q.marks,
          }))
        : mockExamDetailData.questions,
  };
}

interface ApiExamDetail {
  id: string;
  title?: string;
  type?: string;
  totalMarks?: number;
  durationMin?: number;
  course?: { id: string; title: string } | null;
  batch?: { id: string; name: string } | null;
  questions?: {
    id: string;
    text: string;
    options?: string[] | null;
    type?: string;
    marks?: number;
  }[];
}

export interface ExamAttemptPayload {
  questionId: string;
  selectedOption?: number | null;
  text?: string | null;
}

export async function startExamAttempt(examId: string): Promise<string | null> {
  try {
    const res = await api.post<{ attempt: { id: string } }>(`/exams/${examId}/attempt`, {});
    return res.attempt.id;
  } catch {
    return null;
  }
}

export async function submitExamAttempt(
  examId: string,
  attemptId: string,
  answers: ExamAttemptPayload[]
): Promise<{ score?: number; status?: string } | null> {
  try {
    const res = await api.post<{ attempt: { score?: number; status?: string } }>(
      `/exams/${examId}/attempt/${attemptId}/submit`,
      { answers }
    );
    return res.attempt;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Assignment detail + submission
// ---------------------------------------------------------------------------

export interface AssignmentDetailData {
  id: string;
  title: string;
  course: string;
  batch: string;
  maxMarks: number;
  dueAt: string | null;
  description: string | null;
  submissions: number;
}

export const mockAssignmentDetailData: AssignmentDetailData = {
  id: "asg_001",
  title: "Distributed Key-Value Store Implementation",
  course: "Advanced Distributed Systems",
  batch: "DS-M1",
  maxMarks: 20,
  dueAt: null,
  description: null,
  submissions: 12,
};

interface ApiAssignmentDetail {
  id: string;
  title: string;
  description?: string | null;
  maxMarks?: number | null;
  dueAt?: string | null;
  course?: { id: string; title: string } | null;
  batch?: { id: string; name: string } | null;
  submissions?: unknown[];
}

export async function fetchAssignmentDetail(id?: string): Promise<AssignmentDetailData> {
  if (!id) return mockAssignmentDetailData;
  const live = await tryGet<{ assignment: ApiAssignmentDetail }>(`/assignments/${id}`);
  if (!live) return mockAssignmentDetailData;
  const a = live.assignment;
  return {
    id: a.id,
    title: a.title ?? mockAssignmentDetailData.title,
    course: a.course?.title ?? "—",
    batch: a.batch?.name ?? "—",
    maxMarks: a.maxMarks ?? mockAssignmentDetailData.maxMarks,
    dueAt: a.dueAt ?? null,
    description: a.description ?? null,
    submissions: a.submissions?.length ?? mockAssignmentDetailData.submissions,
  };
}

export interface AssignmentSubmissionPayload {
  title?: string;
  notes?: string;
  attachments?: string[];
}

export async function submitAssignment(
  id: string,
  payload: AssignmentSubmissionPayload
): Promise<boolean> {
  try {
    await api.post(`/assignments/${id}/submit`, payload);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Message thread
// ---------------------------------------------------------------------------

export interface ThreadMessage {
  id: string;
  from: string;
  mine: boolean;
  text: string;
  time: string;
}

export const mockThreadData: ThreadMessage[] = mockChatThread;

export async function fetchThreadMessages(conversationId?: string): Promise<ThreadMessage[]> {
  if (!conversationId) return mockThreadData;
  const live = await tryGet<{ messages: ApiMessage[] }>(`/messages/conversations/${conversationId}/messages`);
  if (!live) return mockThreadData;
  if (!live.messages.length) return mockThreadData;
  return live.messages.map((m) => ({
    id: m.id,
    from: m.sender?.name ?? "Unknown",
    mine: false,
    text: m.content ?? "",
    time: formatTime(m.sentAt),
  }));
}

interface ApiMessage {
  id: string;
  content?: string | null;
  sentAt?: string;
  sender?: { id: string; name?: string } | null;
}

export async function sendThreadMessage(conversationId: string, content: string): Promise<ThreadMessage | null> {
  try {
    const res = await api.post<{ message: ApiMessage }>(`/messages/conversations/${conversationId}/messages`, {
      content,
    });
    const m = res.message;
    return {
      id: m.id,
      from: "Me",
      mine: true,
      text: m.content ?? "",
      time: formatTime(m.sentAt),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Institute profile (settings)
// ---------------------------------------------------------------------------

export interface InstituteProfile {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  about?: string | null;
  gradingSystem?: string | null;
  passingMarks?: number | null;
  attendanceThreshold?: number | null;
  academicYear?: string | null;
}

export const mockInstituteProfile: InstituteProfile = {
  id: "ins_001",
  name: "Sunrise Academy",
  slug: "sunrise",
  contactEmail: "contact@sunriseacademy.edu",
  phone: "+91 98765 43210",
  address: "221B, Tech Park, Bangalore",
  about: "Leading institute for engineering and computer science education.",
  gradingSystem: "percentage",
  passingMarks: 40,
  attendanceThreshold: 75,
  academicYear: "2025-26",
};

export async function fetchInstituteProfile(): Promise<InstituteProfile> {
  const live = await tryGet<{ institute?: Partial<InstituteProfile> }>("/institutes");
  if (!live?.institute) return mockInstituteProfile;
  return { ...mockInstituteProfile, ...live.institute } as InstituteProfile;
}

export async function updateInstituteProfile(
  id: string,
  patch: Partial<InstituteProfile>
): Promise<boolean> {
  try {
    await api.patch(`/institutes/${id}`, patch);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Courses Library (student "Continue watching" + lecture catalog)
// ---------------------------------------------------------------------------

export interface ContinueWatchingRow {
  id: string;
  title: string;
  progress: number;
  lessons: string;
  next: string;
}

export const mockContinueWatchingData: ContinueWatchingRow[] = mockStudentDashboardData.courses.map(
  (c, i) => ({ id: `cw_${i + 1}`, ...c })
);

export async function fetchContinueWatching(): Promise<ContinueWatchingRow[]> {
  const live = await tryGet<ApiStudentDashboard>("/dashboard/student");
  const enrolled = live?.enrollments ?? [];
  if (!enrolled.length) return mockContinueWatchingData;
  const base = mockContinueWatchingData;
  return enrolled.slice(0, 4).map((e, i) => {
    const fallback = base[i % base.length];
    const title = e.course?.title ?? "Untitled Course";
    return {
      id: e.course?.id ?? title,
      title,
      progress: fallback?.progress ?? 0,
      lessons: fallback?.lessons ?? "0 lessons",
      next: fallback?.next ?? "Start course",
    };
  });
}

// ---------------------------------------------------------------------------
// Live class session detail
// ---------------------------------------------------------------------------

export interface LiveClassDetailData {
  id: string;
  title: string;
  course: string;
  batch: string;
  teacher: string;
  status: "Live" | "Scheduled" | "Ended";
  startsIn: string;
  location: string;
  registered: number;
  startsAt: string;
  durationMin: number;
  recordingUrl?: string;
  description?: string;
}

interface ApiLiveClassDetail {
  id: string;
  title: string;
  description?: string | null;
  course?: { id: string; title: string } | null;
  batch?: { id: string; name: string; code: string; students?: unknown[] } | null;
  teacher?: { id: string; name: string } | null;
  startsAt: string;
  durationMin: number;
  status: string;
  recordingUrl?: string | null;
  roomId?: string | null;
  hmsRoomCode?: string | null;
}

export const mockLiveClassDetailData: LiveClassDetailData = {
  id: "live_001",
  title: "Introduction to UI Design Systems",
  course: "Mastering the Modern Toolchain",
  batch: "WEB-W1",
  teacher: "Dr. Kavya Reddy",
  status: "Live",
  startsIn: "14m",
  location: "Main Lecture Hall A2",
  registered: 28,
  startsAt: "2024-06-15T14:00:00Z",
  durationMin: 60,
};

function liveStatusFor(startsAt: string | Date, durationMin: number, status: string): "Live" | "Scheduled" | "Ended" {
  if (status === "LIVE") return "Live";
  const end = new Date(startsAt).getTime() + durationMin * 60000;
  if (status === "ENDED" || (Date.now() > end && status !== "CANCELLED")) return "Ended";
  return "Scheduled";
}

export async function fetchLiveClassDetail(id?: string): Promise<LiveClassDetailData> {
  if (!id) return mockLiveClassDetailData;
  const live = await tryGet<{ liveClass: ApiLiveClassDetail }>(`/live-classes/${id}`);
  if (!live) return mockLiveClassDetailData;
  const c = live.liveClass;
  const status = liveStatusFor(c.startsAt, c.durationMin, c.status);
  const diff = new Date(c.startsAt).getTime() - Date.now();
  const startsIn =
    diff < 0
      ? "Completed"
      : diff < 3600000
        ? `${Math.max(1, Math.round(diff / 60000))}m`
        : `${Math.floor(diff / 3600000)}h ${Math.round((diff % 3600000) / 60000)}m`;
  return {
    id: c.id,
    title: c.title,
    course: c.course?.title ?? "—",
    batch: c.batch?.code ?? c.batch?.name ?? "—",
    teacher: c.teacher?.name ?? "—",
    status,
    startsIn,
    location: c.batch?.name ?? "Online",
    registered: Array.isArray(c.batch?.students) ? c.batch!.students!.length : 0,
    startsAt: c.startsAt,
    durationMin: c.durationMin,
    recordingUrl: c.recordingUrl ?? undefined,
    description: c.description ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Batch detail (student progress registry & schedule)
// ---------------------------------------------------------------------------

export interface BatchStudentRow {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  attendanceRate: number;
  status: string;
}

export interface BatchClassRow {
  id: string;
  title: string;
  startsAt: string;
  status: string;
}

export interface BatchDetailData {
  id: string;
  name: string;
  code: string;
  course: string;
  teacher: string;
  status: string;
  schedule: string;
  startDate: string;
  endDate: string;
  capacity: number;
  attendanceRate: number;
  exams: number;
  assignments: number;
  students: BatchStudentRow[];
  liveClasses: BatchClassRow[];
}

interface ApiBatchDetail {
  id: string;
  name: string;
  code: string;
  course?: { id: string; title: string } | null;
  capacity?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  timetable?: Record<string, unknown> | null;
  students?: {
    id: string;
    rollNumber?: string | null;
    user: { id: string; name: string; email: string };
  }[];
  attendance?: { studentId: string; status: string }[];
  assignments?: unknown[];
  exams?: unknown[];
  liveClasses?: { id: string; title: string; startsAt: string; status: string }[];
}

export const mockBatchDetailData: BatchDetailData = {
  id: "bat_001",
  name: "Advanced AI - Night Shift",
  code: "AI-N1",
  course: "Foundations of Neural Networks",
  teacher: "Prof. Arjun Nair",
  status: "Active",
  schedule: "Mon, Wed, Fri • 7:00 PM - 9:00 PM",
  startDate: "2024-04-01",
  endDate: "2024-09-30",
  capacity: 40,
  attendanceRate: 92,
  exams: 4,
  assignments: 6,
  students: [
    { id: "stu_001", name: "Ayesha Khan", rollNumber: "AX-2023-001", email: "ayesha@sunriseacademy.edu", attendanceRate: 95, status: "Active" },
    { id: "stu_002", name: "Mohammed Imran", rollNumber: "AX-2023-002", email: "mohammed@sunriseacademy.edu", attendanceRate: 88, status: "Active" },
    { id: "stu_003", name: "Aisha Siddiqui", rollNumber: "AX-2023-003", email: "aisha@sunriseacademy.edu", attendanceRate: 91, status: "Active" },
    { id: "stu_004", name: "Rohan Sharma", rollNumber: "AX-2023-004", email: "rohan@sunriseacademy.edu", attendanceRate: 79, status: "Active" },
    { id: "stu_005", name: "Priya Patel", rollNumber: "AX-2023-005", email: "priya@sunriseacademy.edu", attendanceRate: 97, status: "Active" },
  ],
  liveClasses: [
    { id: "live_003", title: "Backpropagation Deep Dive", startsAt: "2024-06-16T19:00:00Z", status: "Scheduled" },
    { id: "live_002", title: "Recurrence Relations & Master Theorem", startsAt: "2024-06-15T16:30:00Z", status: "Scheduled" },
  ],
};

export const mockBatchDetailDataFallback: BatchDetailData = mockBatchDetailData;

export async function fetchBatchDetail(id?: string): Promise<BatchDetailData> {
  if (!id) return mockBatchDetailData;
  const live = await tryGet<{ batch: ApiBatchDetail }>(`/batches/${id}`);
  if (!live) return mockBatchDetailData;
  const b = live.batch;

  const attendanceCounts = new Map<string, { present: number; total: number }>();
  for (const a of b.attendance ?? []) {
    const cur = attendanceCounts.get(a.studentId) ?? { present: 0, total: 0 };
    cur.total += 1;
    if (a.status === "PRESENT" || a.status === "LATE") cur.present += 1;
    attendanceCounts.set(a.studentId, cur);
  }
  let totalAttendance = 0;
  let presentAttendance = 0;
  for (const v of attendanceCounts.values()) {
    totalAttendance += v.total;
    presentAttendance += v.present;
  }

  const students: BatchStudentRow[] = (b.students ?? []).map((s) => {
    const counts = attendanceCounts.get(s.id);
    const rate = counts && counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0;
    return {
      id: s.id,
      name: s.user.name,
      rollNumber: s.rollNumber ?? "—",
      email: s.user.email,
      attendanceRate: rate,
      status: "Active",
    };
  });

  const status =
    b.status === "UPCOMING" ? "Upcoming" : b.status === "COMPLETED" ? "Completed" : "Active";

  return {
    id: b.id,
    name: b.name,
    code: b.code,
    course: b.course?.title ?? "—",
    teacher: "—",
    status,
    schedule: "—",
    startDate: b.startDate ? formatDate(b.startDate) : "—",
    endDate: b.endDate ? formatDate(b.endDate) : "—",
    capacity: b.capacity ?? 0,
    attendanceRate: totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0,
    exams: b.exams?.length ?? 0,
    assignments: b.assignments?.length ?? 0,
    students: students.length ? students : mockBatchDetailData.students,
    liveClasses: (b.liveClasses ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      startsAt: l.startsAt,
      status: l.status === "LIVE" ? "Live" : l.status === "ENDED" ? "Ended" : "Scheduled",
    })),
  };
}

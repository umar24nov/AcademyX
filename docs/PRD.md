# AcademyX — Product Requirements Document (PRD)

> Status: **Living spec** — describes the product as built today, plus a clearly separated Roadmap.
> Last updated: 2026-08-04

## 1. Overview

AcademyX is a **multi-tenant EdTech SaaS platform** ("the operating system for coaching institutes") that lets coaching centers run their entire academy — students, teachers, courses, batches, live classes, exams, assignments, messaging, and payments — from a single web application.

Each coaching institute is an isolated **tenant** with its own admin, teachers, students, courses, and batches. A platform-level super admin manages all institutes.

## 2. Problem Statement

Coaching institutes typically juggle spreadsheets, WhatsApp groups, and disconnected tools for:

- Admissions and student records
- Scheduling classes, courses, and batches
- Delivering exams and assignments (and grading them)
- Running live/online classes
- Communication with parents and students
- Billing and fee tracking

This causes lost data, no single source of truth, and poor student experience. AcademyX consolidates all of it.

## 3. Targeted Users & Personas

| Persona | Description | Key needs |
| --- | --- | --- |
| **Super Admin** | Platform operator managing all tenants | Approve/manage institutes, view cross-tenant analytics, control platform settings |
| **Institute Admin** | Owner/principal of a coaching center | Create teachers/students/courses/batches, run exams & assignments, manage live classes, view reports, approve payments, onboard the institute quickly |
| **Teacher** | Faculty at an institute | Teach live classes, create/publish exams, grade submissions, view batch attendance, message students |
| **Student** | Enrolled learner | Attend live classes, take exams, submit assignments, view grades, study recorded lectures & materials, chat with peers/teachers |

Demo accounts (password `password123`):

- `super@academyx.app` — Super Admin
- `admin@sunriseacademy.in` — Institute Admin (Sunrise Academy)
- `teacher@sunriseacademy.in` — Teacher (Dr. Ayesha Ansari)
- `student@sunriseacademy.in` — Student (Ayesha Khan)

Accounts created through the onboarding wizard use the default password `AcademyX@12345`.

## 4. Core Features (Implemented)

### 4.1 Authentication & Authorization
- Email + password auth with **JWT access token (15 min)** and **rotating refresh token (7 days)** stored server-side.
- Registration creates a new institute (tenant) + its admin in one flow.
- Forgot / reset password.
- **Role-based access**: `SUPER_ADMIN`, `INSTITUTE_ADMIN`, `TEACHER`, `STUDENT`.
- Institute-scoped access control (`requireInstitute`) so tenants never see each other's data.
- Role-specific login portals (`/login/student`, `/login/teacher`, `/login/admin`, `/login/super-admin`).

### 4.2 Multi-Tenant Institute Management
- Institute CRUD, status management (super admin), per-institute analytics.
- Onboarding analytics (students/teachers/courses/batches counts, profile completeness).

### 4.3 Onboarding Wizard
- 5-step setup for institute admins: profile → teacher → course → batch → student.
- Auto-jumps to the first incomplete step; progress tracking; dashboard banner until complete.
- Default sign-in password callout for created accounts.

### 4.4 Courses, Modules, Lessons & Curriculum
- Courses (with modules → lessons) authored by admins/teachers.
- Admin course-authoring works even without a teacher profile (auto-creates one).
- Student course library and per-course detail.

### 4.5 Batches & Enrollment
- Batches linked to courses, with students, roll numbers, and schedule.
- Per-batch attendance tracking and student progress registry.

### 4.6 Exams
- Exam CRUD with MCQ questions, publish/unpublish.
- Students attempt exams; answers are **auto-graded**; attempts tracked (`in_progress | submitted | graded`).
- Verified live flow: create → publish → attempt → submit → auto-grade → score.

### 4.7 Assignments
- Assignment CRUD with due dates.
- Student submissions (with notes, late marking) and **teacher grading UI** (marks + feedback).
- Students see their submission status / grade; grade visibility verified live (`GRADED`, marks).

### 4.8 Live Classes (Real-Time)
- Live class scheduling with course/batch/teacher, duration, status (`SCHEDULED | LIVE | ENDED | CANCELLED`).
- **Real-time room** via Socket.IO: presence (join/leave), live chat, participant roster.
- **Mesh WebRTC video/audio** with STUN (Google), offers/answers/ICE signaling over the socket, camera/mic toggles.
- Host "Launch Session" transition; session page shows Live/Scheduled/Ended states and recording link placeholder.

### 4.9 Lectures & Study Material
- Recorded lectures and study material library (teacher/admin upload).

### 4.10 Chat & Community
- Direct messages (conversations, mark-as-read), contacts list.
- Per-batch community groups and live polling.

### 4.11 Notifications
- In-app notifications with mark-as-read / mark-all-read.

### 4.12 Dashboards & Reports
- Role-aware dashboards (super admin, institute admin, teacher, student) wired to live analytics.
- Reports overview; INR currency across financial views.

### 4.13 Payments (Backend Records)
- Payment creation/confirmation and invoices endpoints exist (admin/student); **Razorpay live checkout is planned** (see Roadmap).

### 4.14 Marketing / Landing
- Role-aware brand logo, landing page with Features/Testimonials/Pricing/FAQ/footer.
- **Mobile-first**: hamburger Sheet menu on small screens.

### 4.15 Settings & Support
- Profile, billing, and support pages; real sign-out; brand/settings management.

## 5. Non-Functional Requirements

- **Security**: JWT auth, refresh rotation, bcrypt password hashing, helmet, CORS whitelist, rate limiting on auth routes, zod input validation, institute-scoped queries, secret scanning in CI.
- **Performance**: Next.js static + client rendering; paginated/lazy data via `useLive` hooks; npm-cached CI.
- **Reliability**: GitHub Actions CI (typecheck/build/smoke test) gating deploys; Render + Vercel auto-deploy.
- **Mobile responsive**: landing and core dashboards adapt to small screens.
- **Availability of live data**: every screen uses live API with a graceful mock/empty fallback (`tryGet` returns null on API failure).

## 6. Scope Boundaries

- **In scope**: The full feature set in Section 4, deployed to Render (API), Vercel (web), Neon (Postgres).
- **Out of scope for now**: Native mobile apps, payment gateway live keys, third-party video infra (HMS), certificates/announcements beyond data-model groundwork, multi-language UI.

## 7. Roadmap (Planned)

| Priority | Item | Notes |
| --- | --- | --- |
| Medium | **Razorpay live checkout** | Payment routes exist (create/confirm/invoices); wire Razorpay order creation + signature verification; `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env keys are optional and ready. |
| Low | **100ms (HMS) integration** | Env keys exist (`HMS_*`); replace STUN-only mesh with hosted rooms for scale. |
| Low | **Certificates** | `Certificate` model exists in schema. |
| Low | **Announcements** | `Announcement` model exists in schema. |
| Low | **Cloudinary media uploads** | Env keys exist (`CLOUDINARY_*`); for study materials/avatars. |
| Low | **Email (Resend)** | `RESEND_API_KEY` env key exists; used for emails/notifications. |

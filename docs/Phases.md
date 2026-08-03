# AcademyX — Phases

> Progress log of how the project was built, phase by phase. **Keep updating as new phases land.**
> Latest phase: 9 (CI/CD). Next planned: 10 (Payments).

Legend: `DONE` = verified/committed/pushed. `IN PROGRESS` = actively being worked. `PLANNED` = not started.

## Phase 1 — Foundation & Multi-Tenant Scaffold — `DONE`
- Initial AcademyX multi-tenant EdTech platform scaffold (`f488839`).
- Super-admin through institute-scoped routes; init migration (`8808446`).
- Deliverables: Express + Prisma + PostgreSQL backend, JWT auth (access + rotating refresh), RBAC (`SUPER_ADMIN/INSTITUTE_ADMIN/TEACHER/STUDENT`), institute scoping, `{success,data}` API envelope, deployed to Render / Vercel / Neon.

## Phase 2 — Core API Wiring — `DONE`
- Wired remaining pages to live API: teacher dashboard, reports, exam MCQ, assignment submission, messages, settings (`4f7624f`).
- Added settings/profile, settings/billing, support pages; real sign-out; logo → dashboard (`1e16720`).
- Added student courses library, live class session room, batch detail pages (`99a72c7`).

## Phase 3 — Branding, Auth UX & Data — `DONE`
- Role-aware brand logo; redesigned landing page with full footer; indianize dummy data; UI design assets (`dfd06f5`).
- Role-based login portals + notifications mark-all-as-read (`f757f21`); auth close button fix (`c56da8c`).
- Role-aware dashboard redirect; INR currency across dashboards; indianize remaining data (`e02ea8e`).
- Expanded Indian dummy data — 6 coaching centers and 50+ Indian students/teachers (`040b9b0`).

## Phase 4 — Real Chat & Community — `DONE`
- Real chat: DM fix, mark-as-read, contacts, per-batch community groups, live polling (`2f31ed4`).

## Phase 5 — Real Exams & Assignments — `DONE`
- Verified live round-trip: attempt create → submit → auto-grade → score; teacher grading UI; student grade visibility (`629d0d0`).
- Backend `GET /assignments` returns student-specific `mySubmissions`; new `/assignments/submissions` grading page.

## Phase 6 — Mobile Landing — `DONE`
- Hamburger Sheet menu (top-right) with anchor links + Sign in / Get Started; responsive paddings (`a70b02c`).

## Phase 7 — Onboarding Wizard — `DONE`
- 5-step setup (profile → teacher → course → batch → student), progress + step nav, completion card, dashboard banner; admin course-authoring fix (auto-create TeacherProfile) (`5f2f915`).

## Phase 8 — Live Classes (Real-Time) — `DONE`
- Socket.IO presence/chat/signaling + WebRTC mesh video; real session page (`c1f8be1`).
- Backend: `live-socket.ts` (rooms, participants, chat, signals); frontend: `useLiveSession`, `useLiveWebRTC`, rewired session page; `setLiveClassStatus` launcher.

## Phase 9 — CI/CD & Quality — `DONE`
- GitHub Actions CI (lint/typecheck/build) + CI-gated deploy hooks for Render/Vercel; Node 20 pin (`68fe10b`).
- Backend boot smoke test, gitleaks secret scan, Dependabot (`fb2cea3`).

## Phase 10 — Payments (Planned)
- Razorpay live checkout: wire `payments.routes.ts` (create/confirm/invoices) to Razorpay order creation + signature verification; `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env keys are optional and ready.

## Phase 11+ — Low-Priority Planned
- 100ms (HMS) hosted rooms (`HMS_*` env ready), Certificates & Announcements (models exist), Cloudinary uploads (`CLOUDINARY_*` env ready), Resend email (`RESEND_API_KEY` env ready).

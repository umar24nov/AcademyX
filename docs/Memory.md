# AcademyX — Memory

> Working state: what's completed, what's in progress, and where to resume.
> **Keep updating after every step.** Last updated: 2026-08-04

## 1. Project Snapshot

Multi-tenant EdTech SaaS ("the operating system for coaching institutes"). Next.js frontend + Express/Prisma backend + Neon Postgres, deployed to Vercel / Render. All nine phases implemented (see `Phases.md`). Complete step-by-step goal: AcademyX end-to-end, one committed+pushed step at a time.

## 2. Environment & Access

- Backend API: `https://academyx-api.onrender.com` (prefix `/api/v1`, health `/health`, socket `/socket.io`).
- Frontend: `https://academy-x-ivory.vercel.app`.
- DB: Neon Postgres. Git remote: `https://github.com/umar24nov/AcademyX.git` (`main`).
- Demo logins (`password123`): `super@academyx.app` · `admin@sunriseacademy.in` (INSTITUTE_ADMIN) · `teacher@sunriseacademy.in` (Dr. Ayesha Ansari) · `student@sunriseacademy.in` (Ayesha Khan).
- Onboarding-created accounts: default password `AcademyX@12345`.
- Sunrise seed IDs: `seed_course_001`, `seed_batch_sunrise_01`/`_02`, `seed_exam_001`, `seed_assign_001`.

## 3. Critical Conventions (quick recall)

- Frontend: `useLive(fetcher, mockFallback)`; `tryGet<T>` at `live-data.ts:79` returns `null` on API failure; `api.get/post/patch` unwraps `{success,data}` + auto token refresh; `getStoredUser()` reads `ax_session`.
- UI kit: sheet, select, dialog, toast, table, progress, badge (variants `default|secondary|success|warning|destructive|outline`); icons via `Icon name="..."`.
- Backend: `ApiError` factories (`badRequest/unauthorized/forbidden/notFound/conflict/tooManyRequests`), `requireInstitute`, `requireRole`, zod `validate`; `verifyAccessToken` → `{sub, role, instituteId}`; env schema in `src/config/env.ts` (`CORS_ORIGIN`, `JWT_*`, `HMS_*`/`RAZORPAY_*` optional).
- Prisma quirks: `ExamAttempt.status` is **String** (`in_progress|submitted|graded`); `AssignmentSubmission.status` enum `SUBMITTED|LATE|GRADED`; `Course.createdById` → TeacherProfile (RESTRICT) — admins auto-get a profile on `POST /courses`.
- Deploy note: Render rebuild lags after push; deployed code can be old for ~1-2 min — don't treat immediate failures as regressions.
- Files to never stage: `~$AcademyX_UI_Walkthrough.pptx`; never modify `AcademyX_UI_Screens/`.

## 4. Completed Work (chronological)

| # | What | Commit |
| --- | --- | --- |
| 1 | Foundation: multi-tenant scaffold, JWT auth (access+rotating refresh), RBAC, institute scoping, seed, deploy (Render/Vercel/Neon) | `f488839`, `8808446` |
| 2 | Wire pages to live API; settings/profile/billing/support; real sign-out; student library, live-class session (mocked), batch detail | `4f7624f`, `1e16720`, `99a72c7` |
| 3 | Role-aware logo, landing + footer, role login portals, notifications, INR/indianized data (6 centers, 50+ students) | `dfd06f5`, `f757f21`, `c56da8c`, `e02ea8e`, `040b9b0` |
| 4 | Real chat & community: DMs, mark-as-read, contacts, per-batch groups, polling | `2f31ed4` |
| 5 | Real exams & assignments: auto-grade round-trip, teacher grading UI, student grades (`mySubmissions`, `/assignments/submissions`) | `629d0d0` |
| 6 | Mobile landing hamburger Sheet | `a70b02c` |
| 7 | Onboarding wizard (5 steps, progress, banner, admin course-authoring fix) | `5f2f915` |
| 8 | Live classes real-time: socket.io presence/chat/signaling + WebRTC mesh, real session page (`useLiveSession`, `useLiveWebRTC`, `setLiveClassStatus`) | `c1f8be1` |
| 9 | CI/CD: GitHub Actions CI + gated deploy hooks, Node 20 pin, smoke test, gitleaks, Dependabot | `68fe10b`, `fb2cea3` |
| 10 | Docs: PRD, Architecture, Rules, Phases, Design, Memory | — |

## 5. Currently Being Worked On

- **Docs with diagrams** (this step): added Mermaid diagrams to `docs/` — system architecture, request lifecycle, ER data model, Socket.IO/WebRTC sequence, CI/CD pipeline (Architecture.md); feature mindmap + exam/live-class flows (PRD.md); error handling + commit checklist flows (Rules.md); phase timeline (Phases.md); color/token map + typography scale (Design.md). Next: commit + push, then confirm whether to start Phase 10 (Razorpay).

## 6. Watch Items / Gotchas

- WebRTC is STUN-only — may not traverse all NATs (acceptable demo scope); browser mic/camera permission required.
- CI runs on every push; the pushed docs commit will trigger a CI run — harmless.
- `RAZORPAY_*`, `HMS_*`, `CLOUDINARY_*`, `RESEND_API_KEY` env keys are optional and currently unused.

## 7. Next Steps

1. Commit + push this docs set (single commit, e.g. `docs: add PRD/Architecture/Rules/Phases/Design/Memory`).
2. Await direction: Phase 10 Razorpay payments, or another enhancement.

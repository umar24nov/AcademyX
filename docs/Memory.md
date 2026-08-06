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
- Role gating pattern (student vs staff): read role once via `const user = React.useMemo(() => getStoredUser(), [])`, then `isStudent = user?.role === "STUDENT"`; students must never see create/schedule/upload/edit actions (backend already enforces: live-class POST/PATCH/status/DELETE + lecture upload + exam create require TEACHER/INSTITUTE_ADMIN).
- Files to never stage: `~$*.pptx` (gitignored); never modify `AcademyX_UI_Screens/`. Full reference pack lives in `AcademyX_Screens_Arranged/` (tracked).

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
| 11 | Docs diagrams (Mermaid) across Architecture/PRD/Rules/Phases/Design | `3dc9824` |
| 12 | Student dashboard aligned to reference UI (`Students Section Correct UI/code.html`): bento progress + achievements, live-class cards grid, assignments table; reference DESIGN.md/code.html committed | `209af9a` |
| 13 | Student-section role gating: sidebar `New Course` (students/teachers) + `Help` + `Logout` (was `Upgrade Plan`/`Support`/`Sign Out`); dashboard chip never says "Starts in Completed" (ended classes excluded, ENDED cards → Watch Recording/Details); live-classes/lectures/exams hide Schedule-Live-Class / Upload-Lecture / New-Exam + Edit for students | `7a10150` |
| 14 | Teacher/Admin/Super-Admin role gating: gate create/edit buttons to match backend `requireRole` — New Batch + Edit Batch → INSTITUTE_ADMIN only; Add Student → ADMIN+TEACHER; Invite Teacher → ADMIN only; New Course → ADMIN+TEACHER; Create Invoice → ADMIN only (Export/read-only stays for all). Super admin now sees management pages read-only. | `e17002e` |
| 15 | Functional buttons everywhere: teacher dashboard wired (View Schedule dialog, Create Material dialog → prepends to list, Launch Live Session → `/live-classes/session?id=`, Quick Actions → grade/messages/live-classes/CSV export, materials kebab, View All → `/lectures`); Reports Export CSV + Generate Report + row kebab → real CSV downloads (`lib/csv.ts` `downloadCsv`); every `⋮` kebab now a working dropdown (`components/dashboard/row-menu.tsx` `RowActionsMenu`) on batches/students/teachers/financials/institutes/live-classes/messages/curriculum/admin dashboard; admin dashboard Export/New Entry/View-All + super-admin Export/Invite Institute wired. Labels role-corrected: sidebar teacher CTA `New Course` → `Manage Courses` (/curriculum/courses), student CTA → `My Courses` (/courses); curriculum `New Course` button now INSTITUTE_ADMIN only (was ADMIN+TEACHER) | `450ba26` |
| 16 | Teacher dashboard refinement: View Schedule dialog enlarged (`max-w-2xl`, roomier class rows, count in description); Create/Edit Material dialog now has attachment upload (file picker + name/size + remove), Publishing toggle (Draft/Published), Targeted Batch select (was free-text Course, populated from `fetchBatches`); materials kebab → Edit Details (opens prefilled edit dialog)/Share with Class/Download Asset (real `.txt` Blob download)/Delete. Also added 8 missing icon-map names that made kebab items render the generic `Info` fallback (`history_edu`, `folder_zip`, `content_copy`, `notifications_off`, `pause`, `play_arrow`, `stop_circle`, `person` in `components/shared/icon.tsx`) — this was the "kebab not perfectly working" symptom | `f36ba60` |
| 17 | Mobile fixes: landing-page hamburger (right) restyled to a clearly visible bordered outline button (`variant="outline"`, `h-10 w-10`); dashboard TopNav hamburger given the same bordered, high-contrast style so it can't be missed on phones; Settings page tab strip now stacks vertically (up-down, full-width rows) on phones instead of an overflowing horizontal slider, horizontal pill restored on `md+`. Both hamburgers open the existing working `Sheet` | `b95e340` |
| 18 | **Root cause fix for "dashboard hamburger doesn't work on phone":** the mobile `Sheet`'s content was `<Sidebar/>`, but `Sidebar`'s `<aside>` has `hidden md:flex` — so inside the slide-out panel it was `display:none` and the menu opened BLANK on phones. Fixed with a `mobile` prop on `Sidebar` (`mobile ? "flex w-full" : "hidden md:flex"`), passed in `DashboardShell`'s sheet. Applies to all dashboards (student/teacher/admin/super-admin) | `5c4a1d0` |
| 19 | **Mobile drawer refinement (v1):** both phone hamburgers set to a 1/3-width drawer (landing right, dashboard left) with the built-in X close button; `Sidebar` mobile variant switched to `relative flex h-full w-full` (was `fixed` so `w-full` = viewport, bleeding past the drawer edge); `MobileBottomNav` deleted | `c90d9ab` |
| 20 | **Mobile drawer refinement (final):** user corrected the width — **2/3rd**, and landing page should NOT have changed. Landing drawer reverted to `w-72` (as before); dashboard drawer set to `w-2/3` (`SheetContent side="left" className="w-2/3 p-0"`). Since 2/3 ≈ desktop width, `Sidebar` mobile variant now renders full content (header, labels, upgrade box) — only the aside wrapper differs (`relative flex h-full w-full` vs `fixed hidden md:flex`). **Landing page cleanup:** removed Testimonials section + data and FAQ section + data + accordion state, and their navbar links (desktop + mobile sheet), leaving Features & Pricing; removed now-unused `React`/`cn`/`ChevronDown` imports. Bottom nav stays removed | `f3c5e02` |

## 5. Currently Being Worked On

- **None in progress.** Last completed: mobile fixes — visible hamburger buttons (landing + dashboard TopNav), settings tabs stack vertically on phones (`b95e340`).
- Gotcha to remember: `Icon` falls back to `Info` for unknown names — always add new names to `components/shared/icon.tsx` or kebab/quick-action items silently render a generic icon (looks broken).
- Note: curriculum `New Course` is now admin-only in UI but backend `POST /courses` still allows TEACHER — decided to keep UI more restrictive per product direction; backend can be tightened later if wanted.

## 6. Watch Items / Gotchas

- WebRTC is STUN-only — may not traverse all NATs (acceptable demo scope); browser mic/camera permission required.
- CI runs on every push; the pushed docs commit will trigger a CI run — harmless.
- `RAZORPAY_*`, `HMS_*`, `CLOUDINARY_*`, `RESEND_API_KEY` env keys are optional and currently unused.
- Backend permission matrix (UI gating mirrors it): batches POST/PATCH/DELETE → INSTITUTE_ADMIN; students POST/PATCH/attendance → ADMIN+TEACHER; teachers POST/PATCH/DELETE → ADMIN; courses POST/PATCH/modules → ADMIN+TEACHER (DELETE → ADMIN; UI now hides create for TEACHER); exams create/publish → ADMIN+TEACHER; lectures POST/DELETE → ADMIN+TEACHER; payments POST → ADMIN+STUDENT. SUPER_ADMIN is allowed through `requireInstitute` but can only GET (read-only) on institute pages.
- `New Institute` (institutes page) and `Invite Institute` (super-admin dashboard) have no backend POST route yet — currently toast only.

## 7. Next Steps

1. Commit + push this set (`b95e340` mobile fixes + docs).
2. Await direction: align next reference screen from `AcademyX_Screens_Arranged/` (teacher dashboard 11/12, or a student sub-screen like live classroom 07 / quiz 08), or Phase 10 Razorpay payments.

# AcademyX — Rules

> Contract for how this codebase is built and maintained — including boundaries for AI agents.
> Last updated: 2026-08-04

## 1. Language & Tooling

- **TypeScript everywhere** (strict). No JavaScript files in `src`.
- Backend: Node >= 20, Express 4, Prisma 6.
- Frontend: Next.js App Router, React 19, Tailwind CSS v4.
- Follow existing patterns; never introduce a new framework/library without checking whether the codebase already provides it.

## 2. What to Use

- **Zod** for all input validation (backend `validate(schema)` middleware).
- **Prisma** for all database access — no raw SQL unless unavoidable.
- **Existing UI kit** (`frontend/src/components/ui/*`) for buttons, cards, badges, dialogs, sheets, selects, tables, progress, toasts, avatars. Extend it, don't rebuild it.
- **Icons via `Icon name="..."`** (`frontend/src/components/shared/icon.tsx`). Add new lucide imports there if a name is missing.
- **`useLive(fetcher, mockFallback)`** + **`tryGet<T>`** for all live data; every screen keeps a graceful fallback when the API is unavailable.
- **`api.get/post/patch`** (`frontend/src/lib/api.ts`) for all HTTP from the frontend — it handles the token, unwraps `{success,data}`, and refreshes expired access tokens.
- Backend errors: **`ApiError` factories** (`badRequest/unauthorized/forbidden/notFound/conflict/tooManyRequests`).
- Auth helpers: `requireInstitute`, `requireRole`, `authenticate`; `verifyAccessToken` in `backend/src/utils/jwt.ts`.

## 3. What to Avoid

- **Never commit secrets, keys, or `.env` files.** Repo is scanned by gitleaks in CI.
- **No comments in code unless the task explicitly asks for them.**
- **No emojis in code or committed files** unless explicitly requested.
- No `any` where a type exists; no `as` casts to dodge the type system.
- No direct `fetch` from components — route through `lib/api.ts`.
- Do not bypass role guards or institute scoping on the backend.
- Do not add new npm dependencies casually; prefer what's already installed (Radix UI, lucide-react, recharts, socket.io / socket.io-client, zod).
- Do not run `npm audit fix` or bulk-dependency bumps as part of feature work; leave dependency updates to Dependabot PRs.
- Never touch `AcademyX_UI_Screens/` source PNGs or the `AcademyX_UI_Walkthrough.pptx` deliverables.
- Never stage/commit `~$AcademyX_UI_Walkthrough.pptx` (Office lock file).

## 4. Error Handling

- Backend returns `{ success: true, data }` or `{ success: false, error }` — always.
- Use `ApiError` factories; let the central `errorHandler` format responses. Don't hand-roll per-route error responses.
- Frontend: `tryGet<T>` returns `null` on API failure — components render empty/mock states, they do not throw.
- Surface user-facing failures with `useToast` (`toast({ title, description, variant })`).

## 5. Backend Conventions

- Route files: `backend/src/routes/*.routes.ts`; mount in `app.ts` under `/api/v1/...`.
- RBAC: apply `requireRole`/`requireInstitute` at the route level.
- All validation uses zod schemas; keep enums/statuses aligned with Prisma schema (watch the `ExamAttempt.status` String vs `AssignmentSubmission.status` enum difference).
- New env vars must be added to `backend/src/config/env.ts` (the schema) and documented in Architecture.md.

## 6. Frontend Conventions

- Pages are client components (`"use client"`).
- Use `getStoredUser()` for role-aware rendering (e.g., `dashboardPathFor(role)`).
- Keep mock fallback data inside `live-data.ts`; keep fetchers typed.
- Real-time live-class pages use `useLiveSession` + `useLiveWebRTC`; do not hand-roll sockets.
- Mobile: landing sections use `px-4 md:px-6`; navigation collapses to a Sheet on small screens.

## 7. Boundaries for AI Agents

- Work in committed, pushed increments — one logical step per commit, with a clear message.
- Before committing: run backend `npm run typecheck`, frontend `npm run typecheck` and `npm run lint`, and `npm run build` (frontend). Backend `npm run build` too.
- Verify behavior against the **deployed** API where possible (Render lags ~1-2 min after push before the new code is live — don't treat an immediate failure as a regression).
- Only commit when explicitly asked, or when following an agreed step workflow.
- Keep the demo scope: the seeded users, INR currency, and Indian coaching-center data are intentional.
- After each completed step, update `docs/Memory.md` and `docs/Phases.md`.

## 8. Verification Checklist (before commit)

1. `backend`: `npm run typecheck` + `npm run build`.
2. `frontend`: `npm run typecheck` + `npm run lint` (0 errors) + `npm run build`.
3. No new secrets, no `~$*.pptx`, no stray files staged.
4. CI (GitHub Actions) green on the pushed commit.

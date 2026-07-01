# Tasks v2 — Blackmont Academy Platform

Priority: P0 = do now, P1 = do next, P2 = do when touching the area, P3 = backlog

> Supersedes `tasks.md`. Carries forward everything still open from v1 and folds in
> the work done in the current (uncommitted) batch. Updated 2026-07-01.

---

## ✅ Done in the current uncommitted batch (review summary)

These are working-tree changes not yet committed — review before committing.

- [x] **Programmes CRUD API** — `api/programmes/route.ts` (GET list / POST create) and
  `api/programmes/[programmeId]/route.ts` (PUT / DELETE), all `Admin`-gated via `requireAuth`.
  New `programmeModel.ts`, `programmeSchema.ts` (Zod), and `programmeDoc.ts` types.
  Admin programmes page rewired to react-query with optimistic-concurrency (`updatedAt`)
  guards and draft-preservation on background refetch. (Closes P3 "Programmes CRUD API".)
- [x] **Rename Student → Consultant** — full terminology change across routes
  (`app/student/* → app/consultant/*`, `instructor/students → instructor/consultants`),
  components (`student-detail-dialog → consultant-detail-dialog`), `mock-data.ts`,
  and `badgeColor.ts`. 0 lingering `student` references remain in `src/`.
- [x] **Component reorg** — `account-settings`, `portal-shell`, `query-provider` moved
  into `components/layout/`.
- [x] **Resource preview dialog** — video/pdf/link preview with Vimeo embed normalization
  and a viewport-bounded iframe; condensed comments.
- [x] **New `ui/tooltip.tsx`** component.
- [x] **Seed script** — expanded `scripts/seed.ts` to seed programme data.
- [x] **Condensed verbose comments** in `users/[userId]` and `programmes/[programmeId]` routes.

---

## P0 — Security (do before deploying anything)

- [x] Add auth middleware (JWT cookie verify + role redirects).
- [x] Add auth + role checks to admin API routes.
- [x] Fix password sentinel / passwordless verification.
- [x] Add unique index on email.

---

## P1 — Architecture (high-impact cleanup)

- [x] Unify student + internal dashboards into shared learner components.
- [x] Make student + internal use PortalShell.
- [x] Fix root redirect by role / to `/login`.
- [x] Remove dead `credentialsVerified` field.

---

## P2 — Code Quality (clean up when touching these files)

- [ ] **Remove debug comments** — `// REVW` markers still present in
  `app/admin/layout.tsx`, `app/instructor/layout.tsx`, `app/instructor/page.tsx`,
  `app/consultant/page.tsx`, and `api/webhooks/wix/route.ts`. Strip them.
- [x] **Remove duplicate type definitions** — resolved by the earlier learner-component
  refactor; no local `Resource`/`Quiz`/`Module`/`Programme` interfaces remain in the pages.
- [x] **Replace client `idCounter`** — `admin/programmes/page.tsx` `nextId` now uses
  `crypto.randomUUID().slice(0, 8)`; the mutable module-level counter is gone.
- [x] **Fix localStorage progress key** — `learner-context.tsx` now keys progress off
  `useUser()` → `session.userId`, not the never-set `localStorage 'user'`.
- [x] **Fix InternalDivider visibility** — `instructor/page.tsx` divider label changed from
  `text-white` to `text-muted-foreground`.
- [x] **Cache useUser hook** — `hooks/use-current-user.tsx` now reads from `useSession()`
  context (synchronous, shared) instead of a per-component `useEffect` fetch.
- [ ] **Remove or implement Wix webhook** — `api/webhooks/wix/route.ts` is still a stub with
  an implementation guide. Build it out or delete it.

---

## P3 — Feature Backlog

- [x] **Programmes CRUD API** — done this batch (see top). Verify it persists end-to-end
  and that the admin UI no longer reads mock data.
- [x] Rate limiting on auth endpoints.
- [ ] **Consultant enrollment system** — connect consultant records to the DB so progress,
  quiz scores, and written answers persist across sessions. (Renamed from "Student enrollment".)
- [ ] **Certificate generation** — "Download Certificate" is still a no-op.
- [ ] **Real quiz questions per module** — every module still uses the same 3 sample questions.
- [ ] **Instructor assignment from DB** — `INSTRUCTORS` / `CURRENT_INSTRUCTOR` still hardcoded
  in `mock-data.ts` / `instructor-context.ts`.

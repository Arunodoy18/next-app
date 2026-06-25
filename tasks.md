# Tasks — Blackmont Academy Platform

Priority: P0 = do now, P1 = do next, P2 = do when touching the area, P3 = backlog

---

## P0 — Security (do before deploying anything)

- [x] **Add auth middleware** — Create `middleware.ts` that verifies the JWT cookie and redirects unauthenticated users to `/login`. Protect `/admin`, `/instructor`, `/student`, `/internal` routes. Redirect `/` based on role.
- [x] **Add auth + role checks to admin API routes** — `GET/POST /api/admin/users` and `PATCH/DELETE /api/admin/users/[userId]` must verify the session cookie AND check `role === "Admin"`. Return 401/403 otherwise.
- [x] **Fix password sentinel** — Replace `password: "pending_verification"` in user creation with a random bcrypt hash (e.g., `await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)`). Add an explicit check in the login route that rejects users with `verified !== "complete"`.
- [x] **Add unique index on email** — Add `unique: true` to the `email` field in `userModel.ts`.

---

## P1 — Architecture (high-impact cleanup)

- [x] **Unify student + internal dashboards** — Extract the shared learner dashboard (sidebar, module viewer, quiz engine, written exam, grade view, fullscreen mode) into a single component. Student and internal pages should be thin wrappers that pass in their data source, branding, and path config. This is ~2200 lines of duplication down to ~1200.
- [x] **Make student + internal use PortalShell** — Or better: merge the sidebar logic from these pages into `portal-shell.tsx` so all four portals share the same shell component. The student/internal sidebar has extra features (programme switcher, module tree) that could be passed as props or slots.
- [x] **Fix root redirect** — `src/app/page.tsx` should check the session cookie and redirect to the appropriate portal based on role, or to `/login` if unauthenticated.
- [x] **Remove dead `credentialsVerified` field** — It's defined in the schema but never used. Remove it from `userModel.ts` and `types/userDoc.ts`.

---

## P2 — Code Quality (clean up when touching these files)

- [ ] **Remove debug comments** — Clean up `// remov1234`, `// REVW`, and any other marker comments across the codebase.
- [ ] **Remove duplicate type definitions** — Delete the local `Resource`, `Quiz`, `Module`, `Programme` interfaces in `student/page.tsx` and `internal/page.tsx`. Import from shared types or convert the mock-data shape.
- [ ] **Replace global `idCounter`** — Use `crypto.randomUUID()` in `programmes/page.tsx` instead of the mutable module-level counter.
- [ ] **Fix localStorage progress key** — The student and internal pages read `localStorage.getItem('user')` which is never set. Either set it on login, or use the userId from the auth session.
- [ ] **Fix InternalDivider visibility** — Change `text-white` to `text-muted-foreground` in the Internal divider label in `instructor/page.tsx`.
- [ ] **Cache useUser hook** — Replace the bare `useEffect` fetch in `use-current-user.tsx` with a `useQuery` call (react-query is already in the project) so it deduplicates and caches.
- [ ] **Remove or implement Wix webhook** — `api/webhooks/wix/route.ts` does nothing. Delete it or build it out.

---

## P3 — Feature Backlog

- [ ] **Programmes CRUD API** — The unstaged `src/app/api/admin/programmes/` and `src/models/programmeModel.ts` files exist but aren't committed. Finish and connect them so programmes persist to MongoDB instead of mock data.
- [ ] **Student enrollment system** — Connect student records to the database so progress, quiz scores, and written answers persist across sessions.
- [x] **Rate limiting on auth endpoints** — Add rate limiting to `/api/auth/login`, `/api/auth/forgot`, and `/api/auth/verify` to prevent brute-force and email-bombing.
- [ ] **Certificate generation** — The "Download Certificate" button is a no-op. Implement PDF generation or connect to a certificate service.
- [ ] **Real quiz questions per module** — Currently every module uses the same 3 sample questions. Connect quizzes to the programme data model.
- [ ] **Instructor assignment from DB** — `INSTRUCTORS` and `CURRENT_INSTRUCTOR` are hardcoded in `mock-data.ts` and `instructor-context.ts`. Connect to the user database.

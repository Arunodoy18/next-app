# Code Review — Blackmont Academy Platform

## CRITICAL: Security

### 1. ~~Admin API routes have ZERO auth checks~~ ✅
~~`src/app/api/admin/users/route.ts` and `src/app/api/admin/users/[userId]/route.ts` have no authentication or authorization. Anyone on the internet can:~~
- ~~`GET /api/admin/users` — list every user~~
- ~~`POST /api/admin/users` — create users with any role~~
- ~~`PATCH /api/admin/users/:id` — change anyone's role/email/name~~
- ~~`DELETE /api/admin/users/:id` — delete any user~~

~~This is the single most important fix in the repo.~~

### 2. ~~No route protection middleware~~ ✅
~~There is no `middleware.ts`. Any logged-out user can visit `/admin`, `/instructor`, etc. The pages rely on client-side `useUser()` to show data, but the routes themselves are wide open. A student can visit `/admin/users` and see the full user management page (the data comes from an unprotected API anyway).~~

### 3. ~~No role-based access control~~ ✅
~~Even after adding auth to API routes, there's no check that the authenticated user's role matches the resource. A Student with a valid JWT could call admin endpoints.~~

### 4. ~~Password sentinel stored as plaintext~~ ✅
~~`admin/users/route.ts:39` — new users get `password: "pending_verification"` (a literal string, not a bcrypt hash). If someone tries to log in with the password `"pending_verification"` before the user verifies, `bcrypt.compare` will fail because it's not a hash — but this is fragile and semantically wrong. It should be a random hash or `null` with an explicit check.~~

### 5. ~~No rate limiting on auth endpoints~~ ✅
~~Login, forgot-password, and verify endpoints have no rate limiting. Brute-force attacks and email-bombing are trivially possible.~~

---

## HIGH: Architecture

### 6. student/page.tsx and internal/page.tsx are near-identical 1100-line monoliths
These two files duplicate the entire learner dashboard: sidebar, module navigation, resource viewer, quiz engine, written exam, grade report, fullscreen mode. The diff between them is ~30 lines (branding, paths, data source). This is the largest tech debt in the repo.

### 7. Student and Internal portals build their own sidebar; Admin and Instructor use PortalShell
`portal-shell.tsx` is a clean shared shell used by admin and instructor layouts. Student and internal ignore it entirely and reimplement the sidebar, topbar, avatar menu, collapse toggle, scroll-hide behavior — all inline in their page.tsx. This means two separate implementations of the same UI that will diverge.

### 8. Root page hardcodes redirect to /student
`src/app/page.tsx` does `redirect("/student")` unconditionally. An admin or instructor hitting `/` always lands on the student portal. This should redirect based on the user's role (or to `/login` if unauthenticated).

### 9. All programme/student/thread data is mock (in-memory React state)
`portal-store.tsx` seeds from `mock-data.ts` on every page load. Admin programmes editor, performance page, instructor evaluations, student dashboard — all running on hardcoded sample data. Only the Users page talks to MongoDB.

---

## MEDIUM: Code Quality

### 10. Debug comments left in source
- `// remov1234` in `mock-data.ts:1` and `portal-store.tsx:1`
- `// REVW` markers in `admin/layout.tsx:1`, `student/page.tsx:1`, `internal/page.tsx:1`, `instructor/layout.tsx:1`, `instructor/page.tsx:1`, `portal-shell.tsx:1`
- These should be cleaned up.

### 11. Duplicate type definitions
`student/page.tsx` and `internal/page.tsx` each define their own `Resource`, `Quiz`, `Module`, `Programme` interfaces locally (~lines 49-76). These shadow the shared types in `mock-data.ts` and `types/userDoc.ts`.

### 12. Global mutable counter
`programmes/page.tsx:66` — `let idCounter = 1000` is module-level mutable state. If the module hot-reloads or two instances render, IDs could collide. Should use `crypto.randomUUID()` or similar.

### 13. `verified` vs `credentialsVerified` confusion in UserSchema
The schema has both `verified` and `credentialsVerified` fields with the same enum values. The API routes only use `verified`. `credentialsVerified` appears to be dead — it's defined but never read from or meaningfully written to.

### 14. ~~Email not uniquely indexed in MongoDB~~ ✅
~~`userModel.ts` — `email` has no `unique: true` on the schema. Uniqueness is only checked at the application level in the create-user route. A race condition could create duplicate emails.~~

### 15. Wix webhook is a dead placeholder
`api/webhooks/wix/route.ts` — returns `{ success: true }` for every POST. All business logic is commented out. Either finish it or remove it.

---

## LOW: Polish

### 16. Student portal reads `localStorage.getItem('user')` directly
`student/page.tsx:202` and `internal/page.tsx:167` read `localStorage.getItem('user')` to get the current user identity for progress storage. But nothing sets this key — the auth system uses cookies/JWT. The progress key ends up being `programme-progress-null` for most users.

### 17. Same quiz questions for every module
`student/page.tsx` and `internal/page.tsx` use the same `SAMPLE_QUIZ_QUESTIONS` array for every single module quiz. This is fine for a prototype but will be confusing if anyone tests it.

### 18. `InternalDivider` text color is hardcoded white
`instructor/page.tsx:348` — `text-white` means the "Internal" divider label is invisible in light mode.

### 19. Certificate download is a no-op
The "Download Certificate" button in the student portal has no `onClick` handler and is just a disabled button that enables when the programme is complete — but clicking it does nothing.

### 20. `useUser()` fires a fetch on every component mount
`hooks/use-current-user.tsx` calls `getSession()` (which hits `/api/auth/me`) in a bare `useEffect` with no caching. Multiple components using this hook will fire parallel requests. Should use react-query or a shared context.

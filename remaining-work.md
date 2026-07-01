# Where things actually stand (2026-07-01)

## Done for real (DB-backed, not mock)
- Auth (magic link + OTP), roles, route protection.
- Users CRUD (admin/users) — real API + DB.
- Programmes CRUD (admin/programmes) — real API + DB (`programmeModel`, `programmeSchema`, `/api/programmes`).

## Your understanding is correct, with one addition
Your read of the plan is right:

1. Build a **Learner / enrollment collection** — one record per (user, programme) with
   module progress, quiz scores, written answers. This is the missing piece everything
   else hangs off of.
2. Student (consultant) and Internal portals just **read** programme content from the
   Programmes collection and **read/write progress** to the new Learner collection.
   No new UI work there really — just swap mock reads for real API calls.
3. Once the Learner collection exists and is wired up, these become "just query it,"
   not new features:
   - **Admin overview** (`admin/page.tsx`) — counts/stats, derive from Users + Programmes + Learner.
   - **Admin performance** (`admin/performance/page.tsx`) — same, derive from Learner data.
   - **Instructor overview** (`instructor/page.tsx`) — derive from Learner data scoped to that instructor's programmes.
   - **Instructor performance** — same as admin performance, scoped down.
   - **Instructor → Consultants** (`instructor/consultants/page.tsx`) — list + detail, reads Learner + User.
   - **Instructor → Evaluations** (`instructor/evaluations/page.tsx`) — reads written answers from Learner.

One thing not on your list: **Messages** (`instructor/messages/page.tsx`, consultant messages)
is still 100% mock (`THREADS` in `mock-data.ts`). That needs its own collection
(threads/messages) — it doesn't come for free from the Learner collection. Small job,
but it's separate plumbing.

Also not on your list but still open:
- **Certificate generation** — "Download Certificate" is a no-op button.
- **Real quiz questions per module** — every module reuses the same 3 sample MCQs.
- **Instructor assignment from DB** — `INSTRUCTORS` / `CURRENT_INSTRUCTOR` are hardcoded, not read from Users.
- **Wix webhook** — `api/webhooks/wix/route.ts` is a stub, decide build-it-out or delete.
- A few leftover `// REVW` debug comments to strip.

## Realistic % remaining
Rough weight, by effort not by page count:

- Learner/enrollment collection + API (model, schema, progress/quiz/written-answer writes): **the big one, ~35-40% of remaining work.**
- Wiring student/internal read paths to real Programmes + Learner data (killing remaining mock reads): ~10%.
- Admin/instructor overview + performance (pure derived queries once Learner exists): ~10%.
- Instructor consultants + evaluations pages (once Learner exists): ~10%.
- Messages collection + wiring (separate, not derived from Learner): ~15%.
- Certificates, real quiz banks, instructor-from-DB, webhook decision, cleanup: ~15-20%.

**Overall: roughly 60-65% of the full platform is done. ~35-40% left, and the Learner
collection is the load-bearing piece — almost everything else in your list is trivial
once that exists.**

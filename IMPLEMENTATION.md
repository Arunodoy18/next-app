# Implementation notes (backend / future work)

Behavioural decisions captured for when the backend is wired up. These are
**not implemented yet** — the frontend is a localStorage/mock-data prototype.

## Progress when content is added to an already-started programme

Two progress models exist today:

- **Learner side (`/dashboard`, `/internal`)** — a map of *completed item ids*
  in `localStorage` (`programme-progress-<user>` / `internal-programme-progress-<user>`).
  Completion % is derived live as `completedItems / totalItems`.
- **Records side (admin/instructor tables)** — `StudentRecord.moduleProgress[]`
  stores a `completed` boolean + `mcqScore` **per module** (module-level, not
  item-level).

When new content is added to a programme a student has already worked on:

1. **Nothing is un-completed.** Old completed ids stay `true`.
2. **Completion % drops automatically** because `total` grew (e.g. 6/6 → 6/8).
   This is intended — it reflects real new work.
3. **Grade dips** — grade averages only *attempted* quizzes, so a new quiz
   counts as not-attempted until taken.

### Required fix: sequential unlock

The dashboard locks items via `firstIncompleteIndex` (everything after the
first incomplete item is locked). So placement matters:

- **Appended at the end** → fine.
- **Inserted mid-sequence** (before items the student already finished) → the
  new item becomes the "first incomplete" and **re-locks already-completed
  later items**, forcing the student to click back through them. Data isn't
  lost, but the gating is wrong.

**Recommendation:** never re-lock an item the learner already completed — lock
only genuinely-untouched items that sit after an *earlier* incomplete item.
Simpler alternative policy: always append new content, never insert mid-sequence.

### Other recommendations

- Keep completed items completed; let % and grade recompute/dip (honest signal).
- Surface a **"New content added"** badge on the affected module so the dip is
  explained rather than looking like lost progress.

## Certificate: once earned, stays earned

**Critical:** once a student has earned a programme's certificate, newly added
content must **not** revoke it or force them to retake quizzes.

- Persist an "earned" flag per `(student, programme)` (server-side once backend
  exists; the prototype would use a `programme-certificates-<user>` localStorage
  list).
- Record it the moment the programme first reaches 100%.
- After that, the certificate stays unlocked/downloadable regardless of later
  content. Optionally mark it **"Update available"** to nudge finishing new
  material, but never disable the existing certificate.
- The `/internal` track has no certificate, so this applies to `/dashboard` only.

## Prototype caveat

The student `/dashboard` reads a **hardcoded local `PROGRAMMES` constant**, not
the shared `usePortalStore()`. So admin edits in `/admin/programmes` do not yet
flow to the learner view. To make "admin adds content → student sees it" real,
the dashboard/internal pages must read from the store. Everything above becomes
live once that's done.

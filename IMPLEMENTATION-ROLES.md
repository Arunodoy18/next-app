# Implementation Details — Department Roles & Badges

> Status: **proposal for review** (no code changes applied yet).

## Goal

Introduce three department roles that mirror the internal (instructor) training
tracks, render a coloured badge for each, and let admins tag programmes and
users with them.

| Role | Internal programme (1:1) |
| --- | --- |
| Business Development | "Business Development" track |
| HR | "HR" track |
| Project Management | "Project Management" track |

Layout decided with you:

- **3 internal programmes** — one per role.
- **2 standard programmes** — for students (existing `p1`, `p2` stay as-is).
- Roles **extend the existing `UserRole`** enum (a user has exactly one role,
  picked from the existing dropdown — now 6 options).
- Programmes can be tagged with **one or more roles** ("select one or more
  roles") via a multi-select chip control in the programme editor.

---

## 1. Data model — `src/lib/mock-data.ts`

### 1a. Extend `UserRole` (line 45)

```ts
export type UserRole =
  | "Student"
  | "Instructor"
  | "Admin"
  | "Business Development"
  | "HR"
  | "Project Management";
```

### 1b. Add a department-role handle + badge styles

The three new roles are also useful as a standalone group (programme tags,
filters, badge colours). Add below the `UserRole` definition:

```ts
// The three department/track roles — a subset of UserRole used for programme
// tagging and role badges.
export const DEPARTMENT_ROLES = [
  "Business Development",
  "HR",
  "Project Management",
] as const;
export type DepartmentRole = (typeof DEPARTMENT_ROLES)[number];

// One Tailwind class string per role so badges scan at a glance. Extends the
// map that currently lives in admin/users/page.tsx (which should import this).
export const ROLE_BADGE: Record<UserRole, string> = {
  Student: "bg-muted text-muted-foreground border-border",
  Instructor: "bg-blue-500/10 text-blue-600 border-blue-600",
  Admin: "bg-amber-500/10 text-amber-600 border-amber-600",
  "Business Development": "bg-emerald-500/10 text-emerald-600 border-emerald-600",
  HR: "bg-rose-500/10 text-rose-600 border-rose-600",
  "Project Management": "bg-violet-500/10 text-violet-600 border-violet-600",
};
```

### 1c. Tag programmes with roles (interface at line 36)

```ts
export interface Programme {
  id: string;
  name: string;
  description: string;
  instructorIds: string[];
  modules: ProgrammeModule[];
  writtenTest: WrittenQuestion[];
  roles?: DepartmentRole[]; // NEW — one or more department roles this programme serves
}
```

### 1d. Rebuild `INTERNAL_PROGRAMMES` (currently lines 480–592)

Replace the two existing internal programmes with three, one per role. Each is
seeded with its single role; the field is still an array so the editor can add
more later.

```ts
export const INTERNAL_PROGRAMMES: Programme[] = [
  {
    id: "ip1",
    name: "Business Development",
    description: "...",
    instructorIds: ["ins1"],
    roles: ["Business Development"],
    modules: [ /* keep/adapt existing module shape */ ],
    writtenTest: [ /* ... */ ],
  },
  { id: "ip2", name: "HR", roles: ["HR"], /* ... */ },
  { id: "ip3", name: "Project Management", roles: ["Project Management"], /* ... */ },
];
```

> Module/quiz/written-test content can be carried over or lightly reworded — it
> does not affect the role wiring.

### 1e. Internal learner records (`INTERNAL_STUDENTS`, lines 596–646)

- Re-point each record's `programmeId` to one of `ip1`/`ip2`/`ip3` so every
  internal programme has learners.
- These learners are instructors, so their **user** records (in `USERS`) keep
  whatever role you want them shown as. If an internal learner should display
  as their department, set that user's `role` to the matching department role;
  otherwise leave them as `Instructor`. (Confirm on review — see Open Questions.)
- `INTERNAL_THREADS` (lines 648+) reference these ids; update `programmeId`
  values to match the new internal programme ids.

---

## 2. Reusable role badge — `src/components/role-badge.tsx` (new)

Generalise the existing `InstructorTag` (`src/components/instructor-tag.tsx`)
into a badge that renders **any** role with its colour:

```tsx
import { Badge } from "@/components/ui/badge";
import { ROLE_BADGE, type UserRole } from "@/lib/mock-data";

export default function RoleBadge({ role, className = "" }: { role: UserRole; className?: string }) {
  return <Badge className={`align-middle font-medium ${ROLE_BADGE[role]} ${className}`}>{role}</Badge>;
}
```

`InstructorTag` can stay (it is `<RoleBadge role="Instructor" />`) or be
swapped at call sites — low priority.

---

## 3. Admin → Users — `src/app/admin/users/page.tsx`

1. Delete the local `ROLE_BADGE` map (lines 42–46) and import it from
   `mock-data` (now covers all 6 roles). The table badge at line 191 keeps
   working unchanged.
2. Add the three roles to the **Role** `<Select>` in the edit dialog
   (lines 270–274):
   ```tsx
   <SelectItem value="Business Development">Business Development</SelectItem>
   <SelectItem value="HR">HR</SelectItem>
   <SelectItem value="Project Management">Project Management</SelectItem>
   ```
3. (Optional) Add filter tabs for the new roles in the `TabsList`
   (lines 131–134), or leave the existing three — they still filter correctly.
4. Programme-enrolment block (lines 277–332): department-role users behave like
   Instructor/Admin (multi-programme via `programmeIds`); the existing
   `role === "Student"` branch already handles the single-programme case, so the
   `else` branch covers the new roles with no change.

---

## 4. Admin → Programmes — `src/app/admin/programmes/page.tsx`

Add a **"Roles"** multi-select chip control to the programme editor (reuse the
exact pattern already used for "Allotted Programmes" chips in
admin/users lines 300–325, and the assign-instructor chips here at lines
486–490). It applies to **both** the standard and internal programme editors.

```tsx
<div className="flex flex-col gap-1.5">
  <Label>Roles</Label>
  <div className="flex items-center gap-1.5 flex-wrap">
    {DEPARTMENT_ROLES.map((r) => {
      const on = (selected.roles ?? []).includes(r);
      return (
        <button
          key={r}
          type="button"
          onClick={() => updateProgramme(selected.id, {
            roles: on
              ? (selected.roles ?? []).filter((x) => x !== r)
              : [...(selected.roles ?? []), r],
          })}
          className={`inline-flex items-center h-7 rounded-full border px-2.5 text-xs font-medium transition-colors ${
            on ? "border-transparent bg-[#7e55f6] text-white hover:bg-[#6742d4]"
               : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {r}
        </button>
      );
    })}
  </div>
  <p className="text-xs text-muted-foreground m-0">Select one or more roles this programme serves.</p>
</div>
```

`updateProgramme` (line 89) and `setForKind` (line 87) already route the write
to the correct (standard vs internal) store, so no store changes are needed.

---

## 5. Showing role badges across the portals (optional polish)

Wherever a programme or user is listed, render `<RoleBadge>` for its role(s):

- **admin/programmes** sidebar rows (lines 163–180, 219+) — badge each
  programme's `roles`.
- **admin/page.tsx** Instructor Programmes card (around line 150).
- **instructor** dashboard programme rows.
- The internal portal header (`src/app/internal/page.tsx` line 399) can show the
  learner's department role badge.

This is cosmetic and can be staged after the data + editor changes land.

---

## Files touched (summary)

| File | Change |
| --- | --- |
| `src/lib/mock-data.ts` | Extend `UserRole`; add `DEPARTMENT_ROLES`/`DepartmentRole`/`ROLE_BADGE`; add `Programme.roles`; rebuild `INTERNAL_PROGRAMMES` → 3; re-point internal students/threads |
| `src/components/role-badge.tsx` | **New** generic role badge |
| `src/components/instructor-tag.tsx` | Optionally re-implement on top of `RoleBadge` |
| `src/app/admin/users/page.tsx` | Import shared `ROLE_BADGE`; add 3 role options (+ optional tabs) |
| `src/app/admin/programmes/page.tsx` | Add multi-select **Roles** chip control |
| Portal list/detail views | Optional `<RoleBadge>` rendering |

## Open questions for review

1. **Internal learners' displayed role** — should the 3 instructor-learners
   show as their department role (Business Development / HR / Project
   Management) in the Users table, or stay `Instructor`?
2. **Role filter tabs** in admin/users — add tabs for the 3 new roles, or keep
   the current 4 (All / Students / Instructors / Admins)?
3. **Standard programmes** — do `p1`/`p2` get any default role tags, or start
   untagged for the admin to set?

# Implementation Guide

## Scope
Frontend-only prototype. No database, no auth — `/admin` and `/instructor` are directly accessible. All data is placeholder/mock (hardcoded arrays/objects in code).

## Current State
- Next.js 16 app with `src/app` router, Tailwind, shadcn/ui, next-themes.
- Existing pages: `login`, `forgot`, `dashboard` (placeholder), Wix webhook API route.

---

## Data Shape (placeholder objects, no DB)

- **Programme**: id, name, description, instructorIds[]
- **Module** (belongs to a Programme): id, programmeId, name, resources[] (video/pdf/link), mcqTest (set of MCQ questions)
- **ProgrammeTest** (one per Programme, final written test): questions[] (free-text answer)
- **Student**: id, name, email, programmeId, progress (per-module completion + MCQ scores), writtenAnswers (for programme test, with evaluation status/score)
- **Instructor**: id, name, email, assignedProgrammeIds[]

---

## 1. Instructor Portal (`/instructor`)

### Features
- Student roster: list of students enrolled in programmes assigned to this instructor.
- Click a student → opens a dialog (on the same page) showing progress, module completion, MCQ scores.
- Evaluate written answers for the programme-end test (per student, per programme) — instructor scores/comments.

### Routes
- `/instructor` — single page: student table (filterable by programme), row click opens detail dialog with progress + written-answer evaluation form.

### Components
- `StudentTable` (shadcn Table)
- `StudentDetailDialog` — progress bars per module, MCQ scores, written test answers + evaluation inputs

---

## 2. Admin Portal (`/admin`)

### Features
- Programme management: create/edit programmes, assign one or more instructors.
- Module management: within a programme, create modules; each module has resources (video/pdf/link) and an MCQ test.
- Programme-end written test management: define questions for the final test per programme.
- User & Access management: students/employees/admins — edit/delete via dialogs in the table (no separate detail pages).
- Student data: view/edit/delete/export placeholder.

### Routes
- `/admin` — single page (or tabs) covering:
  - **Programmes** table — row click/edit opens dialog to edit programme details, assign instructors, manage its modules (add/edit/remove module, set resources, MCQ questions) and the final written test questions, all within nested dialogs/accordions on the same page.
  - **Users** table — students/employees/instructors/admins, edit/delete via dialog, export button (CSV stub).

No dynamic `[id]` routes — everything edits in-place via dialogs.

### Components
- `DataTable` (generic, sortable/filterable)
- `EditDialog` (generic form dialog, reused for programmes/modules/users)
- `ModuleEditor` — resources list (add video/pdf/link), MCQ question builder
- `WrittenTestEditor` — list of free-text questions

---

## Build Order
1. Generic `DataTable` + `EditDialog` components with placeholder data.
2. `/admin` — Programmes table + edit dialog (incl. nested module/MCQ/written-test editors).
3. `/admin` — Users table + edit/delete dialogs + export stub.
4. `/instructor` — Student table + detail dialog (progress view + written answer evaluation).

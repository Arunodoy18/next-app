"use client";

import { useState } from "react";
import PlaceholderGuard from "@/components/misc/placeholder-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudentDetailDialog from "@/components/student-detail-dialog";
import LearnerRoleBadge from "@/components/learner-role-badge";
import PageTitle from "@/components/page-title";
import { usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { type WrittenAnswer } from "@/lib/mock-data";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function InstructorEvaluationsPage() {
  const { programmes, students, setStudents, internalProgrammes, internalStudents, setInternalStudents } =
    usePortalStore();
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("student")
  );

  const allProgrammes = [...programmes, ...internalProgrammes];
  const programmeName = (id: string) => allProgrammes.find((p) => p.id === id)?.name ?? "N/A";

  // Internal (instructor) learners in the programmes this instructor delivers,
  // plus their own internal enrolment.
  const myInternalProgrammeIds = internalProgrammes
    .filter((p) => p.instructorIds.includes(CURRENT_INSTRUCTOR.id))
    .map((p) => p.id);
  const myInternalStudents = internalStudents.filter(
    (s) => myInternalProgrammeIds.includes(s.programmeId) || s.name === CURRENT_INSTRUCTOR.name
  );
  const standardStudents = students.filter((s) =>
    CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId)
  );
  const myStudents = [...standardStudents, ...myInternalStudents].filter(
    (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
  );

  const isPending = (s: (typeof students)[number]) => s.writtenAnswers.some((a) => a.score === null);
  const isEvaluated = (s: (typeof students)[number]) =>
    s.writtenAnswers.length > 0 && s.writtenAnswers.every((a) => a.score !== null);

  const standardQueue = standardStudents.filter(isPending);
  const internalQueueList = myInternalStudents.filter(isPending);
  const standardEvaluated = standardStudents.filter(isEvaluated);
  const internalEvaluated = myInternalStudents.filter(isEvaluated);
  const queue = [...standardQueue, ...internalQueueList];
  const evaluated = [...standardEvaluated, ...internalEvaluated];

  const selected = myStudents.find((s) => s.id === selectedId) ?? null;
  const selectedProgramme = selected ? allProgrammes.find((p) => p.id === selected.programmeId) ?? null : null;

  const saveEvaluation = (studentId: string, answers: WrittenAnswer[]) => {
    // Route to the internal set when the learner is an internal (instructor) one.
    const isInternal = internalStudents.some((s) => s.id === studentId);
    const setter = isInternal ? setInternalStudents : setStudents;
    setter((prev) => prev.map((s) => (s.id === studentId ? { ...s, writtenAnswers: answers } : s)));
  };

  const studentRow = (s: (typeof students)[number], pending: number) => (
    <button
      key={s.id}
      onClick={() => setSelectedId(s.id)}
      className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50 transition-colors w-full"
    >
      <div className="size-9 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-sm font-medium shrink-0">
        {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium m-0 truncate">
          {s.name}
          <LearnerRoleBadge id={s.id} className="ml-2" />
        </p>
        <p className="text-xs text-muted-foreground m-0 truncate">{programmeName(s.programmeId)}</p>
      </div>
      {pending > 0 ? (
        <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">
          {pending} answer{pending === 1 ? "" : "s"} pending
        </Badge>
      ) : (
        <Badge className="bg-green-500/10 text-green-600 border-transparent shrink-0">Evaluated</Badge>
      )}
      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
    </button>
  );

  return (
    <PlaceholderGuard>
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <PageTitle title="Instructor Portal" />
      <div>
        <h1 className="text-3xl font-normal m-0">Evaluations</h1>
        <p className="text-muted-foreground mt-1">Programme-end written tests submitted by your students.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium m-0">Awaiting review</CardTitle>
          <CardDescription>Submissions stay here until every answer has a score.</CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground m-0">All caught up. Nothing is waiting for review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardQueue.map((s) => studentRow(s, s.writtenAnswers.filter((a) => a.score === null).length))}
              {internalQueueList.length > 0 && <InternalDivider />}
              {internalQueueList.map((s) => studentRow(s, s.writtenAnswers.filter((a) => a.score === null).length))}
            </div>
          )}
        </CardContent>
      </Card>

      {evaluated.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium m-0">Completed</CardTitle>
            <CardDescription>Already evaluated. Open a student to revisit scores or feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardEvaluated.map((s) => studentRow(s, 0))}
              {internalEvaluated.length > 0 && <InternalDivider />}
              {internalEvaluated.map((s) => studentRow(s, 0))}
            </div>
          </CardContent>
        </Card>
      )}

      <StudentDetailDialog
        student={selected}
        programme={selectedProgramme}
        onClose={() => setSelectedId(null)}
        onSaveEvaluation={saveEvaluation}
      />
    </div>
    </PlaceholderGuard>
  );
}

function InternalDivider() {
  return (
    <div className="flex items-center gap-2 py-1 sm:col-span-2">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-wide text-white">Internal</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

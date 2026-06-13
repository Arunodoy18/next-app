"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudentDetailDialog from "@/components/student-detail-dialog";
import { usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { programmeName, type WrittenAnswer } from "@/lib/mock-data";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function InstructorEvaluationsPage() {
  const { programmes, students, setStudents } = usePortalStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Open a student directly when arriving from the Students roster
  // (e.g. /instructor/evaluations?student=stu-1).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("student");
    if (id) setSelectedId(id);
  }, []);

  const myStudents = students.filter((s) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId));
  const queue = myStudents.filter((s) => s.writtenAnswers.some((a) => a.score === null));
  const evaluated = myStudents.filter(
    (s) => s.writtenAnswers.length > 0 && s.writtenAnswers.every((a) => a.score !== null)
  );

  const selected = students.find((s) => s.id === selectedId) ?? null;
  const selectedProgramme = selected ? programmes.find((p) => p.id === selected.programmeId) ?? null : null;

  const saveEvaluation = (studentId: string, answers: WrittenAnswer[]) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, writtenAnswers: answers } : s)));
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
        <p className="text-sm font-medium m-0 truncate">{s.name}</p>
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Evaluations</h1>
        <p className="text-muted-foreground mt-1">Programme-end written tests submitted by your students.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium m-0">Awaiting review</CardTitle>
          <CardDescription>Submissions stay here until every answer has a score.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {queue.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground m-0">All caught up. Nothing is waiting for review.</p>
            </div>
          ) : (
            queue.map((s) => studentRow(s, s.writtenAnswers.filter((a) => a.score === null).length))
          )}
        </CardContent>
      </Card>

      {evaluated.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium m-0">Completed</CardTitle>
            <CardDescription>Already evaluated. Open a student to revisit scores or feedback.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">{evaluated.map((s) => studentRow(s, 0))}</CardContent>
        </Card>
      )}

      <StudentDetailDialog
        student={selected}
        programme={selectedProgramme}
        onClose={() => setSelectedId(null)}
        onSaveEvaluation={saveEvaluation}
      />
    </div>
  );
}

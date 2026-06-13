"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import type { Programme, StudentRecord, WrittenAnswer } from "@/lib/mock-data";

type Drafts = Record<string, { score: string; feedback: string }>;

// Grading inputs always start blank — instructors enter a fresh score/feedback
// rather than editing a pre-filled value.
function emptyDrafts(student: StudentRecord): Drafts {
  const next: Drafts = {};
  student.writtenAnswers.forEach((a) => {
    next[a.questionId] = { score: "", feedback: "" };
  });
  return next;
}

/**
 * Shared student detail dialog.
 *
 * - `view` mode (Students roster): read-only progress + written-test status.
 *   No grading inputs; an action button hands off to the Evaluations page.
 * - `evaluate` mode (Evaluations / Admin performance): adds the grading form.
 */
export default function StudentDetailDialog({
  student,
  programme,
  mode = "evaluate",
  onClose,
  onSaveEvaluation,
  onEvaluate,
}: {
  student: StudentRecord | null;
  programme: Programme | null;
  mode?: "view" | "evaluate";
  onClose: () => void;
  onSaveEvaluation?: (studentId: string, answers: WrittenAnswer[]) => void;
  onEvaluate?: (studentId: string) => void;
}) {
  // Cache the last shown student so content stays mounted through the
  // close animation; reset drafts only when a different student opens.
  const [view, setView] = useState<{ student: StudentRecord; programme: Programme } | null>(
    student && programme ? { student, programme } : null
  );
  const [drafts, setDrafts] = useState<Drafts>(() => (student ? emptyDrafts(student) : {}));
  const [savedFlash, setSavedFlash] = useState(false);

  if (student && programme && (view?.student !== student || view?.programme !== programme)) {
    if (view?.student.id !== student.id) {
      setDrafts(emptyDrafts(student));
      setSavedFlash(false);
    }
    setView({ student, programme });
  }

  const submitted = (view?.student.writtenAnswers.length ?? 0) > 0;
  const pendingCount = view?.student.writtenAnswers.filter((a) => a.score === null).length ?? 0;

  const save = () => {
    if (!view || !onSaveEvaluation) return;
    const updated = view.student.writtenAnswers.map((a) => {
      const draft = drafts[a.questionId];
      if (!draft) return a;
      // A blank score leaves the existing value untouched; a typed value
      // overwrites it (clamped to 0–100).
      const parsed = draft.score === "" ? a.score : Math.min(100, Math.max(0, Number(draft.score)));
      return {
        ...a,
        score: Number.isNaN(parsed as number) ? a.score : parsed,
        feedback: draft.feedback === "" ? a.feedback : draft.feedback,
      };
    });
    onSaveEvaluation(view.student.id, updated);
    setSavedFlash(true);
  };

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {view && (
          <>
            <DialogHeader>
              <DialogTitle>{view.student.name}</DialogTitle>
              <DialogDescription>
                {view.student.email} · {view.programme.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 mt-2">
              <div>
                <h3 className="text-sm font-medium mb-3">Module Progress</h3>
                <div className="flex flex-col gap-2">
                  {view.programme.modules.map((m) => {
                    const p = view.student.moduleProgress.find((mp) => mp.moduleId === m.id);
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                          {p?.completed ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <Circle size={16} className="text-muted-foreground/40" />
                          )}
                          <span className="text-sm font-medium">{m.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Quiz score: {p?.mcqScore !== null && p?.mcqScore !== undefined ? `${p.mcqScore}%` : "N/A"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-medium m-0">Programme-End Written Test</h3>
                  {submitted &&
                    (pendingCount === 0 ? (
                      <Badge className="bg-green-500/10 text-green-600 border-transparent shrink-0">Evaluated</Badge>
                    ) : (
                      <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">
                        Pending review
                      </Badge>
                    ))}
                </div>

                {!submitted ? (
                  <p className="text-sm text-muted-foreground">Student has not submitted the written test yet.</p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {view.programme.writtenTest.map((q) => {
                      const ans = view.student.writtenAnswers.find((a) => a.questionId === q.id);
                      if (!ans) return null;
                      const draft = drafts[q.id] ?? { score: "", feedback: "" };
                      return (
                        <div key={q.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium m-0">{q.question}</p>
                            {ans.score !== null && (
                              <Badge className="bg-green-500/10 text-green-600 border-transparent shrink-0">
                                Scored {ans.score}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 m-0 whitespace-pre-wrap">
                            {ans.answer}
                          </p>

                          {mode === "evaluate" && (
                            <div className="flex flex-col gap-2 mt-1">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-muted-foreground w-20 shrink-0">Score (%)</label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="Enter the score"
                                  value={draft.score}
                                  onChange={(e) => {
                                    setSavedFlash(false);
                                    setDrafts((prev) => ({ ...prev, [q.id]: { ...draft, score: e.target.value } }));
                                  }}
                                  className="h-8 w-40"
                                />
                              </div>
                              <Textarea
                                placeholder="Feedback for the student"
                                value={draft.feedback}
                                onChange={(e) => {
                                  setSavedFlash(false);
                                  setDrafts((prev) => ({ ...prev, [q.id]: { ...draft, feedback: e.target.value } }));
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {mode === "view" && submitted && onEvaluate && (
              <DialogFooter>
                <Button
                  className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                  onClick={() => onEvaluate(view.student.id)}
                >
                  <ClipboardCheck size={15} />
                  {pendingCount > 0 ? "Evaluate written test" : "Review evaluation"}
                </Button>
              </DialogFooter>
            )}

            {mode === "evaluate" && submitted && onSaveEvaluation && (
              <DialogFooter className="items-center">
                {savedFlash && (
                  <span className="text-xs text-green-600 flex items-center gap-1 mr-auto">
                    <CheckCircle2 size={13} /> Evaluation saved
                  </span>
                )}
                <Button className="bg-[#7e55f6] hover:bg-[#6742d4] text-white" onClick={save}>
                  Save Evaluation
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

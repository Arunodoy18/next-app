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
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {view && (
          <>
            <div className="px-6 py-5 border-b border-border shrink-0 bg-card/50">
              <DialogHeader>
              <DialogTitle>{view.student.name}</DialogTitle>
              <DialogDescription>
                {view.student.email} · {view.programme.name}
              </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">
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
                        <div key={q.id} className="flex flex-col gap-4 p-5 rounded-xl border border-border/60 bg-card shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-base font-medium m-0 leading-snug text-foreground">{q.question}</h4>
                            {ans.score !== null && (
                              <Badge className="bg-green-500/10 text-green-600 border-transparent shrink-0 text-sm py-1 px-2.5 font-medium">
                                Scored {ans.score}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="relative mt-1">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/20 rounded-full" />
                            <p className="text-[15px] text-muted-foreground pl-5 py-1 m-0 whitespace-pre-wrap leading-relaxed">
                              {ans.answer}
                            </p>
                          </div>

                          {mode === "evaluate" && (
                            <div className="flex flex-col gap-5 mt-3 pt-5 border-t border-border/50">
                              <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-foreground shrink-0 w-24">Score</label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="0-100"
                                    value={draft.score}
                                    onChange={(e) => {
                                      setSavedFlash(false);
                                      setDrafts((prev) => ({ ...prev, [q.id]: { ...draft, score: e.target.value } }));
                                    }}
                                    className="h-10 w-32 pr-8 font-medium bg-background text-base"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-foreground">
                                  Feedback <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span>
                                </label>
                                <Textarea
                                  placeholder="Provide constructive feedback for this answer..."
                                  value={draft.feedback}
                                  onChange={(e) => {
                                    setSavedFlash(false);
                                    setDrafts((prev) => ({ ...prev, [q.id]: { ...draft, feedback: e.target.value } }));
                                  }}
                                  className="min-h-[100px] resize-y bg-background text-[15px] leading-relaxed p-3"
                                />
                              </div>
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
              <div className="px-6 py-4 border-t border-border bg-card/50 shrink-0">
                <DialogFooter>
                  <Button
                    className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                    onClick={() => onEvaluate(view.student.id)}
                  >
                    <ClipboardCheck size={15} className="mr-2" />
                    {pendingCount > 0 ? "Evaluate written test" : "Review evaluation"}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {mode === "evaluate" && submitted && onSaveEvaluation && (
              <div className="px-6 py-4 border-t border-border bg-card/50 shrink-0">
                <DialogFooter className="items-center sm:justify-between w-full">
                  <div className="flex items-center">
                    {savedFlash && (
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={16} /> Evaluation saved successfully
                      </span>
                    )}
                  </div>
                  <Button className="bg-[#7e55f6] hover:bg-[#6742d4] text-white px-8 h-10 rounded-full font-medium" onClick={save}>
                    Save Evaluation
                  </Button>
                </DialogFooter>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

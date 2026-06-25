"use client";

import PlaceholderGuard from "@/components/misc/placeholder-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Award,
  ChevronRight,
  X,
  Lock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  useLearner,
  CERTIFICATE_VIEW,
  GRADE_VIEW,
  WRITTEN_EXAM_VIEW,
  SAMPLE_QUIZ_QUESTIONS,
  SAMPLE_WRITTEN_QUESTIONS,
  gradeLetter,
} from "@/components/learner-context";

const RESOURCE_ICONS: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
};

const RESOURCE_LABELS: Record<string, string> = {
  video: "Video",
  pdf: "PDF",
};

const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export default function LearnerContent() {
  const {
    config,
    programme,
    activeModule,
    setActiveModule,
    expandedModule,
    setExpandedModule,
    openResource,
    setOpenResource,
    completed,
    toggleItem,
    quizAnswers,
    setQuizAnswers,
    quizSubmitted,
    setQuizSubmitted,
    fullscreenItem,
    setFullscreenItem,
    writtenAnswers,
    setWrittenAnswers,
    writtenSubmitted,
    setWrittenSubmitted,
    allItems,
    isLocked,
    moduleItemCount,
    moduleCompletedCount,
    moduleCompletionPercent,
    isComplete,
    moduleGrade,
    programmeHasGrade,
    programmeGradePercent,
  } = useLearner();

  const { showCertificate } = config;

  const currentModule = programme.modules.find((m) => m.id === activeModule);
  const currentModuleIndex = programme.modules.findIndex((m) => m.id === activeModule);
  const showCertificateView = showCertificate && activeModule === CERTIFICATE_VIEW;
  const showGrade = activeModule === GRADE_VIEW;
  const showWrittenExam = activeModule === WRITTEN_EXAM_VIEW;

  const nextDestination =
    currentModuleIndex >= 0 && currentModuleIndex < programme.modules.length - 1
      ? { id: programme.modules[currentModuleIndex + 1].id, label: "Next module" }
      : { id: WRITTEN_EXAM_VIEW, label: "Written Exam" };
  const currentModuleComplete = currentModule ? moduleCompletionPercent(currentModule) === 100 : false;
  const currentModuleGrade = currentModule ? moduleGrade(currentModule) : null;

  return (
    <PlaceholderGuard>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-normal m-0">{programme.title}</h1>
          <p className="text-muted-foreground mt-1">{programme.description}</p>
        </div>

        {showGrade ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium m-0">Grade Report</CardTitle>
              <CardDescription className="mt-1">
                Overall grade:{" "}
                <span className="font-medium text-foreground">
                  {programmeHasGrade ? `${gradeLetter(programmeGradePercent)} (${programmeGradePercent}%)` : "No grade yet"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {programme.modules.map((module, moduleIndex) => {
                const grade = moduleGrade(module);
                return (
                  <div key={module.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium m-0 truncate">
                        {moduleIndex + 1}. {module.title}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground m-0 mt-0.5">
                        <HelpCircle size={12} className="text-[#7e55f6] shrink-0" />
                        {module.quiz.title}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {grade !== null ? `${gradeLetter(grade)} (${grade}%)` : "No grade yet"}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FileText size={15} className="text-[#7e55f6]" />
                  Written Exam
                </span>
                <span className="text-sm text-muted-foreground">
                  {writtenSubmitted ? "Pending instructor review" : "Not submitted"}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : showCertificateView ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center text-center gap-4 p-10">
              <Award size={48} className={isComplete ? "text-[#7e55f6]" : "text-muted-foreground/40"} />
              <div>
                <CardTitle className="text-2xl font-medium m-0 mb-2">Certificate of Completion</CardTitle>
                <CardDescription>
                  {isComplete
                    ? `Congratulations! You have completed ${programme.title}.`
                    : "Complete all modules and quizzes to unlock your certificate."}
                </CardDescription>
              </div>
              <Button
                type="button"
                disabled={!isComplete}
                className="bg-[#7e55f6] hover:bg-[#6742d4] text-white shadow-md disabled:opacity-50 disabled:pointer-events-none"
              >
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        ) : currentModule ? (
          <div className="flex flex-col gap-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-medium m-0">
                    {currentModuleIndex + 1}. {currentModule.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {moduleCompletedCount(currentModule)} / {moduleItemCount(currentModule)} completed
                  </CardDescription>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0 text-right">
                  {currentModuleGrade !== null ? `${gradeLetter(currentModuleGrade)} (${currentModuleGrade}%)` : "No grade yet"}
                </span>
              </CardHeader>
              <CardContent>
                <Progress value={moduleCompletionPercent(currentModule)} />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium m-0">Resources</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {currentModule.resources.map((resource, resourceIndex) => {
                  const Icon = RESOURCE_ICONS[resource.type];
                  const done = !!completed[resource.id];
                  const locked = isLocked(resource.id);
                  const isOpen = openResource === resource.id && !locked;
                  return (
                    <div key={resource.id} className="flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          setOpenResource(isOpen ? "" : resource.id);
                          setFullscreenItem("");
                        }}
                        className={`flex items-center gap-3 p-4 rounded-lg border border-border transition-colors text-left ${
                          locked ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
                        }`}
                      >
                        <Icon size={22} className="text-[#7e55f6] shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium m-0">
                            {currentModuleIndex + 1}.{resourceIndex + 1} {resource.title}
                          </p>
                          <p className="text-xs text-muted-foreground m-0">{RESOURCE_LABELS[resource.type]}</p>
                        </div>
                        {locked ? (
                          <Lock size={22} className="shrink-0 text-muted-foreground/30" />
                        ) : (
                          <CheckCircle2 size={22} className={`shrink-0 ${done ? "text-green-500" : "text-muted-foreground/30"}`} />
                        )}
                      </button>

                      {isOpen &&
                        (fullscreenItem === resource.id ? (
                          <div className="fixed inset-0 z-[80] bg-background">
                            {resource.type === "video" ? (
                              <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-3 text-white/60">
                                <PlayCircle size={56} strokeWidth={1.5} />
                                <p className="text-sm m-0">Video preview placeholder</p>
                              </div>
                            ) : (
                              <iframe src={SAMPLE_PDF_URL} className="w-full h-full" title={resource.title} />
                            )}
                            <div className="absolute top-0 inset-x-0 h-12 z-10 peer/top hidden md:block" />
                            <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm transition-opacity opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:peer-hover/top:opacity-100 md:peer-hover/top:pointer-events-auto md:hover:opacity-100 md:hover:pointer-events-auto z-20">
                              <p className="text-sm font-medium m-0 truncate">{resource.title}</p>
                              <Button type="button" variant="outline" size="sm" onClick={() => setFullscreenItem("")}>
                                <Minimize2 size={14} />
                                Exit Fullscreen
                              </Button>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-12 z-10 peer/bottom hidden md:block" />
                            <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-end border-t border-border bg-background/95 backdrop-blur-sm transition-opacity opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:peer-hover/bottom:opacity-100 md:peer-hover/bottom:pointer-events-auto md:hover:opacity-100 md:hover:pointer-events-auto z-20">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => toggleItem(resource.id, allItems)}
                                className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                              >
                                {done ? "Mark as Incomplete" : "Mark as Complete"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-border overflow-hidden">
                            {resource.type === "video" ? (
                              <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-2 text-white/60">
                                <PlayCircle size={48} strokeWidth={1.5} />
                                <p className="text-sm m-0">Video preview placeholder</p>
                              </div>
                            ) : (
                              <iframe src={SAMPLE_PDF_URL} className="w-full h-[400px]" title={resource.title} />
                            )}
                            <div className="p-3 flex items-center justify-between border-t border-border">
                              <Button type="button" variant="outline" size="sm" onClick={() => setFullscreenItem(resource.id)}>
                                <Maximize2 size={14} />
                                Fullscreen
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => toggleItem(resource.id, allItems)}
                                className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                              >
                                {done ? "Mark as Incomplete" : "Mark as Complete"}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium m-0">Module Quiz</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isLocked(currentModule.quiz.id)}
                  onClick={() => {
                    setOpenResource(openResource === currentModule.quiz.id ? "" : currentModule.quiz.id);
                    setFullscreenItem("");
                  }}
                  className={`flex items-center gap-3 p-4 rounded-lg border border-border transition-colors text-left w-full ${
                    isLocked(currentModule.quiz.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
                  }`}
                >
                  <HelpCircle size={22} className="text-[#7e55f6] shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium m-0">{currentModule.quiz.title}</p>
                    <p className="text-xs text-muted-foreground m-0">
                      {isLocked(currentModule.quiz.id) ? "Locked" : completed[currentModule.quiz.id] ? "Completed" : "Not attempted"}
                    </p>
                  </div>
                  {isLocked(currentModule.quiz.id) ? (
                    <Lock size={22} className="shrink-0 text-muted-foreground/30" />
                  ) : (
                    <CheckCircle2
                      size={22}
                      className={`shrink-0 ${completed[currentModule.quiz.id] ? "text-green-500" : "text-muted-foreground/30"}`}
                    />
                  )}
                </button>

                {openResource === currentModule.quiz.id && !isLocked(currentModule.quiz.id) && (
                  <div
                    className={
                      fullscreenItem === currentModule.quiz.id
                        ? "fixed inset-0 z-[80] bg-background overflow-y-auto"
                        : "bg-card/50 rounded-xl border border-border mt-2"
                    }
                  >
                    <div
                      className={
                        fullscreenItem === currentModule.quiz.id
                          ? "max-w-3xl mx-auto w-full p-4 sm:p-8 min-h-screen flex flex-col"
                          : "p-4 sm:p-6 flex flex-col"
                      }
                    >
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                        <div>
                          <p className="text-xs font-semibold text-[#7e55f6] uppercase tracking-wider mb-1">Module Quiz</p>
                          <h3 className="text-base font-medium m-0">{currentModule.quiz.title}</h3>
                        </div>
                        {fullscreenItem === currentModule.quiz.id ? (
                          <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full px-3" onClick={() => setFullscreenItem("")}>
                            <Minimize2 size={14} className="mr-1.5" />
                            Exit Fullscreen
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 rounded-full px-3"
                            onClick={() => setFullscreenItem(currentModule.quiz.id)}
                          >
                            <Maximize2 size={14} className="mr-1.5" />
                            Fullscreen
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-6 mb-6">
                        {SAMPLE_QUIZ_QUESTIONS.map((q, qIndex) => {
                          const qKey = `${currentModule.quiz.id}-${q.id}`;
                          const selected = quizAnswers[qKey];
                          const submitted = !!quizSubmitted[currentModule.quiz.id];

                          return (
                            <div key={q.id} className="flex flex-col gap-3">
                              <h4 className="text-sm font-medium m-0 leading-snug">
                                <span className="text-muted-foreground mr-2">{qIndex + 1}.</span>
                                {q.question}
                              </h4>
                              <div className="flex flex-col gap-2 ml-5">
                                {q.options.map((option, oIndex) => {
                                  const isSelected = selected === oIndex;
                                  const isCorrect = oIndex === q.answer;

                                  let style = "border-border bg-muted/20 hover:border-[#7e55f6]/50 hover:bg-muted/40";
                                  let radioStyle = "border-muted-foreground/30";

                                  if (submitted) {
                                    if (isCorrect) {
                                      style = "border-green-500 bg-green-500/10 shadow-[0_0_0_1px_rgba(34,197,94,1)]";
                                      radioStyle = "border-green-500 bg-green-500";
                                    } else if (isSelected) {
                                      style = "border-red-500 bg-red-500/10 shadow-[0_0_0_1px_rgba(239,68,68,1)]";
                                      radioStyle = "border-red-500 bg-red-500";
                                    }
                                  } else if (isSelected) {
                                    style = "border-[#7e55f6] bg-[#7e55f6]/5 shadow-[0_0_0_1px_rgba(126,85,246,1)]";
                                    radioStyle = "border-[#7e55f6]";
                                  }

                                  return (
                                    <button
                                      key={oIndex}
                                      type="button"
                                      disabled={submitted}
                                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [qKey]: oIndex }))}
                                      className={`text-left p-3 rounded-lg border transition-all duration-200 group ${style}`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${radioStyle} ${
                                            !submitted && !isSelected ? "group-hover:border-[#7e55f6]/50" : ""
                                          }`}
                                        >
                                          {isSelected && !submitted && <div className="w-2 h-2 rounded-full bg-[#7e55f6]" />}
                                          {submitted && isCorrect && <CheckCircle2 size={10} className="text-white" />}
                                          {submitted && isSelected && !isCorrect && <X size={10} className="text-white" />}
                                        </div>
                                        <span className={`text-sm ${submitted && isCorrect ? "font-medium" : ""}`}>{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        {quizSubmitted[currentModule.quiz.id] ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 size={18} className="text-green-500" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground m-0">Your Score</p>
                                <p className="text-lg font-bold text-green-500 m-0 leading-none">
                                  {SAMPLE_QUIZ_QUESTIONS.filter((q) => quizAnswers[`${currentModule.quiz.id}-${q.id}`] === q.answer).length}{" "}
                                  <span className="text-sm font-normal text-muted-foreground">/ {SAMPLE_QUIZ_QUESTIONS.length}</span>
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 px-5 rounded-full"
                              onClick={() => {
                                setQuizSubmitted((prev) => ({ ...prev, [currentModule.quiz.id]: false }));
                                setQuizAnswers((prev) => {
                                  const next = { ...prev };
                                  SAMPLE_QUIZ_QUESTIONS.forEach((q) => delete next[`${currentModule.quiz.id}-${q.id}`]);
                                  return next;
                                });
                              }}
                            >
                              Retake Quiz
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground">Answer all questions to submit.</p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setQuizSubmitted((prev) => ({ ...prev, [currentModule.quiz.id]: true }));
                                if (!completed[currentModule.quiz.id]) toggleItem(currentModule.quiz.id, allItems);
                              }}
                              disabled={SAMPLE_QUIZ_QUESTIONS.some((q) => quizAnswers[`${currentModule.quiz.id}-${q.id}`] === undefined)}
                              className="h-9 px-5 rounded-full font-semibold"
                            >
                              Submit Quiz
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!currentModuleComplete}
                onClick={() => {
                  setActiveModule(nextDestination.id);
                  if (nextDestination.id !== WRITTEN_EXAM_VIEW) setExpandedModule(nextDestination.id);
                }}
                className="bg-[#7e55f6] hover:bg-[#6742d4] text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                {nextDestination.label}
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        ) : showWrittenExam ? (
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border bg-card/50">
              <div>
                <p className="text-xs font-semibold text-[#7e55f6] uppercase tracking-wider mb-1">Programme-End</p>
                <CardTitle className="text-xl font-medium m-0">Written Exam</CardTitle>
                <CardDescription className="mt-1">
                  Answer all questions in your own words. Your instructor will review and grade your responses.
                </CardDescription>
              </div>
              {writtenSubmitted ? (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium px-3 py-1.5">
                  <CheckCircle2 size={14} /> Submitted
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center rounded-full bg-[#7e55f6]/10 text-[#7e55f6] text-xs font-medium px-3 py-1.5">
                  Not submitted
                </span>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {SAMPLE_WRITTEN_QUESTIONS.map((q, i) => (
                <div key={q.id} className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl border border-border/60 bg-muted/20">
                  <div className="flex items-start gap-3">
                    <span className="size-6 shrink-0 rounded-md bg-[#7e55f6]/10 text-[#7e55f6] text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h4 className="text-base font-medium m-0 leading-snug text-foreground">{q.question}</h4>
                  </div>
                  <Textarea
                    value={writtenAnswers[q.id] ?? ""}
                    disabled={writtenSubmitted}
                    onChange={(e) => setWrittenAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Write your answer here"
                    className="min-h-[130px] resize-y bg-background text-[15px] leading-relaxed p-3 disabled:opacity-100"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 border-t border-border pt-4 mt-1">
                {writtenSubmitted ? (
                  <>
                    <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <CheckCircle2 size={16} /> Submitted for review
                    </span>
                    <Button type="button" variant="outline" size="sm" className="rounded-full px-5" onClick={() => setWrittenSubmitted(false)}>
                      Edit answers
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground m-0">Answer every question to submit.</p>
                    <Button
                      type="button"
                      disabled={SAMPLE_WRITTEN_QUESTIONS.some((q) => !(writtenAnswers[q.id] ?? "").trim())}
                      onClick={() => setWrittenSubmitted(true)}
                      className="h-9 px-6 rounded-full font-semibold bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                    >
                      Submit Exam
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {programme.modules.map((module, moduleIndex) => {
              const percent = moduleCompletionPercent(module);
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => {
                    setActiveModule(module.id);
                    setExpandedModule(module.id);
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="size-10 rounded-lg bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center font-medium shrink-0">
                    {moduleIndex + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium m-0 truncate">{module.title}</p>
                    <p className="text-xs text-muted-foreground m-0 mt-1">
                      {moduleCompletedCount(module)} / {moduleItemCount(module)} completed
                    </p>
                    <Progress value={percent} className="mt-2" />
                  </div>
                  {percent === 100 ? (
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="text-muted-foreground/40 shrink-0" />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveModule(WRITTEN_EXAM_VIEW)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card text-left hover:bg-muted/50 transition-colors"
            >
              <span className="size-10 rounded-lg bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center shrink-0">
                <FileText size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium m-0 truncate">Written Exam</p>
                <p className="text-xs text-muted-foreground m-0 mt-1">
                  {writtenSubmitted ? "Submitted for review" : "Programme-end written exam"}
                </p>
              </div>
              {writtenSubmitted ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              ) : (
                <ChevronRight size={18} className="text-muted-foreground/40 shrink-0" />
              )}
            </button>
          </div>
        )}
      </div>
    </PlaceholderGuard>
  );
}

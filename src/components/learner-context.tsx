"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useUser } from "@/hooks/use-current-user";

type ResourceType = "video" | "pdf";

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
}

export interface Quiz {
  id: string;
  title: string;
  score: number | null;
}

export interface Module {
  id: string;
  title: string;
  resources: Resource[];
  quiz: Quiz;
}

export interface LearnerProgramme {
  id: string;
  title: string;
  description: string;
  instructorIds?: string[];
  roles?: string[];
  modules: Module[];
}

export interface LearnerDashboardConfig {
  portalName: string;
  basePath: string;
  settingsPath: string;
  messagesPath: string;
  progressKeyPrefix: string;
  showCertificate: boolean;
  programmes: LearnerProgramme[];
  renderProgrammeSwitcherExtra?: (programme: LearnerProgramme) => ReactNode;
}

export const CERTIFICATE_VIEW = "certificate";
export const GRADE_VIEW = "grade";
export const WRITTEN_EXAM_VIEW = "written-exam";

export const SAMPLE_QUIZ_QUESTIONS: { id: string; question: string; options: string[]; answer: number }[] = [
  {
    id: "q1",
    question: "What is the primary purpose of due diligence in a deal?",
    options: ["To negotiate price", "To verify facts and assess risk", "To sign the contract", "To market the deal"],
    answer: 1,
  },
  {
    id: "q2",
    question: "Which of these is a common valuation method?",
    options: ["Discounted Cash Flow (DCF)", "Search Engine Optimization", "Inventory Turnover", "Net Promoter Score"],
    answer: 0,
  },
  {
    id: "q3",
    question: "A term sheet is best described as:",
    options: ["A final binding contract", "A non-binding outline of key deal terms", "A tax filing document", "A marketing brochure"],
    answer: 1,
  },
];

export const SAMPLE_WRITTEN_QUESTIONS: { id: string; question: string }[] = [
  { id: "w1", question: "Walk through how you would value a target company for an acquisition. Which methods would you prioritise and why?" },
  { id: "w2", question: "Describe a situation where due diligence findings would lead you to renegotiate or walk away from a deal." },
  { id: "w3", question: "Explain how deal structure (cash vs. stock, earn-outs, etc.) affects both buyer and seller incentives." },
];

export function gradeLetter(percent: number): string {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

interface LearnerContextValue {
  config: LearnerDashboardConfig;
  user: string;
  activeProgramme: string;
  setActiveProgramme: (id: string) => void;
  activeModule: string;
  setActiveModule: (id: string) => void;
  expandedModule: string;
  setExpandedModule: (id: string) => void;
  openResource: string;
  setOpenResource: (id: string) => void;
  completed: Record<string, boolean>;
  toggleItem: (itemId: string, allItems: string[]) => void;
  quizAnswers: Record<string, number>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  quizSubmitted: Record<string, boolean>;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  fullscreenItem: string;
  setFullscreenItem: (id: string) => void;
  writtenAnswers: Record<string, string>;
  setWrittenAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  writtenSubmitted: boolean;
  setWrittenSubmitted: (v: boolean) => void;
  programme: LearnerProgramme;
  allItems: string[];
  isLocked: (itemId: string) => boolean;
  moduleItemCount: (m: Module) => number;
  moduleCompletedCount: (m: Module) => number;
  moduleCompletionPercent: (m: Module) => number;
  programmeCompletionPercent: number;
  isComplete: boolean;
  moduleGrade: (m: Module) => number | null;
  programmeHasGrade: boolean;
  programmeGradePercent: number;
  handleProgrammeChange: (programmeId: string) => void;
}

const LearnerContext = createContext<LearnerContextValue | null>(null);

export function useLearner(): LearnerContextValue {
  const ctx = useContext(LearnerContext);
  if (!ctx) throw new Error("useLearner must be used within a LearnerProvider");
  return ctx;
}

export function LearnerProvider({ config, children }: { config: LearnerDashboardConfig; children: ReactNode }) {
  const { progressKeyPrefix, programmes: PROGRAMMES } = config;

  const { user: session } = useUser();
  const user = session?.userId ?? null;

  const [completedState, setCompleted] = useState<Record<string, boolean> | null>(null);
  const [activeProgramme, setActiveProgramme] = useState<string>(PROGRAMMES[0]?.id ?? "");
  const [activeModule, setActiveModule] = useState<string>(PROGRAMMES[0]?.modules[0]?.id ?? "");
  const [expandedModule, setExpandedModule] = useState<string>(PROGRAMMES[0]?.modules[0]?.id ?? "");
  const [openResource, setOpenResource] = useState<string>("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [fullscreenItem, setFullscreenItem] = useState<string>("");
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [writtenSubmitted, setWrittenSubmitted] = useState(false);

  const storedCompleted = useMemo<Record<string, boolean>>(() => {
    if (!user) return {};
    try {
      return JSON.parse(localStorage.getItem(progressKeyPrefix + user) ?? "{}");
    } catch {
      return {};
    }
  }, [user, progressKeyPrefix]);
  const completed = completedState ?? storedCompleted;

  const toggleItem = (itemId: string, allItems: string[]) => {
    if (!user) return;
    const updated = { ...completed };
    const wasCompleted = !!updated[itemId];
    if (wasCompleted) {
      const idx = allItems.indexOf(itemId);
      allItems.forEach((id, i) => {
        if (i >= idx) delete updated[id];
      });
    } else {
      updated[itemId] = true;
    }
    setCompleted(updated);
    localStorage.setItem(progressKeyPrefix + user, JSON.stringify(updated));
  };

  const handleProgrammeChange = (programmeId: string) => {
    setActiveProgramme(programmeId);
    const p = PROGRAMMES.find((pr) => pr.id === programmeId);
    setActiveModule(p?.modules[0]?.id ?? "");
  };

  if (!user) return null;

  const programme = PROGRAMMES.find((p) => p.id === activeProgramme) ?? PROGRAMMES[0];

  const allItems: string[] = programme.modules.flatMap((m) => [...m.resources.map((r) => r.id), m.quiz.id]);
  const firstIncompleteIndex = allItems.findIndex((id) => !completed[id]);
  const isLocked = (itemId: string) => {
    if (firstIncompleteIndex === -1) return false;
    return allItems.indexOf(itemId) > firstIncompleteIndex;
  };

  const moduleItemCount = (m: Module) => m.resources.length + 1;
  const moduleCompletedCount = (m: Module) =>
    m.resources.filter((r) => completed[r.id]).length + (completed[m.quiz.id] ? 1 : 0);
  const moduleCompletionPercent = (m: Module) => Math.round((moduleCompletedCount(m) / moduleItemCount(m)) * 100);

  const totalItems = programme.modules.reduce((sum, m) => sum + moduleItemCount(m), 0);
  const totalCompleted = programme.modules.reduce((sum, m) => sum + moduleCompletedCount(m), 0);
  const programmeCompletionPercent = totalItems === 0 ? 0 : Math.round((totalCompleted / totalItems) * 100);
  const isComplete = totalCompleted === totalItems;

  const moduleGrade = (m: Module): number | null => {
    if (!quizSubmitted[m.quiz.id]) return null;
    const correct = SAMPLE_QUIZ_QUESTIONS.filter((q) => quizAnswers[`${m.quiz.id}-${q.id}`] === q.answer).length;
    return Math.round((correct / SAMPLE_QUIZ_QUESTIONS.length) * 100);
  };

  const gradedModules = programme.modules.filter((m) => quizSubmitted[m.quiz.id]);
  const programmeHasGrade = gradedModules.length > 0;
  const programmeGradePercent = programmeHasGrade
    ? Math.round(gradedModules.reduce((sum, m) => sum + (moduleGrade(m) ?? 0), 0) / gradedModules.length)
    : 0;

  return (
    <LearnerContext.Provider
      value={{
        config,
        user,
        activeProgramme,
        setActiveProgramme,
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
        programme,
        allItems,
        isLocked,
        moduleItemCount,
        moduleCompletedCount,
        moduleCompletionPercent,
        programmeCompletionPercent,
        isComplete,
        moduleGrade,
        programmeHasGrade,
        programmeGradePercent,
        handleProgrammeChange,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
}

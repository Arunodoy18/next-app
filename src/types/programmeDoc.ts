export const ASSIGNABLE_ROLES = [
  "Consultant",
  "Instructor",
  "Human Resources",
  "Project Management",
  "Business Development",
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export type ResourceType = "video" | "pdf" | "link" | "quiz";

export interface McqQuestion {
  mcqId: string;
  question: string;
  options: string[];
  answer: number;
}

export interface LessonItem {
  resourceId: string;
  type: "video" | "pdf" | "link";
  title: string;
  url: string;
}

export interface QuizItem {
  resourceId: string;
  type: "quiz";
  title: string;
  questions: McqQuestion[];
}

export type ModuleItem = LessonItem | QuizItem;

export interface ProgrammeModule {
  moduleId: string;
  title: string;
  items: ModuleItem[];
}

export interface WrittenQuestion {
  questionId: string;
  question: string;
}

export interface Programme {
  _id?: string;
  programmeId: string;
  name: string;
  description?: string;
  instructorIds?: string[];
  modules: ProgrammeModule[];
  writtenTest: WrittenQuestion[];
  roles: AssignableRole[];
  isInternal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

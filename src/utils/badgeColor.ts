import type { UserRole } from "@/lib/mock-data";

export const roleBadgeColor: Record<UserRole, string> = {
  Student: "bg-stone-100 text-stone-800 dark:bg-stone-700/50 dark:text-stone-100",
  Instructor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Admin: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  "Business Development": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Human Resources": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  "Project Management": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export const verificationBadgeColor: Record<"pending" | "complete", string> = {
  complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

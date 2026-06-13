"use client";

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import {
  PROGRAMMES,
  USERS,
  STUDENTS,
  THREADS,
  type Programme,
  type AppUser,
  type StudentRecord,
  type MessageThread,
} from "@/lib/mock-data";

/**
 * In-memory store shared across portal pages so edits survive navigation
 * within a session. Frontend-only prototype, no persistence.
 */
interface PortalStore {
  programmes: Programme[];
  setProgrammes: Dispatch<SetStateAction<Programme[]>>;
  users: AppUser[];
  setUsers: Dispatch<SetStateAction<AppUser[]>>;
  students: StudentRecord[];
  setStudents: Dispatch<SetStateAction<StudentRecord[]>>;
  threads: MessageThread[];
  setThreads: Dispatch<SetStateAction<MessageThread[]>>;
}

const PortalStoreContext = createContext<PortalStore | null>(null);

export function PortalStoreProvider({ children }: { children: ReactNode }) {
  const [programmes, setProgrammes] = useState<Programme[]>(PROGRAMMES);
  const [users, setUsers] = useState<AppUser[]>(USERS);
  const [students, setStudents] = useState<StudentRecord[]>(STUDENTS);
  const [threads, setThreads] = useState<MessageThread[]>(THREADS);

  return (
    <PortalStoreContext.Provider
      value={{ programmes, setProgrammes, users, setUsers, students, setStudents, threads, setThreads }}
    >
      {children}
    </PortalStoreContext.Provider>
  );
}

export function usePortalStore(): PortalStore {
  const ctx = useContext(PortalStoreContext);
  if (!ctx) throw new Error("usePortalStore must be used within PortalStoreProvider");
  return ctx;
}

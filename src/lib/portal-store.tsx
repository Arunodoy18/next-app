// remov1234
"use client";

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import {
  PROGRAMMES,
  USERS,
  CONSULTANTS,
  THREADS,
  INTERNAL_PROGRAMMES,
  INTERNAL_CONSULTANTS,
  INTERNAL_THREADS,
  type Programme,
  type AppUser,
  type ConsultantRecord,
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
  consultants: ConsultantRecord[];
  setConsultants: Dispatch<SetStateAction<ConsultantRecord[]>>;
  threads: MessageThread[];
  setThreads: Dispatch<SetStateAction<MessageThread[]>>;
  // Blackmont Internal, instructor-only training track (separate dataset).
  internalProgrammes: Programme[];
  setInternalProgrammes: Dispatch<SetStateAction<Programme[]>>;
  internalConsultants: ConsultantRecord[];
  setInternalConsultants: Dispatch<SetStateAction<ConsultantRecord[]>>;
  internalThreads: MessageThread[];
  setInternalThreads: Dispatch<SetStateAction<MessageThread[]>>;
}

const PortalStoreContext = createContext<PortalStore | null>(null);

export function PortalStoreProvider({ children }: { children: ReactNode }) {
  const [programmes, setProgrammes] = useState<Programme[]>(PROGRAMMES);
  const [users, setUsers] = useState<AppUser[]>(USERS);
  const [consultants, setConsultants] = useState<ConsultantRecord[]>(CONSULTANTS);
  const [threads, setThreads] = useState<MessageThread[]>(THREADS);
  const [internalProgrammes, setInternalProgrammes] = useState<Programme[]>(INTERNAL_PROGRAMMES);
  const [internalConsultants, setInternalConsultants] = useState<ConsultantRecord[]>(INTERNAL_CONSULTANTS);
  const [internalThreads, setInternalThreads] = useState<MessageThread[]>(INTERNAL_THREADS);

  return (
    <PortalStoreContext.Provider
      value={{
        programmes,
        setProgrammes,
        users,
        setUsers,
        consultants,
        setConsultants,
        threads,
        setThreads,
        internalProgrammes,
        setInternalProgrammes,
        internalConsultants,
        setInternalConsultants,
        internalThreads,
        setInternalThreads,
      }}
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

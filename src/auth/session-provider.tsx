"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthRole } from "@/types/userDoc";

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: AuthRole;
}

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({ value, children }: { value: SessionUser | null; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

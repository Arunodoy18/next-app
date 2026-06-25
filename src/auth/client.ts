import type { AuthRole } from "@/types/userDoc";

export type { AuthRole };

type Session = { userId: string; name: string; username: string; email: string; role: AuthRole } | null;

let sessionCache: Session | undefined;

export async function getSession(): Promise<Session> {
  if (sessionCache !== undefined) return sessionCache;
  const res = await fetch("/api/auth/me");
  const data = await res.json();
  sessionCache = data.session as Session;
  return sessionCache;
}

export async function logout() {
  sessionCache = undefined;
  await fetch("/api/auth/logout", { method: "POST" });
}

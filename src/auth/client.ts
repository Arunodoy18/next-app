import type { AuthRole } from "@/types/userDoc";

export type { AuthRole };

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getSession() {
  const res = await fetch("/api/auth/me");
  const data = await res.json();
  return data.session as { userId: string; name: string; username: string; email: string; role: AuthRole } | null;
}

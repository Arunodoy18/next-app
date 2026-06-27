"use client";

import { useSession } from "@/auth/session-provider";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const single = parts[0] || "";
  return single.length >= 2
    ? single[0].toUpperCase() + single[1].toLowerCase()
    : single.toUpperCase();
}

export function useUser() {
  const user = useSession();

  return {
    user,
    initials: user ? getInitials(user.name) : "",
    displayName: user?.name ?? "",
  };
}

// REVW
"use client";

import type { ReactNode } from "react";
import PortalShell, { type PortalNavItem } from "@/components/layout/portal-shell";
import { PortalStoreProvider, usePortalStore } from "@/lib/portal-store";
import { useUser } from "@/hooks/use-current-user";
import { LayoutDashboard, GraduationCap, TrendingUp, Users } from "lucide-react";

function AdminShell({ children }: { children: ReactNode }) {
  const { consultants } = usePortalStore();
  const { initials, displayName } = useUser();
  const pendingAnswers = consultants.reduce(
    (acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length,
    0
  );

  const items: PortalNavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/programmes", label: "Programmes", icon: GraduationCap },
    { href: "/admin/performance", label: "Performance", icon: TrendingUp, badge: pendingAnswers },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <PortalShell
      title="Admin Portal"
      portalName="Admin"
      items={items}
      basePath="/admin"
      userLabel={displayName}
      userInitials={initials}
    >
      {children}
    </PortalShell>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PortalStoreProvider>
      <AdminShell>{children}</AdminShell>
    </PortalStoreProvider>
  );
}

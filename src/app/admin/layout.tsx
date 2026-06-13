"use client";

import type { ReactNode } from "react";
import PortalShell, { type PortalNavItem } from "@/components/portal-shell";
import { PortalStoreProvider, usePortalStore } from "@/lib/portal-store";
import { LayoutDashboard, GraduationCap, TrendingUp, Users } from "lucide-react";

function AdminShell({ children }: { children: ReactNode }) {
  const { students } = usePortalStore();
  const pendingAnswers = students.reduce(
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
      userLabel="Admin User"
      userInitials="AD"
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

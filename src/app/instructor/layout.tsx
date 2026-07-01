// REVW
"use client";

import type { ReactNode } from "react";
import PortalShell, { type PortalNavItem } from "@/components/layout/portal-shell";
import { PortalStoreProvider, usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { useUser } from "@/hooks/use-current-user";
import { LayoutDashboard, Users, ClipboardCheck, MessageSquare } from "lucide-react";

function InstructorShell({ children }: { children: ReactNode }) {
  const { consultants, threads } = usePortalStore();
  const { initials, displayName } = useUser();
  const myConsultants = consultants.filter((s) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId));
  const pendingConsultants = myConsultants.filter((s) => s.writtenAnswers.some((a) => a.score === null)).length;
  const unread = threads.filter(
    (t) => t.unread && CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(t.programmeId)
  ).length;

  const items: PortalNavItem[] = [
    { href: "/instructor", label: "Overview", icon: LayoutDashboard },
    { href: "/instructor/consultants", label: "Consultants", icon: Users },
    { href: "/instructor/evaluations", label: "Evaluations", icon: ClipboardCheck, badge: pendingConsultants },
    { href: "/instructor/messages", label: "Messages", icon: MessageSquare, badge: unread },
  ];

  return (
    <PortalShell
      title="Instructor Portal"
      portalName="Instructor"
      items={items}
      basePath="/instructor"
      userLabel={displayName}
      userInitials={initials}
      crossPortalLink={{ href: "/internal", label: "Access Academy" }}
    >
      {children}
    </PortalShell>
  );
}

export default function InstructorLayout({ children }: { children: ReactNode }) {
  return (
    <PortalStoreProvider>
      <InstructorShell>{children}</InstructorShell>
    </PortalStoreProvider>
  );
}

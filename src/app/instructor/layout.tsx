"use client";

import type { ReactNode } from "react";
import PortalShell, { type PortalNavItem } from "@/components/portal-shell";
import { PortalStoreProvider, usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { LayoutDashboard, Users, ClipboardCheck, MessageSquare } from "lucide-react";

const INITIALS = CURRENT_INSTRUCTOR.name
  .split(" ")
  .map((w) => w[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

function InstructorShell({ children }: { children: ReactNode }) {
  const { students, threads } = usePortalStore();
  const myStudents = students.filter((s) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId));
  const pendingStudents = myStudents.filter((s) => s.writtenAnswers.some((a) => a.score === null)).length;
  const unread = threads.filter(
    (t) => t.unread && CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(t.programmeId)
  ).length;

  const items: PortalNavItem[] = [
    { href: "/instructor", label: "Overview", icon: LayoutDashboard },
    { href: "/instructor/students", label: "Students", icon: Users },
    { href: "/instructor/evaluations", label: "Evaluations", icon: ClipboardCheck, badge: pendingStudents },
    { href: "/instructor/messages", label: "Messages", icon: MessageSquare, badge: unread },
  ];

  return (
    <PortalShell
      title="Instructor Portal"
      portalName="Instructor"
      items={items}
      basePath="/instructor"
      userLabel={CURRENT_INSTRUCTOR.name}
      userInitials={INITIALS}
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

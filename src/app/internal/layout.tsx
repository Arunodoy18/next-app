"use client";

import type { ReactNode } from "react";
import { PortalStoreProvider } from "@/lib/portal-store";
import PortalShell from "@/components/layout/portal-shell";
import { LearnerProvider, type LearnerProgramme } from "@/components/learner-context";
import { LearnerSidebarContent, LearnerSidebarFooter } from "@/components/learner-sidebar";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-current-user";
import { INTERNAL_PROGRAMMES } from "@/lib/mock-data";
import { ROLE_BADGE } from "@/utils/badgeColor";

const PROGRAMMES: LearnerProgramme[] = INTERNAL_PROGRAMMES.map((p) => ({
  id: p.id,
  title: p.name,
  description: p.description,
  instructorIds: p.instructorIds,
  roles: p.roles ?? [],
  modules: p.modules.map((m) => {
    const quizItem = m.items.find((it) => it.type === "quiz");
    return {
      id: m.id,
      title: m.title,
      resources: m.items.flatMap((it) =>
        it.type === "video" || it.type === "pdf" ? [{ id: it.id, type: it.type as "video" | "pdf", title: it.title }] : []
      ),
      quiz: { id: quizItem?.id ?? `${m.id}-q`, title: quizItem?.title ?? "Module Quiz", score: null },
    };
  }),
}));

const CONFIG = {
  portalName: "Internal",
  basePath: "/internal",
  settingsPath: "/internal/settings",
  messagesPath: "/internal/messages",
  progressKeyPrefix: "internal-programme-progress-",
  showCertificate: false,
  programmes: PROGRAMMES,
  renderProgrammeSwitcherExtra: (programme: LearnerProgramme) =>
    programme.roles && programme.roles.length > 0 ? (
      <div className="flex items-center gap-1.5 flex-wrap">
        {programme.roles.map((r) => (
          <Badge key={r} className={`align-middle ${ROLE_BADGE[r as keyof typeof ROLE_BADGE]}`}>{r}</Badge>
        ))}
      </div>
    ) : null,
};

function InternalShell({ children }: { children: ReactNode }) {
  const { initials, displayName } = useUser();

  return (
    <LearnerProvider config={CONFIG}>
      <PortalShell
        portalName="Internal"
        basePath="/internal"
        userLabel={displayName}
        userInitials={initials}
        sidebarContent={(close) => <LearnerSidebarContent closeSidebar={close} />}
        sidebarFooter={(close) => <LearnerSidebarFooter closeSidebar={close} />}
      >
        {children}
      </PortalShell>
    </LearnerProvider>
  );
}

export default function InternalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalStoreProvider>
      <InternalShell>{children}</InternalShell>
    </PortalStoreProvider>
  );
}

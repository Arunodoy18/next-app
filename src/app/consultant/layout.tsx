"use client";

import type { ReactNode } from "react";
import { PortalStoreProvider } from "@/lib/portal-store";
import PortalShell from "@/components/layout/portal-shell";
import { LearnerProvider, type LearnerProgramme } from "@/components/learner-context";
import { LearnerSidebarContent, LearnerSidebarFooter } from "@/components/learner-sidebar";
import { useUser } from "@/hooks/use-current-user";

const PROGRAMMES: LearnerProgramme[] = [
  {
    id: "p1",
    title: "Mergers & Acquisitions Consulting",
    description: "Advisory frameworks, valuation techniques, and deal execution for M&A consultants.",
    modules: [
      {
        id: "p1-m1",
        title: "Deal Sourcing & Due Diligence",
        resources: [
          { id: "p1-m1-v1", type: "video", title: "Sourcing Strategies for Acquirers" },
          { id: "p1-m1-p1", type: "pdf", title: "Due Diligence Checklist" },
        ],
        quiz: { id: "p1-m1-q", title: "Due Diligence Quiz", score: null },
      },
      {
        id: "p1-m2",
        title: "Valuation Methods",
        resources: [
          { id: "p1-m2-v1", type: "video", title: "DCF & Comparable Company Analysis" },
          { id: "p1-m2-p1", type: "pdf", title: "Valuation Models Reference" },
        ],
        quiz: { id: "p1-m2-q", title: "Valuation Quiz", score: null },
      },
      {
        id: "p1-m3",
        title: "Deal Structuring & Negotiation",
        resources: [
          { id: "p1-m3-v1", type: "video", title: "Structuring the Term Sheet" },
          { id: "p1-m3-p1", type: "pdf", title: "Negotiation Playbook" },
        ],
        quiz: { id: "p1-m3-q", title: "Deal Structuring Quiz", score: null },
      },
    ],
  },
  {
    id: "p2",
    title: "Private Equity Fundamentals",
    description: "Fund structures, portfolio strategy, and value creation for private equity professionals.",
    modules: [
      {
        id: "p2-m1",
        title: "Fund Structures & LP Relations",
        resources: [
          { id: "p2-m1-v1", type: "video", title: "Understanding Fund Structures" },
          { id: "p2-m1-p1", type: "pdf", title: "LP Agreement Essentials" },
        ],
        quiz: { id: "p2-m1-q", title: "Fund Structures Quiz", score: null },
      },
      {
        id: "p2-m2",
        title: "Portfolio Value Creation",
        resources: [
          { id: "p2-m2-v1", type: "video", title: "Operational Improvement Levers" },
          { id: "p2-m2-p1", type: "pdf", title: "Value Creation Playbook" },
        ],
        quiz: { id: "p2-m2-q", title: "Value Creation Quiz", score: null },
      },
    ],
  },
];

const CONFIG = {
  portalName: "Academy",
  basePath: "/consultant",
  settingsPath: "/consultant/settings",
  messagesPath: "/consultant/messages",
  progressKeyPrefix: "programme-progress-",
  showCertificate: true,
  programmes: PROGRAMMES,
} as const;

function ConsultantShell({ children }: { children: ReactNode }) {
  const { initials, displayName } = useUser();

  return (
    <LearnerProvider config={CONFIG}>
      <PortalShell
        portalName="Academy"
        basePath="/consultant"
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

export default function ConsultantLayout({ children }: { children: ReactNode }) {
  return (
    <PortalStoreProvider>
      <ConsultantShell>{children}</ConsultantShell>
    </PortalStoreProvider>
  );
}

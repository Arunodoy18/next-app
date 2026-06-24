import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortalStoreProvider } from "@/lib/portal-store";

export const metadata: Metadata = {
  title: "Student Dashboard",
};

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <PortalStoreProvider>
      {children}
    </PortalStoreProvider>
  );
}

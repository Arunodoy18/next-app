import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortalStoreProvider } from "@/lib/portal-store";

export const metadata: Metadata = {
  title: "Internal Dashboard",
};

export default function InternalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalStoreProvider>
      {children}
    </PortalStoreProvider>
  );
}

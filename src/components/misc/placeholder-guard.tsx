"use client";

import { usePlaceholder } from "@/components/misc/use-placeholder";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import type { ReactNode } from "react";

export default function PlaceholderGuard({ children }: { children: ReactNode }) {
  const { show } = usePlaceholder();

  if (!show) {
    return (
      <div className="flex items-center justify-center py-32">
        <Card className="max-w-sm w-full shadow-sm">
          <CardContent className="flex flex-col items-center text-center gap-4 py-10">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <Construction size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground m-0">This section is under development</p>
              <p className="text-xs text-muted-foreground mt-2 m-0 leading-relaxed">
                Live data is not connected yet. You can turn on placeholder data from the superuser menu to preview this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

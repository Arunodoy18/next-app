"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

export interface PreviewTarget {
  type: "video" | "pdf" | "link";
  title: string;
  url: string;
}

export default function ResourcePreviewDialog({
  target,
  onClose,
}: {
  target: PreviewTarget | null;
  onClose: () => void;
}) {
  // Keep the last target rendered so content survives the close animation.
  const [view, setView] = useState<PreviewTarget | null>(target);
  if (target && target !== view) setView(target);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        {view && (
          <>
            <DialogHeader>
              <DialogTitle>{view.title || `Untitled ${view.type}`}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span className="truncate font-mono text-xs">{view.url}</span>
                <Button
                  variant="outline"
                  size="xs"
                  className="shrink-0"
                  onClick={() => window.open(view.url, "_blank", "noopener")}
                >
                  <ExternalLink size={12} /> Open in new tab
                </Button>
              </DialogDescription>
            </DialogHeader>

            {view.url ? (
              <iframe
                src={view.url}
                title={view.title}
                allowFullScreen
                className={`w-full rounded-lg border border-border bg-muted/30 ${
                  view.type === "video" ? "aspect-video" : "h-[65vh]"
                }`}
              />
            ) : (
              <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                No URL set yet. Add a link to this {view.type} to preview it.
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

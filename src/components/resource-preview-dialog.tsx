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

function getEmbedUrl(url: string, type: string) {
  if (!url) return "";
  if (type === "video" && url.includes("youtube.com/watch")) {
    try {
      const v = new URL(url).searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch (e) {}
  }
  if (type === "pdf") {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
}

export interface PreviewTarget {
  type: "video" | "pdf" | "link";
  title: string;
  url: string;
}

function vimeoEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/(^|\.)vimeo\.com$/.test(parsed.hostname)) return null;

  // All videos are public, so no privacy hash to carry over.
  const match = parsed.pathname.match(/\/(?:video\/)?(\d+)/);
  if (!match) return null;
  return `https://player.vimeo.com/video/${match[1]}`;
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
      <DialogContent className="max-h-[90vh] overflow-y-auto overscroll-contain sm:max-w-3xl">
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

            {(() => {
              if (!view.url) {
                return (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                    No URL set yet. Add a link to this {view.type} to preview it.
                  </div>
                );
              }

              // Apply existing vimeo logic, then fallback to getEmbedUrl (which handles youtube/pdf)
              const vimeoUrl = view.type === "video" ? vimeoEmbedUrl(view.url) : null;
              const embedUrl = vimeoUrl ?? getEmbedUrl(view.url, view.type);

              return (
                <iframe
                  src={embedUrl}
                  title={view.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className={`w-full max-h-[calc(90vh-7rem)] rounded-lg border border-border bg-muted/30 ${
                    view.type === "video" ? "aspect-video" : "h-[65vh]"
                  }`}
                />
              );
            })()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

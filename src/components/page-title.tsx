"use client";

import { useEffect } from "react";

// The portals are fully client-rendered behind a localStorage auth gate, so
// per-page titles are set at runtime rather than via server `metadata`. Keeps
// the browser tab title in sync with the current page's slug.
export default function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} · Blackmont Academy`;
  }, [title]);
  return null;
}

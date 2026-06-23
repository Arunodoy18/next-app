"use client";

import { createContext, useContext, useState, useSyncExternalStore, useCallback, type ReactNode } from "react";

function getSnapshot() {
  return localStorage.getItem("placeholder-mode") === "true";
}

function getServerSnapshot() {
  return false;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

const PlaceholderContext = createContext({ show: false, toggle: () => {} });

export function PlaceholderProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [show, setShow] = useState(stored);

  const toggle = useCallback(() => {
    const next = !show;
    setShow(next);
    localStorage.setItem("placeholder-mode", String(next));
  }, [show]);

  return (
    <PlaceholderContext.Provider value={{ show, toggle }}>
      {children}
    </PlaceholderContext.Provider>
  );
}

export function usePlaceholder() {
  return useContext(PlaceholderContext);
}

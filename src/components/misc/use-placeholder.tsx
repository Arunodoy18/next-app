"use client";

import { createContext, useContext, useCallback, useSyncExternalStore, type ReactNode } from "react";

let localListeners: (() => void)[] = [];

function emitChange() {
  for (const l of localListeners) l();
}

function subscribe(cb: () => void) {
  localListeners.push(cb);
  window.addEventListener("storage", cb);
  return () => {
    localListeners = localListeners.filter((l) => l !== cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot() {
  return localStorage.getItem("placeholder-mode") === "true";
}

function getServerSnapshot() {
  return false;
}

const PlaceholderContext = createContext({ show: false, toggle: () => {} });

export function PlaceholderProvider({ children }: { children: ReactNode }) {
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    localStorage.setItem("placeholder-mode", String(!getSnapshot()));
    emitChange();
  }, []);

  return (
    <PlaceholderContext.Provider value={{ show, toggle }}>
      {children}
    </PlaceholderContext.Provider>
  );
}

export function usePlaceholder() {
  return useContext(PlaceholderContext);
}

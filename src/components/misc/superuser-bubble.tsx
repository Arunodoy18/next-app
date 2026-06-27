"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, X, ArrowRight } from "lucide-react";
import { ROLE_BADGE } from "@/utils/badgeColor";
import { usePlaceholder } from "@/components/misc/use-placeholder";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { role: "Admin", home: "/admin" },
  { role: "Instructor", home: "/instructor" },
  { role: "Student", home: "/student" },
  { role: "Human Resources", home: "/internal" },
  { role: "Business Development", home: "/internal" },
  { role: "Project Management", home: "/internal" },
] as const;

type DbUser = { userId: string; role: string };

export default function SuperuserBubble() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const { show: showPlaceholder, toggle: togglePlaceholder } = usePlaceholder();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/auth/superuser")
      .then((r) => r.ok ? r.json() : [])
      .then(setDbUsers)
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const login = async (entry: (typeof ROLES)[number]) => {
    const dbUser = dbUsers.find((u) => u.role === entry.role);
    if (!dbUser) {
      alert(`No ${entry.role} user found in database`);
      return;
    }
    setLoading(dbUser.userId);
    try {
      const res = await fetch("/api/auth/superuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: dbUser.userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpen(false);
        router.push(data.home || entry.home);
      } else {
        alert(`Login failed for ${entry.role}`);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-[9999]">
      {open && (
        <div className="absolute bottom-14 right-0 w-80 rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <span className="text-sm font-medium">Superuser Access</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-col p-2 max-h-[70vh] overflow-y-auto">
            {ROLES.map((entry) => {
              const dbUser = dbUsers.find((u) => u.role === entry.role);
              return (
                <button
                  key={entry.role}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => login(entry)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left w-full disabled:opacity-50"
                >
                  <Badge className={ROLE_BADGE[entry.role as keyof typeof ROLE_BADGE]}>
                    {entry.role}
                  </Badge>
                  <span className="flex-1" />
                  {loading === dbUser?.userId ? (
                    <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">Login <ArrowRight size={12} /></span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Placeholder Data</span>
            <Switch checked={showPlaceholder} onCheckedChange={togglePlaceholder} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-11 w-11 rounded-full bg-[#7e55f6] hover:bg-[#6742d4] text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="Superuser Access"
      >
        <KeyRound size={18} />
      </button>
    </div>
  );
}

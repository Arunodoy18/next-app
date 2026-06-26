"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, X, Eye, EyeOff, ArrowRight } from "lucide-react";
import { roleBadgeColor } from "@/utils/badgeColor";
import { usePlaceholder } from "@/components/misc/use-placeholder";
import { Switch } from "@/components/ui/switch";

const CREDS = [
  { username: "admin", password: "admin123", role: "Admin", home: "/admin" },
  { username: "instructor", password: "instructor123", role: "Instructor", home: "/instructor" },
  { username: "student", password: "student123", role: "Student", home: "/student" },
  { username: "hr", password: "hr123", role: "Human Resources", home: "/internal" },
  { username: "busdev", password: "bus123", role: "Business Development", home: "/internal" },
  { username: "pm", password: "pm123", role: "Project Management", home: "/internal" },
] as const;

type DbUser = { userId: string; username: string; role: string };

export default function SuperuserBubble() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
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

  const login = async (cred: (typeof CREDS)[number]) => {
    const dbUser = dbUsers.find((u) => u.role === cred.role);
    if (!dbUser) {
      alert(`No ${cred.role} user found in database`);
      return;
    }
    setLoading(dbUser.username);
    try {
      const res = await fetch("/api/auth/superuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: dbUser.userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpen(false);
        router.push(data.home || cred.home);
      } else {
        alert(`Login failed for ${cred.role}`);
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
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                title={showPasswords ? "Hide passwords" : "Show passwords"}
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-col p-2 max-h-[70vh] overflow-y-auto">
            {CREDS.map((c) => {
              const dbUser = dbUsers.find((u) => u.role === c.role);
              const username = dbUser?.username ?? c.username;
              return (
                <button
                  key={c.username}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => login(c)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left w-full disabled:opacity-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${roleBadgeColor[c.role as keyof typeof roleBadgeColor]}`}>
                        {c.role}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-mono">{username}</span>
                      <span className="mx-1">/</span>
                      <span className="font-mono">{showPasswords ? c.password : "••••••"}</span>
                    </div>
                  </div>
                  {loading === dbUser?.username ? (
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

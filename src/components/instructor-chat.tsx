"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { INSTRUCTORS, PROGRAMMES } from "@/lib/mock-data";
import { Send, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

interface ChatMessage {
  id: string;
  from: "student" | "instructor";
  text: string;
  sentAt: string;
}

const STORAGE_PREFIX = "instructor-chat-";

function storageKey(user: string, programmeId: string, instructorId: string) {
  return `${STORAGE_PREFIX}${user}-${programmeId}-${instructorId}`;
}

function loadMessages(key: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export default function InstructorChat({
  user,
  programmeId,
  open,
  onOpenChange,
}: {
  user: string;
  programmeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Instructors allocated to the active programme.
  const instructors = useMemo(() => {
    const programme = PROGRAMMES.find((p) => p.id === programmeId);
    if (!programme) return [];
    return programme.instructorIds
      .map((id) => INSTRUCTORS.find((i) => i.id === id))
      .filter((i): i is (typeof INSTRUCTORS)[number] => Boolean(i));
  }, [programmeId]);

  // null = instructor list view; an id = open conversation.
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Always return to the list when the chat is reopened or the programme changes.
  useEffect(() => {
    setSelectedInstructorId(null);
    setDraft("");
  }, [open, instructors]);

  const activeInstructor = instructors.find((i) => i.id === selectedInstructorId) ?? null;
  const key = activeInstructor ? storageKey(user, programmeId, activeInstructor.id) : "";

  // Load the stored conversation when an instructor is opened.
  useEffect(() => {
    if (!key) return;
    setMessages(loadMessages(key));
  }, [key]);

  // Keep the view pinned to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, selectedInstructorId]);

  const send = () => {
    const text = draft.trim();
    if (!text || !key) return;
    const next: ChatMessage[] = [
      ...messages,
      { id: `m-${Date.now()}`, from: "student", text, sentAt: "Just now" },
    ];
    setMessages(next);
    localStorage.setItem(key, JSON.stringify(next));
    setDraft("");
  };

  // Preview the last saved message for an instructor in the list.
  const lastMessagePreview = (instructorId: string) => {
    const stored = loadMessages(storageKey(user, programmeId, instructorId));
    return stored[stored.length - 1]?.text ?? null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {activeInstructor ? (
          /* ---- Conversation view ---- */
          <>
            <DialogHeader className="flex flex-row items-center gap-2 px-3 py-3 border-b border-border space-y-0">
              <button
                type="button"
                onClick={() => setSelectedInstructorId(null)}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors shrink-0"
                aria-label="Back to instructors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="size-9 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-sm font-medium shrink-0">
                {initials(activeInstructor.name)}
              </div>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-sm font-medium truncate">{activeInstructor.name}</DialogTitle>
                <DialogDescription className="text-xs truncate">{activeInstructor.email}</DialogDescription>
              </div>
            </DialogHeader>

            <div ref={scrollRef} className="flex-1 min-h-[240px] flex flex-col gap-3 px-5 py-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <MessageSquare size={26} />
                  <p className="text-sm m-0">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
                      m.from === "student"
                        ? "self-end bg-[#7e55f6] text-white rounded-br-sm"
                        : "self-start bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">{m.text}</p>
                    <p
                      className={`m-0 mt-1 text-[10px] ${
                        m.from === "student" ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {m.sentAt}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-end gap-2 px-5 py-3 border-t border-border">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type your message (Enter to send)"
                className="flex-1 min-h-10 max-h-32 resize-none"
              />
              <Button
                size="icon"
                className="bg-[#7e55f6] hover:bg-[#6742d4] text-white shrink-0 size-10"
                disabled={!draft.trim()}
                onClick={send}
              >
                <Send size={15} />
              </Button>
            </div>
          </>
        ) : (
          /* ---- Instructor list view ---- */
          <>
            <DialogHeader className="px-5 py-4 border-b border-border">
              <DialogTitle>Message your instructor</DialogTitle>
              <DialogDescription>
                {instructors.length > 0
                  ? "Pick an instructor allocated to this programme to open the chat."
                  : "No instructor is assigned to this programme yet."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 min-h-[200px] flex flex-col gap-1 px-2 py-2 overflow-y-auto">
              {instructors.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-8">
                  <MessageSquare size={28} />
                  <p className="text-sm m-0 text-center">No instructor is assigned to this programme yet.</p>
                </div>
              ) : (
                instructors.map((ins) => {
                  const preview = lastMessagePreview(ins.id);
                  return (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => setSelectedInstructorId(ins.id)}
                      className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="size-9 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-sm font-medium shrink-0">
                        {initials(ins.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium m-0 truncate">{ins.name}</p>
                        <p className="text-xs text-muted-foreground m-0 mt-0.5 truncate">
                          {preview ?? "No messages yet"}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

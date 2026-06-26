"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { INSTRUCTORS, PROGRAMMES } from "@/lib/mock-data";
import { Send, MessageSquare, ChevronLeft } from "lucide-react";

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

const SAMPLE_CONVERSATIONS: Record<string, ChatMessage[]> = {
  ins1: [
    { id: "s1", from: "instructor", text: "Hi there! Have you started on Module 2 yet?", sentAt: ago(60 * 24 * 10) },
    { id: "s2", from: "student", text: "Not yet, I was finishing up the assignment from Module 1.", sentAt: ago(60 * 24 * 10 - 15) },
    { id: "s3", from: "instructor", text: "No worries — take your time with it. Let me know if you need any help with the case study section.", sentAt: ago(60 * 24 * 9) },
    { id: "s4", from: "student", text: "Will do, thanks!", sentAt: ago(60 * 24 * 9 - 5) },
    { id: "s5", from: "instructor", text: "How's it going? Did you manage to get through the financial modelling exercise?", sentAt: ago(60 * 24 * 3) },
    { id: "s6", from: "student", text: "Yeah I finished it yesterday. Had a question about the DCF assumptions though — can I send you my spreadsheet?", sentAt: ago(60 * 24 * 2) },
    { id: "s7", from: "instructor", text: "Absolutely, just attach it in the next message or email it over.", sentAt: ago(60 * 24 * 2 - 30) },
    { id: "s8", from: "student", text: "Sent it to your email just now.", sentAt: ago(180) },
    { id: "s9", from: "instructor", text: "Got it, I'll review it and get back to you by end of day.", sentAt: ago(25) },
  ],
  ins2: [
    { id: "s10", from: "instructor", text: "Welcome to the programme! Feel free to reach out if you have any questions.", sentAt: ago(60 * 24 * 14) },
    { id: "s11", from: "student", text: "Thank you! I'm excited to get started.", sentAt: ago(60 * 24 * 13) },
    { id: "s12", from: "instructor", text: "Great to hear. The first module covers the fundamentals — make sure to go through the reading materials before the quiz.", sentAt: ago(60 * 24 * 5) },
    { id: "s13", from: "student", text: "Quick question — is the quiz timed?", sentAt: ago(60 * 5) },
    { id: "s14", from: "instructor", text: "No, you can take as long as you need. Focus on understanding the concepts.", sentAt: ago(3) },
  ],
  ins3: [
    { id: "s15", from: "student", text: "Hi, I noticed the grade for my written exam hasn't been posted yet.", sentAt: ago(60 * 24 * 4) },
    { id: "s16", from: "instructor", text: "I'm still reviewing the submissions — should have them graded by Friday.", sentAt: ago(60 * 24 * 4 - 45) },
    { id: "s17", from: "student", text: "Sounds good, no rush!", sentAt: ago(60 * 24 * 4 - 40) },
  ],
};

function loadMessages(key: string, instructorId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  const sample = SAMPLE_CONVERSATIONS[instructorId];
  if (sample) {
    localStorage.setItem(key, JSON.stringify(sample));
    return sample;
  }
  return [];
}

import { formatSentAt, ago } from "@/utils/formatTime";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

/**
 * Inline messaging panel rendered inside the portal dashboards (at
 * /internal/messages and /student/messages), so the surrounding sidebar
 * chrome stays put. Mirrors the two-pane layout of the instructor inbox.
 */
export default function InstructorChat({
  user,
  programmeId,
}: {
  user: string;
  programmeId: string;
}) {
  // Instructors allocated to the active programme.
  const instructors = useMemo(() => {
    const programme = PROGRAMMES.find((p) => p.id === programmeId);
    if (!programme) return [];
    return programme.instructorIds
      .map((id) => INSTRUCTORS.find((i) => i.id === id))
      .filter((i): i is (typeof INSTRUCTORS)[number] => Boolean(i));
  }, [programmeId]);

  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(
    instructors[0]?.id ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset selection when the programme (instructor list) changes.
  const [prevInstructors, setPrevInstructors] = useState(instructors);
  if (prevInstructors !== instructors) {
    setPrevInstructors(instructors);
    setSelectedInstructorId(instructors[0]?.id ?? null);
    setDraft("");
    setMobileShowChat(false);
  }

  const activeInstructor = instructors.find((i) => i.id === selectedInstructorId) ?? null;
  const key = activeInstructor ? storageKey(user, programmeId, activeInstructor.id) : "";

  // Load the stored conversation when an instructor is selected.
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setMessages(key && selectedInstructorId ? loadMessages(key, selectedInstructorId) : []);
  }

  // Keep the view pinned to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, selectedInstructorId]);

  const openInstructor = (id: string) => {
    setSelectedInstructorId(id);
    setDraft("");
    setMobileShowChat(true);
  };

  const send = () => {
    const text = draft.trim();
    if (!text || !key) return;
    const next: ChatMessage[] = [
      ...messages,
      { id: `m-${Date.now()}`, from: "student", text, sentAt: new Date().toISOString() },
    ];
    setMessages(next);
    localStorage.setItem(key, JSON.stringify(next));
    setDraft("");
  };

  // Preview the last saved message for an instructor in the list.
  const lastMessagePreview = (instructorId: string) => {
    const stored = loadMessages(storageKey(user, programmeId, instructorId), instructorId);
    const last = stored[stored.length - 1];
    if (!last) return null;
    return { text: last.text, time: formatSentAt(last.sentAt) };
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Messages</h1>
        <p className="text-muted-foreground mt-1">Chat with the instructors on your programme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[325px_minmax(0,1fr)] gap-4 items-start">
        {/* Instructor list — hidden on mobile when a chat is open */}
        <Card className={`shadow-sm py-2 gap-0 ${mobileShowChat ? "hidden lg:flex" : ""}`}>
          <CardContent className="px-2 flex flex-col gap-1">
            {instructors.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 m-0">
                No instructor is assigned to this programme yet.
              </p>
            )}
            {instructors.map((ins) => {
              const preview = lastMessagePreview(ins.id);
              const isActive = ins.id === selectedInstructorId;
              return (
                <Button
                  key={ins.id}
                  onClick={() => openInstructor(ins.id)}
                  variant="ghost"
                  className={`flex items-start gap-2.5 rounded-lg p-2.5 h-auto text-left transition-colors border justify-start w-full ${
                    isActive ? "border-[#7e55f6]/40 bg-[#7e55f6]/8" : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="size-8 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-xs font-medium shrink-0">
                    {initials(ins.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm m-0 truncate font-normal">{ins.name}</p>
                      {preview && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{preview.time}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground m-0 mt-0.5 line-clamp-1">
                      {preview?.text ?? "No messages yet"}
                    </p>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Conversation — hidden on mobile when the list is showing */}
        <Card className={`shadow-sm h-[calc(100vh-12rem)] flex-col ${mobileShowChat ? "flex" : "hidden lg:flex"}`}>
          {activeInstructor ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back to instructors"
                >
                  <ChevronLeft size={18} />
                </Button>
                <div className="size-9 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-sm font-medium shrink-0">
                  {initials(activeInstructor.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium m-0 truncate">{activeInstructor.name}</p>
                  <p className="text-xs text-muted-foreground m-0 truncate">{activeInstructor.email}</p>
                </div>
              </div>

              <CardContent ref={scrollRef} className="flex-1 flex flex-col gap-3 py-4 overflow-y-auto min-h-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <MessageSquare size={26} />
                    <p className="text-sm m-0">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm wrap-break-word ${
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
                        {formatSentAt(m.sentAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>

              <div className="flex items-end gap-2 px-4 py-3 border-t border-border">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message"
                  className="flex-1 min-h-10 max-h-32 resize-none"
                />
                <Button
                  size="icon"
                  className="shrink-0 size-10"
                  disabled={!draft.trim()}
                  onClick={send}
                >
                  <Send size={15} />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <MessageSquare size={28} />
              <p className="text-sm m-0">Select an instructor to start chatting.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import PlaceholderGuard from "@/components/misc/placeholder-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { Badge } from "@/components/ui/badge";
import { learnerRole, type MessageThread } from "@/lib/mock-data";
import { ROLE_BADGE, ROLE_TEXT } from "@/utils/badgeColor";
import { Send, MessageSquare, ChevronLeft } from "lucide-react";
import { formatSentAt } from "@/utils/formatTime";

let idCounter = 9000;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

export default function InstructorMessagesPage() {
  const {
    threads,
    setThreads,
    consultants,
    programmes,
    internalProgrammes,
    internalThreads,
    setInternalThreads,
    internalConsultants,
  } = usePortalStore();

  // Internal threads belonging to programmes this instructor delivers (or their
  // own internal enrolment) are merged into the standard inbox.
  const myInternalProgrammeIds = internalProgrammes
    .filter((p) => p.instructorIds.includes(CURRENT_INSTRUCTOR.id))
    .map((p) => p.id);
  const myInternalThreads = internalThreads.filter(
    (t) =>
      myInternalProgrammeIds.includes(t.programmeId) ||
      internalConsultants.some((s) => s.id === t.consultantId && s.name === CURRENT_INSTRUCTOR.name)
  );
  const myThreads = [
    ...threads.filter((t) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(t.programmeId)),
    ...myInternalThreads,
  ];
  const [activeId, setActiveId] = useState<string | null>(myThreads[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const active = myThreads.find((t) => t.id === activeId) ?? null;

  // Mutations route to whichever store the thread came from.
  const isInternalThread = (id: string) => internalThreads.some((t) => t.id === id);
  const updateThread = (id: string, updater: (t: MessageThread) => MessageThread) => {
    const setter = isInternalThread(id) ? setInternalThreads : setThreads;
    setter((prev) => prev.map((t) => (t.id === id ? updater(t) : t)));
  };

  const allProgrammes = [...programmes, ...internalProgrammes];
  const programmeName = (id: string) => allProgrammes.find((p) => p.id === id)?.name ?? "N/A";
  const allConsultants = [...consultants, ...internalConsultants];

  // Open (or start) a conversation when arriving from the Consultants roster
  // via /instructor/messages?consultant=<id>.
  const [didRoute, setDidRoute] = useState(false);
  if (!didRoute && typeof window !== "undefined") {
    const id = new URLSearchParams(window.location.search).get("consultant");
    if (id) {
      const existing = [...threads, ...internalThreads].find((t) => t.consultantId === id);
      if (existing) {
        if (activeId !== existing.id) setActiveId(existing.id);
        if (existing.unread) updateThread(existing.id, (t) => ({ ...t, unread: false }));
      } else {
        const consultant = allConsultants.find((s) => s.id === id);
        if (consultant) {
          const newThread = {
            id: nextId("t"),
            consultantId: id,
            programmeId: consultant.programmeId,
            unread: false,
            messages: [],
          };
          const setter = internalConsultants.some((s) => s.id === id) ? setInternalThreads : setThreads;
          setter((prev) => [newThread, ...prev]);
          setActiveId(newThread.id);
        }
      }
    }
    setDidRoute(true);
  }
  const consultantName = (id: string) => allConsultants.find((s) => s.id === id)?.name ?? "Consultant";
  const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  const openThread = (id: string) => {
    setActiveId(id);
    setReply("");
    setMobileShowChat(true);
    updateThread(id, (t) => ({ ...t, unread: false }));
  };

  const sendReply = () => {
    const text = reply.trim();
    if (!text || !active) return;
    updateThread(active.id, (t) => ({
      ...t,
      messages: [...t.messages, { id: nextId("m"), from: "instructor" as const, text, sentAt: new Date().toISOString() }],
    }));
    setReply("");
  };

  return (
    <PlaceholderGuard>
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Messages</h1>
        <p className="text-muted-foreground mt-1">Questions and queries from your consultants.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[325px_minmax(0,1fr)] gap-4 items-start">
        {/* Thread list, hidden on mobile when a chat is open */}
        <Card className={`shadow-sm py-2 gap-0 ${mobileShowChat ? "hidden lg:flex" : ""}`}>
          <CardContent className="px-2 flex flex-col gap-1">
            {myThreads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 m-0">No messages yet.</p>
            )}
            {myThreads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const isActive = t.id === activeId;
              const role = learnerRole(t.consultantId);
              return (
                <Button
                  key={t.id}
                  onClick={() => openThread(t.id)}
                  variant="ghost"
                  className={`flex items-start gap-2.5 rounded-lg p-2.5 h-auto text-left transition-colors border justify-start w-full ${
                    isActive ? "border-[#7e55f6]/40 bg-[#7e55f6]/8" : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="size-8 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-xs font-medium shrink-0">
                    {initials(consultantName(t.consultantId))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-sm m-0 truncate font-normal ${
                          role ? ROLE_TEXT[role] : ""
                        }`}
                      >
                        {consultantName(t.consultantId)}
                      </p>
                      {t.unread && <span className="size-2 rounded-full bg-[#7e55f6] shrink-0" />}
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{last ? formatSentAt(last.sentAt) : ""}</span>
                    </div>
                    <p className="text-xs text-muted-foreground m-0 mt-0.5 line-clamp-2">
                      {last ? last.text : "No messages yet"}
                    </p>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Conversation, hidden on mobile when thread list is showing */}
        <Card className={`shadow-sm h-[calc(100vh-12rem)] flex-col ${mobileShowChat ? "flex" : "hidden lg:flex"}`}>
          {active ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back to conversations"
                >
                  <ChevronLeft size={18} />
                </Button>
                <div className="size-9 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-sm font-medium shrink-0">
                  {initials(consultantName(active.consultantId))}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium m-0 truncate">
                    {consultantName(active.consultantId)}
                    {(r => r && r !== "Consultant" && <Badge className={`align-middle ${ROLE_BADGE[r]} ml-2`}>{r}</Badge>)(learnerRole(active.consultantId))}
                  </p>
                  <p className="text-xs text-muted-foreground m-0 truncate">{programmeName(active.programmeId)}</p>
                </div>
              </div>

              <CardContent className="flex-1 flex flex-col gap-3 py-4 overflow-y-auto min-h-0">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm wrap-break-word ${
                      m.from === "instructor"
                        ? "self-end bg-[#7e55f6] text-white rounded-br-sm"
                        : "self-start bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">{m.text}</p>
                    <p
                      className={`m-0 mt-1 text-[10px] ${
                        m.from === "instructor" ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatSentAt(m.sentAt)}
                    </p>
                  </div>
                ))}
              </CardContent>

              <div className="flex items-end gap-2 px-4 py-3 border-t border-border">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  placeholder="Type a message"
                  className="flex-1 min-h-10 max-h-32 resize-none"
                />
                <Button
                  size="icon"
                  className="shrink-0 size-10"
                  disabled={!reply.trim()}
                  onClick={sendReply}
                >
                  <Send size={15} />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <MessageSquare size={28} />
              <p className="text-sm m-0">Select a conversation to read and reply.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
    </PlaceholderGuard>
  );
}

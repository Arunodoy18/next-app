// REVW
"use client";

import { useState } from "react";
import PlaceholderGuard from "@/components/misc/placeholder-guard";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { learnerRole, type AssignableRole } from "@/lib/mock-data";
import { ROLE_BADGE } from "@/utils/badgeColor";
import { formatSentAt } from "@/utils/formatTime";
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Award,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Check,
  Plus,
} from "lucide-react";

export default function InstructorOverview() {
  const { programmes, consultants, threads, internalProgrammes, internalConsultants, internalThreads } =
    usePortalStore();

  const allProgrammes = [...programmes, ...internalProgrammes];
  const programmeName = (id: string) => allProgrammes.find((p) => p.id === id)?.name ?? "N/A";

  // The current instructor's internal training: programmes they deliver, the
  // instructor-learners in them (plus their own enrolment), and related threads.
  const myInternalProgrammes = internalProgrammes.filter((p) =>
    p.instructorIds.includes(CURRENT_INSTRUCTOR.id)
  );
  const myInternalProgrammeIds = myInternalProgrammes.map((p) => p.id);
  const myInternalConsultants = internalConsultants.filter(
    (s) => myInternalProgrammeIds.includes(s.programmeId) || s.name === CURRENT_INSTRUCTOR.name
  );
  const myInternalThreads = internalThreads.filter(
    (t) =>
      myInternalProgrammeIds.includes(t.programmeId) ||
      internalConsultants.some((s) => s.id === t.consultantId && s.name === CURRENT_INSTRUCTOR.name)
  );
  const assignedProgrammes = programmes.filter((p) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(p.id));
  const myConsultants = consultants.filter((s) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId));

  // Programme filter chips shown under the welcome line. All selected by
  // default; deselecting one removes its data from the stats and lists below.
  const badgeProgrammes = [
    ...assignedProgrammes.map((p) => ({ id: p.id, name: p.name, role: p.roles?.[0] ?? null })),
    ...myInternalProgrammes.map((p) => ({ id: p.id, name: p.name, role: p.roles?.[0] ?? null })),
  ];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set([...assignedProgrammes, ...myInternalProgrammes].map((p) => p.id))
  );
  const toggleProgramme = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selStandard = assignedProgrammes.filter((p) => selectedIds.has(p.id));
  const selInternal = myInternalProgrammes.filter((p) => selectedIds.has(p.id));
  const selStandardIds = new Set(selStandard.map((p) => p.id));
  const selInternalIds = new Set(selInternal.map((p) => p.id));

  // Pools limited to the currently selected programmes.
  const stdPool = myConsultants.filter((s) => selStandardIds.has(s.programmeId));
  const intPool = myInternalConsultants.filter((s) => selInternalIds.has(s.programmeId));
  const visibleConsultants = [...stdPool, ...intPool];

  const progressOf = (pool: typeof consultants) =>
    pool.length
      ? Math.round(
          (pool.reduce((acc, s) => {
            const prog = allProgrammes.find((p) => p.id === s.programmeId);
            const total = prog?.modules.length ?? 0;
            return acc + (total ? s.moduleProgress.filter((m) => m.completed).length / total : 0);
          }, 0) /
            pool.length) *
            100
        )
      : null;
  const avgProgress = progressOf(visibleConsultants);

  const gradesFrom = (pool: typeof consultants) =>
    pool.flatMap((s) => s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null));
  const allGrades = gradesFrom(visibleConsultants);
  const avgGrade = allGrades.length ? Math.round(allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null;

  const pendingCount = (pool: typeof consultants) =>
    pool.reduce((acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length, 0);
  const queue = stdPool.filter((s) => s.writtenAnswers.some((a) => a.score === null));
  const internalQueue = intPool.filter((s) => s.writtenAnswers.some((a) => a.score === null));
  const totalPending = pendingCount(visibleConsultants);

  const unreadThreads = threads.filter((t) => selStandardIds.has(t.programmeId) && t.unread);
  const internalUnreadThreads = myInternalThreads.filter((t) => selInternalIds.has(t.programmeId) && t.unread);
  const unreadCount = unreadThreads.length + internalUnreadThreads.length;

  const pct = (v: number | null) => (v !== null ? `${v}%` : "N/A");

  // Per-programme breakdown for the programme-wise overview.
  const buildOverview = (progs: typeof programmes, pool: typeof consultants) =>
    progs.map((p) => {
      const enrolled = pool.filter((s) => s.programmeId === p.id);
      const moduleCount = p.modules.length;
      const avgProg = enrolled.length
        ? Math.round(
            (enrolled.reduce(
              (acc, s) => acc + (moduleCount ? s.moduleProgress.filter((m) => m.completed).length / moduleCount : 0),
              0
            ) /
              enrolled.length) *
              100
          )
        : 0;
      const grades = enrolled.flatMap((s) => s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null));
      const avgGr = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;
      const pending = enrolled.reduce((acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length, 0);
      return { programme: p, consultants: enrolled.length, avgProgress: avgProg, avgGrade: avgGr, pending };
    });
  const programmeOverview = buildOverview(selStandard, consultants);
  const internalProgrammeOverview = buildOverview(selInternal, internalConsultants);

  const consultantName = (id: string) =>
    [...consultants, ...internalConsultants].find((s) => s.id === id)?.name ?? "Consultant";

  const stats = [
    {
      icon: Users,
      label: `${stdPool.length} consultant${stdPool.length === 1 ? "" : "s"} · ${intPool.length} instructor${
        intPool.length === 1 ? "" : "s"
      }`,
      value: visibleConsultants.length,
      href: "/instructor/consultants",
    },
    {
      icon: TrendingUp,
      label: "Avg. module progress",
      value: pct(avgProgress),
      href: "/instructor/consultants",
    },
    {
      icon: Award,
      label: "Avg. grade",
      value: pct(avgGrade),
      href: "/instructor/consultants",
    },
    {
      icon: ClipboardCheck,
      label: "Answers awaiting review",
      value: totalPending,
      href: "/instructor/evaluations",
      highlight: totalPending > 0,
    },
    {
      icon: MessageSquare,
      label: "Unread messages",
      value: unreadCount,
      href: "/instructor/messages",
      highlight: unreadCount > 0,
    },
  ];

  return (
    <PlaceholderGuard>
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Welcome, {CURRENT_INSTRUCTOR.name}</h1>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <GraduationCap size={14} className="text-muted-foreground" />
          {badgeProgrammes.map((p) => {
            const active = selectedIds.has(p.id);
            return (
              <Button
                key={p.id}
                type="button"
                onClick={() => toggleProgramme(p.id)}
                aria-pressed={active}
                variant="ghost"
                size="sm"
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  active
                    ? p.role
                      ? ROLE_BADGE[p.role]
                      : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "border border-border text-muted-foreground hover:bg-muted line-through decoration-1"
                }`}
              >
                {active ? <Check size={11} /> : <Plus size={11} />}
                {p.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="shadow-sm py-4 hover:border-[#7e55f6]/40 transition-colors h-full">
              <CardContent className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                    stat.highlight ? "bg-[#7e55f6] text-white" : "bg-[#7e55f6]/10 text-[#7e55f6]"
                  }`}
                >
                  <stat.icon size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold m-0 leading-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground m-0 truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Programme-wise overview */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium m-0">Programme Overview</CardTitle>
            <CardDescription>Progress and review load for each programme you teach.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {[...programmeOverview, ...internalProgrammeOverview].length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 m-0">No programmes yet.</p>
          )}
          {programmeOverview.map(({ programme, consultants: count, avgProgress: prog, avgGrade: grade, pending }) => (
            <ProgrammeRow
              key={programme.id}
              name={programme.name}
              roles={programme.roles ?? []}
              modules={programme.modules.length}
              count={count}
              countNoun="consultant"
              avgProgress={prog}
              avgGrade={grade}
              pending={pending}
              href={`/instructor/consultants?programme=${programme.id}`}
            />
          ))}
          {internalProgrammeOverview.length > 0 && <InternalDivider />}
          {internalProgrammeOverview.map(({ programme, consultants: count, avgProgress: prog, avgGrade: grade, pending }) => (
            <ProgrammeRow
              key={programme.id}
              name={programme.name}
              roles={programme.roles ?? []}
              modules={programme.modules.length}
              count={count}
              countNoun="learner"
              avgProgress={prog}
              avgGrade={grade}
              pending={pending}
              href={`/instructor/consultants?programme=${programme.id}`}
            />
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Evaluation queue preview */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">Evaluation Queue</CardTitle>
              <CardDescription>Written tests waiting for your review.</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/instructor/evaluations" />}>
              View all <ArrowRight size={13} />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {queue.length === 0 && internalQueue.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={26} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground m-0">All caught up.</p>
              </div>
            ) : (
              <>
                {queue.slice(0, 3).map((s) => (
                  <QueueRow key={s.id} learnerId={s.id} name={s.name} programme={programmeName(s.programmeId)} pending={s.writtenAnswers.filter((a) => a.score === null).length} />
                ))}
                {internalQueue.length > 0 && <InternalDivider />}
                {internalQueue.slice(0, 3).map((s) => (
                  <QueueRow key={s.id} learnerId={s.id} name={s.name} programme={programmeName(s.programmeId)} pending={s.writtenAnswers.filter((a) => a.score === null).length} />
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent messages preview */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">Unread Messages</CardTitle>
              <CardDescription>New queries from your consultants.</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/instructor/messages" />}>
              Open inbox <ArrowRight size={13} />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {unreadThreads.length === 0 && internalUnreadThreads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 m-0">No unread messages.</p>
            ) : (
              <>
                {unreadThreads.slice(0, 3).map((t) => (
                  <MessageRow key={t.id} learnerId={t.consultantId} name={consultantName(t.consultantId)} last={t.messages[t.messages.length - 1]} />
                ))}
                {internalUnreadThreads.length > 0 && <InternalDivider />}
                {internalUnreadThreads.slice(0, 3).map((t) => (
                  <MessageRow key={t.id} learnerId={t.consultantId} name={consultantName(t.consultantId)} last={t.messages[t.messages.length - 1]} />
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </PlaceholderGuard>
  );
}

function InternalDivider() {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-wide text-white">Internal</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function ProgrammeRow({
  name,
  modules,
  count,
  countNoun,
  avgProgress,
  avgGrade,
  pending,
  href,
  roles = [],
}: {
  name: string;
  modules: number;
  count: number;
  countNoun: string;
  avgProgress: number;
  avgGrade: number | null;
  pending: number;
  href: string;
  roles?: AssignableRole[];
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
    >
      <div className="size-9 rounded-lg bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center shrink-0">
        <GraduationCap size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium m-0 truncate">{name}</p>
          {roles.map((r) => (
            <Badge key={r} className={`align-middle ${ROLE_BADGE[r]}`}>{r}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground m-0 mt-0.5">
          {count} {countNoun}
          {count === 1 ? "" : "s"} · {modules} module{modules === 1 ? "" : "s"}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
        <div>
          <p className="text-sm font-semibold m-0 leading-tight">{avgProgress}%</p>
          <p className="text-[11px] text-muted-foreground m-0">Avg progress</p>
        </div>
        <div>
          <p className="text-sm font-semibold m-0 leading-tight">{avgGrade !== null ? `${avgGrade}%` : "N/A"}</p>
          <p className="text-[11px] text-muted-foreground m-0">Avg grade</p>
        </div>
      </div>
      {pending > 0 ? (
        <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">{pending} pending</Badge>
      ) : (
        <Badge variant="secondary" className="shrink-0">Up to date</Badge>
      )}
      <ChevronRight size={15} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

function QueueRow({
  name,
  programme,
  pending,
  learnerId,
}: {
  name: string;
  programme: string;
  pending: number;
  learnerId?: string;
}) {
  return (
    <Link
      href="/instructor/evaluations"
      className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
    >
      <div className="size-8 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-xs font-medium shrink-0">
        {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium m-0 truncate">
          {name}
          {learnerId && (r => r && r !== "Consultant" && <Badge className={`align-middle ${ROLE_BADGE[r]} ml-2`}>{r}</Badge>)(learnerRole(learnerId))}
        </p>
        <p className="text-xs text-muted-foreground m-0 truncate">{programme}</p>
      </div>
      <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">{pending} pending</Badge>
      <ChevronRight size={15} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

function MessageRow({
  name,
  last,
  learnerId,
}: {
  name: string;
  last: { text: string; sentAt: string } | undefined;
  learnerId?: string;
}) {
  return (
    <Link
      href="/instructor/messages"
      className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
    >
      <div className="size-8 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-xs font-medium shrink-0">
        {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium m-0 truncate">
            {name}
            {learnerId && (r => r && r !== "Consultant" && <Badge className={`align-middle ${ROLE_BADGE[r]} ml-2`}>{r}</Badge>)(learnerRole(learnerId))}
          </p>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">{last ? formatSentAt(last.sentAt) : ""}</span>
        </div>
        <p className="text-xs text-muted-foreground m-0 mt-0.5 line-clamp-2">{last ? last.text : "No messages yet"}</p>
      </div>
    </Link>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePortalStore } from "@/lib/portal-store";
import { instructorName, ROLE_BADGE, type AssignableRole } from "@/lib/mock-data";
import RoleBadge from "@/components/role-badge";
import PageTitle from "@/components/page-title";
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Check,
  Plus,
} from "lucide-react";

export default function AdminOverview() {
  const { programmes, students, internalProgrammes, internalStudents } = usePortalStore();

  const allProgrammes = [...programmes, ...internalProgrammes];

  const badgeProgrammes = [
    ...programmes.map((p) => ({ id: p.id, name: p.name, role: (p.roles?.[0] ?? null) as AssignableRole | null })),
    ...internalProgrammes.map((p) => ({ id: p.id, name: p.name, role: (p.roles?.[0] ?? null) as AssignableRole | null })),
  ];

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allProgrammes.map((p) => p.id))
  );
  const toggleProgramme = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selStandard = programmes.filter((p) => selectedIds.has(p.id));
  const selInternal = internalProgrammes.filter((p) => selectedIds.has(p.id));
  const selStandardIds = new Set(selStandard.map((p) => p.id));
  const selInternalIds = new Set(selInternal.map((p) => p.id));

  const stdPool = students.filter((s) => selStandardIds.has(s.programmeId));
  const intPool = internalStudents.filter((s) => selInternalIds.has(s.programmeId));
  const visibleLearners = [...stdPool, ...intPool];

  const avgProgress = visibleLearners.length
    ? Math.round(
        (visibleLearners.reduce((acc, s) => {
          const prog = allProgrammes.find((p) => p.id === s.programmeId);
          const total = prog?.modules.length ?? 0;
          return acc + (total ? s.moduleProgress.filter((m) => m.completed).length / total : 0);
        }, 0) /
          visibleLearners.length) *
          100
      )
    : null;

  const allGrades = visibleLearners.flatMap((s) =>
    s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null)
  );
  const avgGrade = allGrades.length ? Math.round(allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null;

  const totalPending = visibleLearners.reduce(
    (acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length,
    0
  );

  const pct = (v: number | null) => (v !== null ? `${v}%` : "N/A");

  const stats = [
    {
      icon: Users,
      label: `${stdPool.length} student${stdPool.length === 1 ? "" : "s"} · ${intPool.length} learner${intPool.length === 1 ? "" : "s"}`,
      value: visibleLearners.length,
      href: "/admin/users",
    },
    {
      icon: TrendingUp,
      label: "Avg. module progress",
      value: pct(avgProgress),
      href: "/admin/performance",
    },
    {
      icon: Award,
      label: "Avg. grade",
      value: pct(avgGrade),
      href: "/admin/performance",
    },
    {
      icon: ClipboardCheck,
      label: "Answers awaiting review",
      value: totalPending,
      href: "/admin/performance",
      highlight: totalPending > 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <PageTitle title="Admin" />
      <div>
        <h1 className="text-3xl font-normal m-0">Overview</h1>
        <p className="text-muted-foreground mt-1">Everything across the academy at a glance.</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <GraduationCap size={14} className="text-muted-foreground" />
          {badgeProgrammes.map((p) => {
            const active = selectedIds.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProgramme(p.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  active
                    ? p.role
                      ? ROLE_BADGE[p.role]
                      : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "border-border text-muted-foreground hover:bg-muted line-through decoration-1"
                }`}
              >
                {active ? <Check size={11} /> : <Plus size={11} />}
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Programme performance summary */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium m-0">Programme Performance</CardTitle>
            <CardDescription>Enrolment, progress, and evaluation status per programme.</CardDescription>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/admin/performance" />}>
            All students <ArrowRight size={13} />
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {selStandard.map((p) => {
            const enrolled = students.filter((s) => s.programmeId === p.id);
            const totalModules = p.modules.length;
            const prog =
              enrolled.length && totalModules
                ? Math.round(
                    (enrolled.reduce(
                      (acc, s) => acc + s.moduleProgress.filter((m) => m.completed).length / totalModules,
                      0
                    ) /
                      enrolled.length) *
                      100
                  )
                : 0;
            const scores = enrolled.flatMap((s) =>
              s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null)
            );
            const avgQuiz = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
            const pending = enrolled.reduce(
              (acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length,
              0
            );

            return (
              <div key={p.id} className="rounded-lg border border-border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium m-0 truncate">{p.name}</p>
                      {(p.roles ?? []).map((r) => (
                        <RoleBadge key={r} role={r} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground m-0 mt-0.5 truncate">
                      {p.instructorIds.map(instructorName).join(", ") || "No instructors assigned"}
                    </p>
                  </div>
                  {pending > 0 && (
                    <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">
                      {pending} pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={prog} className="flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{prog}% avg progress</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {enrolled.length} student{enrolled.length === 1 ? "" : "s"} · {totalModules} module
                    {totalModules === 1 ? "" : "s"}
                  </span>
                  <span>Avg quiz score: {avgQuiz !== null ? `${avgQuiz}%` : "N/A"}</span>
                </div>
              </div>
            );
          })}
          {selStandard.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-6">No programmes selected.</p>
          )}
        </CardContent>
      </Card>

      {/* Instructor (internal) programme performance summary */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium m-0">Internal Programmes</CardTitle>
            <CardDescription>Instructor training and upskilling programmes managed internally.</CardDescription>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/admin/performance" />}>
            All learners <ArrowRight size={13} />
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {selInternal.map((p) => {
              const enrolled = internalStudents.filter((s) => s.programmeId === p.id);
              const totalModules = p.modules.length;
              const prog =
                enrolled.length && totalModules
                  ? Math.round(
                      (enrolled.reduce(
                        (acc, s) => acc + s.moduleProgress.filter((m) => m.completed).length / totalModules,
                        0
                      ) /
                        enrolled.length) *
                        100
                    )
                  : 0;
              const scores = enrolled.flatMap((s) =>
                s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null)
              );
              const avgQuiz = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
              const pending = enrolled.reduce(
                (acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length,
                0
              );

              return (
                <div key={p.id} className="rounded-lg border border-border p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium m-0 truncate">{p.name}</p>
                        {(p.roles ?? []).map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground m-0 mt-0.5 truncate">
                        {p.instructorIds.map(instructorName).join(", ") || "No instructors assigned"}
                      </p>
                    </div>
                    {pending > 0 && (
                      <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">
                        {pending} pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={prog} className="flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{prog}% avg progress</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {enrolled.length} learner{enrolled.length === 1 ? "" : "s"} · {totalModules} module
                      {totalModules === 1 ? "" : "s"}
                    </span>
                    <span>Avg quiz score: {avgQuiz !== null ? `${avgQuiz}%` : "N/A"}</span>
                  </div>
                </div>
              );
            })}
          {selInternal.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-6">No programmes selected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

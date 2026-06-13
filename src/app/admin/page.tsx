"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePortalStore } from "@/lib/portal-store";
import { instructorName } from "@/lib/mock-data";
import { GraduationCap, Users, ClipboardCheck, UserCog, ArrowRight, Plus } from "lucide-react";

export default function AdminOverview() {
  const { programmes, users, students } = usePortalStore();

  const studentCount = users.filter((u) => u.role === "Student").length;
  const instructorCount = users.filter((u) => u.role === "Instructor").length;
  const pendingAnswers = students.reduce(
    (acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length,
    0
  );

  const stats = [
    { icon: GraduationCap, label: "Programmes", value: programmes.length, href: "/admin/programmes" },
    { icon: Users, label: "Students", value: studentCount, href: "/admin/users" },
    { icon: UserCog, label: "Instructors", value: instructorCount, href: "/admin/users" },
    {
      icon: ClipboardCheck,
      label: "Answers awaiting review",
      value: pendingAnswers,
      href: "/admin/performance",
      highlight: pendingAnswers > 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-normal m-0">Overview</h1>
          <p className="text-muted-foreground mt-1">Everything across the academy at a glance.</p>
        </div>
        <Button
          size="sm"
          className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
          render={<Link href="/admin/programmes" />}
        >
          <Plus size={14} /> New Programme
        </Button>
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
          {programmes.map((p) => {
            const enrolled = students.filter((s) => s.programmeId === p.id);
            const totalModules = p.modules.length;
            const avgProgress =
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
                    <p className="text-sm font-medium m-0 truncate">{p.name}</p>
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
                  <Progress value={avgProgress} className="flex-1" />
                  <span className="text-xs text-muted-foreground w-24">{avgProgress}% avg progress</span>
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
          {programmes.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-6">No programmes yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

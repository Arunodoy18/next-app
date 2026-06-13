"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortalStore } from "@/lib/portal-store";
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { programmeName } from "@/lib/mock-data";
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
} from "lucide-react";

export default function InstructorOverview() {
  const { programmes, students, threads } = usePortalStore();

  const assignedProgrammes = programmes.filter((p) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(p.id));
  const myStudents = students.filter((s) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId));

  const avgProgress = myStudents.length
    ? Math.round(
        (myStudents.reduce((acc, s) => {
          const prog = programmes.find((p) => p.id === s.programmeId);
          const total = prog?.modules.length ?? 0;
          return acc + (total ? s.moduleProgress.filter((m) => m.completed).length / total : 0);
        }, 0) /
          myStudents.length) *
          100
      )
    : 0;

  const allGrades = myStudents.flatMap((s) =>
    s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null)
  );
  const avgGrade = allGrades.length
    ? Math.round(allGrades.reduce((a, b) => a + b, 0) / allGrades.length)
    : null;

  const queue = myStudents.filter((s) => s.writtenAnswers.some((a) => a.score === null));
  const totalPending = myStudents.reduce(
    (acc, s) => acc + s.writtenAnswers.filter((a) => a.score === null).length,
    0
  );

  const myThreads = threads.filter((t) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(t.programmeId));
  const unreadThreads = myThreads.filter((t) => t.unread);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "Student";

  const stats = [
    { icon: Users, label: "Students", value: myStudents.length, href: "/instructor/students" },
    { icon: TrendingUp, label: "Avg. module progress", value: `${avgProgress}%`, href: "/instructor/students" },
    { icon: Award, label: "Avg. grade", value: avgGrade !== null ? `${avgGrade}%` : "N/A", href: "/instructor/students" },
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
      value: unreadThreads.length,
      href: "/instructor/messages",
      highlight: unreadThreads.length > 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Welcome, {CURRENT_INSTRUCTOR.name}</h1>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <GraduationCap size={14} className="text-muted-foreground" />
          {assignedProgrammes.map((p) => (
            <Badge key={p.id} variant="secondary">
              {p.name}
            </Badge>
          ))}
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
            {queue.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={26} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground m-0">All caught up.</p>
              </div>
            ) : (
              queue.slice(0, 3).map((s) => {
                const pending = s.writtenAnswers.filter((a) => a.score === null).length;
                return (
                  <Link
                    key={s.id}
                    href="/instructor/evaluations"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-8 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-xs font-medium shrink-0">
                      {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium m-0 truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground m-0 truncate">{programmeName(s.programmeId)}</p>
                    </div>
                    <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent shrink-0">
                      {pending} pending
                    </Badge>
                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent messages preview */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">Unread Messages</CardTitle>
              <CardDescription>New queries from your students.</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/instructor/messages" />}>
              Open inbox <ArrowRight size={13} />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {unreadThreads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 m-0">No unread messages.</p>
            ) : (
              unreadThreads.slice(0, 3).map((t) => {
                const last = t.messages[t.messages.length - 1];
                return (
                  <Link
                    key={t.id}
                    href="/instructor/messages"
                    className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-8 rounded-full bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center text-xs font-medium shrink-0">
                      {studentName(t.studentId).split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium m-0 truncate">{studentName(t.studentId)}</p>
                        {t.unread && <span className="size-2 rounded-full bg-[#7e55f6] shrink-0" />}
                        <span className="text-xs text-muted-foreground ml-auto shrink-0">{last.sentAt}</span>
                      </div>
                      <p className="text-xs text-muted-foreground m-0 mt-0.5 line-clamp-2">{last.text}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

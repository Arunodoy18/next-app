"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentDetailDialog from "@/components/student-detail-dialog";
import { usePortalStore } from "@/lib/portal-store";
import { programmeName, type WrittenAnswer } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function AdminPerformancePage() {
  const { programmes, students, setStudents } = usePortalStore();
  const [search, setSearch] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (programmeFilter !== "all" && s.programmeId !== programmeFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, search, programmeFilter]);

  const selected = students.find((s) => s.id === selectedId) ?? null;
  const selectedProgramme = selected ? programmes.find((p) => p.id === selected.programmeId) ?? null : null;

  const saveEvaluation = (studentId: string, answers: WrittenAnswer[]) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, writtenAnswers: answers } : s)));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Performance</h1>
        <p className="text-muted-foreground mt-1">
          Progress, quiz scores, and written-test evaluations for every student.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base font-medium m-0">All Students</CardTitle>
            <CardDescription>Click a student for full detail. Admins can evaluate too.</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-52"
              />
            </div>
            <Select value={programmeFilter} onValueChange={(v) => setProgrammeFilter(v ?? "all")}>
              <SelectTrigger className="max-w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programmes</SelectItem>
                {programmes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Module Progress</TableHead>
                <TableHead>Avg Quiz Score</TableHead>
                <TableHead>Written Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const prog = programmes.find((p) => p.id === s.programmeId);
                const totalModules = prog?.modules.length ?? 0;
                const doneModules = s.moduleProgress.filter((m) => m.completed).length;
                const scores = s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null);
                const avgQuiz = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
                const submitted = s.writtenAnswers.length > 0;
                const pending = s.writtenAnswers.filter((a) => a.score === null).length;
                return (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelectedId(s.id)}>
                    <TableCell>
                      <p className="font-medium m-0">{s.name}</p>
                      <p className="text-xs text-muted-foreground m-0">{s.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{programmeName(s.programmeId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Progress value={totalModules ? (doneModules / totalModules) * 100 : 0} className="w-24" />
                        <span className="text-xs text-muted-foreground">
                          {doneModules}/{totalModules}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{avgQuiz !== null ? `${avgQuiz}%` : "N/A"}</TableCell>
                    <TableCell>
                      {!submitted ? (
                        <Badge variant="outline">Not submitted</Badge>
                      ) : pending === 0 ? (
                        <Badge className="bg-green-500/10 text-green-600 border-transparent">Evaluated</Badge>
                      ) : (
                        <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent">Pending review</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No students match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StudentDetailDialog
        student={selected}
        programme={selectedProgramme}
        onClose={() => setSelectedId(null)}
        onSaveEvaluation={saveEvaluation}
      />
    </div>
  );
}

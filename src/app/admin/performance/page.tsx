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
import { Button } from "@/components/ui/button";
import StudentDetailDialog from "@/components/student-detail-dialog";
import { usePortalStore } from "@/lib/portal-store";
import { programmeName, type WrittenAnswer } from "@/lib/mock-data";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const SORT_OPTIONS: Record<string, string> = {
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  "signup-desc": "Newest first",
  "signup-asc": "Oldest first",
  "progress-desc": "Progress (high to low)",
  "quiz-desc": "Avg quiz (high to low)",
};

export default function AdminPerformancePage() {
  const { programmes, students, setStudents } = usePortalStore();
  const [search, setSearch] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  const programmeFilterItems: Record<string, string> = {
    all: "All programmes",
    ...Object.fromEntries(programmes.map((p) => [p.id, p.name])),
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = students.filter((s) => {
      if (programmeFilter !== "all" && s.programmeId !== programmeFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });

    result = result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);

      if (sortBy === "signup-desc") return new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime();
      if (sortBy === "signup-asc") return new Date(a.signupDate).getTime() - new Date(b.signupDate).getTime();

      const aProg = programmes.find((p) => p.id === a.programmeId);
      const aTotal = aProg?.modules.length || 1;
      const aDone = a.moduleProgress.filter((m) => m.completed).length;
      const aProgress = aDone / aTotal;

      const bProg = programmes.find((p) => p.id === b.programmeId);
      const bTotal = bProg?.modules.length || 1;
      const bDone = b.moduleProgress.filter((m) => m.completed).length;
      const bProgress = bDone / bTotal;

      if (sortBy === "progress-desc") return bProgress - aProgress;
      if (sortBy === "progress-asc") return aProgress - bProgress;

      const aScores = a.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null);
      const aAvgQuiz = aScores.length ? aScores.reduce((acc, curr) => acc + curr, 0) / aScores.length : -1;

      const bScores = b.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null);
      const bAvgQuiz = bScores.length ? bScores.reduce((acc, curr) => acc + curr, 0) / bScores.length : -1;

      if (sortBy === "quiz-desc") return bAvgQuiz - aAvgQuiz;

      return 0;
    });

    return result;
  }, [students, search, programmeFilter, sortBy, programmes]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginated = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useMemo(() => {
    setPage(1);
  }, [search, programmeFilter, sortBy]);

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
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">All Students</CardTitle>
              <CardDescription>Click a student for full detail. Admins can evaluate too.</CardDescription>
            </div>
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 items-center justify-between">
            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-full sm:w-64 bg-background"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                items={programmeFilterItems}
                value={programmeFilter}
                onValueChange={(v) => setProgrammeFilter(v ?? "all")}
              >
                <SelectTrigger className="h-9 w-[180px] bg-background text-base md:text-sm">
                  <Filter size={14} className="text-muted-foreground shrink-0" />
                  <SelectValue placeholder="All programmes" />
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
              <Select items={SORT_OPTIONS} value={sortBy} onValueChange={(v) => setSortBy(v ?? "name-asc")}>
                <SelectTrigger className="h-9 w-[180px] bg-background text-base md:text-sm">
                  <ArrowUpDown size={14} className="text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Signup Date</TableHead>
                <TableHead>Module Progress</TableHead>
                <TableHead>Avg Quiz Score</TableHead>
                <TableHead>Written Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((s) => {
                const prog = programmes.find((p) => p.id === s.programmeId);
                const totalModules = prog?.modules.length ?? 0;
                const doneModules = s.moduleProgress.filter((m) => m.completed).length;
                const scores = s.moduleProgress.map((m) => m.mcqScore).filter((x): x is number => x !== null);
                const avgQuiz = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
                const submitted = s.writtenAnswers.length > 0;
                const pending = s.writtenAnswers.filter((a) => a.score === null).length;
                
                const signupDateObj = new Date(s.signupDate);
                const formattedDate = new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }).format(signupDateObj);

                return (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedId(s.id)}>
                    <TableCell>
                      <p className="font-medium m-0">{s.name}</p>
                      <p className="text-xs text-muted-foreground m-0">{s.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{programmeName(s.programmeId)}</TableCell>
                    <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Progress value={totalModules ? (doneModules / totalModules) * 100 : 0} className="w-24 h-2" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {doneModules}/{totalModules}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">{avgQuiz !== null ? `${avgQuiz}%` : "N/A"}</TableCell>
                    <TableCell>
                      {!submitted ? (
                        <Badge variant="outline" className="font-normal text-muted-foreground">Not submitted</Badge>
                      ) : pending === 0 ? (
                        <Badge className="bg-green-500/10 text-green-600 border-transparent hover:bg-green-500/20 font-medium">Evaluated</Badge>
                      ) : (
                        <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent hover:bg-[#7e55f6]/20 font-medium">Pending review</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No students match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-medium text-foreground">{Math.min(page * ITEMS_PER_PAGE, filteredAndSorted.length)}</span> of{" "}
                <span className="font-medium text-foreground">{filteredAndSorted.length}</span> students
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={14} className="mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "ghost"}
                      size="sm"
                      className={`w-8 h-8 p-0 ${page === i + 1 ? "bg-[#7e55f6] hover:bg-[#6742d4] text-white" : ""}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
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

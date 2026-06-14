"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { CURRENT_INSTRUCTOR } from "@/lib/instructor-context";
import { programmeName } from "@/lib/mock-data";
import { Search, MessageSquare, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const SORT_OPTIONS: Record<string, string> = {
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  "progress-desc": "Progress (high to low)",
  "progress-asc": "Progress (low to high)",
  chats: "Pending chats",
};

export default function InstructorStudentsPage() {
  const { programmes, students, threads } = usePortalStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  const assignedProgrammes = programmes.filter((p) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(p.id));
  const programmeFilterItems: Record<string, string> = {
    all: "All programmes",
    ...Object.fromEntries(assignedProgrammes.map((p) => [p.id, p.name])),
  };
  const myStudents = useMemo(
    () => students.filter((s) => CURRENT_INSTRUCTOR.assignedProgrammeIds.includes(s.programmeId)),
    [students]
  );

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = myStudents.filter((s) => {
      if (programmeFilter !== "all" && s.programmeId !== programmeFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });

    result = result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      
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

      if (sortBy === "chats") {
        const aThread = threads.find((t) => t.studentId === a.id);
        const bThread = threads.find((t) => t.studentId === b.id);
        const aHasUnread = aThread?.unread ? 1 : 0;
        const bHasUnread = bThread?.unread ? 1 : 0;
        return bHasUnread - aHasUnread;
      }

      return 0;
    });

    return result;
  }, [myStudents, search, programmeFilter, sortBy, programmes, threads]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginated = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, programmeFilter, sortBy]);

  const selected = students.find((s) => s.id === selectedId) ?? null;
  const selectedProgramme = selected ? programmes.find((p) => p.id === selected.programmeId) ?? null : null;

  const goEvaluate = (studentId: string) => {
    setSelectedId(null);
    router.push(`/instructor/evaluations?student=${studentId}`);
  };

  const goChat = (studentId: string) => {
    router.push(`/instructor/messages?student=${studentId}`);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Students</h1>
        <p className="text-muted-foreground mt-1">Everyone enrolled in your assigned programmes.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">Roster</CardTitle>
              <CardDescription>Click a student for full progress and evaluation.</CardDescription>
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
                  {assignedProgrammes.map((p) => (
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
                <TableHead>Written Test</TableHead>
                <TableHead>Messages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((s) => {
                const prog = programmes.find((p) => p.id === s.programmeId);
                const totalModules = prog?.modules.length ?? 0;
                const doneModules = s.moduleProgress.filter((m) => m.completed).length;
                const submitted = s.writtenAnswers.length > 0;
                const pending = s.writtenAnswers.filter((a) => a.score === null).length;
                const thread = threads.find((t) => t.studentId === s.id);
                
                const formattedDate = new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(s.signupDate));

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
                    <TableCell>
                      {!submitted ? (
                        <Badge variant="outline" className="font-normal text-muted-foreground">Not submitted</Badge>
                      ) : pending === 0 ? (
                        <Badge className="bg-green-500/10 text-green-600 border-transparent hover:bg-green-500/20 font-medium">Evaluated</Badge>
                      ) : (
                        <Badge className="bg-[#7e55f6]/10 text-[#7e55f6] border-transparent hover:bg-[#7e55f6]/20 font-medium">Pending review</Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {thread?.unread && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-transparent hover:bg-amber-500/20 shadow-none font-medium">New message</Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={() => goChat(s.id)}>
                          <MessageSquare size={13} className="mr-1.5" />
                          Chat
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
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
        mode="view"
        onClose={() => setSelectedId(null)}
        onEvaluate={goEvaluate}
      />
    </div>
  );
}


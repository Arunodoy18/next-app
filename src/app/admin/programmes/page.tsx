"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable, type DropResult, type DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import ResourcePreviewDialog, { type PreviewTarget } from "@/components/resource-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ASSIGNABLE_ROLES, type McqQuestion, type ModuleItem, type ProgrammeModule, type WrittenQuestion, type AssignableRole, type Programme } from "@/types/programmeDoc";
interface Instructor { id: string; name: string; email: string; verified: boolean; }

import { ROLE_BADGE } from "@/utils/badgeColor";
import {
  Plus,
  Trash2,
  PlayCircle,
  FileText,
  Link2,
  ListChecks,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  Check,
  GraduationCap,
  BookOpen,
  Pencil,
  GripVertical,
  X,
  Loader2,
} from "lucide-react";

const ITEM_META: Record<ModuleItem["type"], { icon: typeof PlayCircle; label: string }> = {
  video: { icon: PlayCircle, label: "Video" },
  pdf: { icon: FileText, label: "PDF" },
  link: { icon: Link2, label: "Link" },
  quiz: { icon: ListChecks, label: "Quiz" },
};

const nextId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

// Turn a route's validation response ({ error: fieldErrors | string }) into a
// human-readable toast so the admin sees which field the server rejected,
// instead of a generic "couldn't save".
async function readSaveError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    const err = body?.error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const first = Object.entries(err).find(
        ([, msgs]) => Array.isArray(msgs) && msgs.length > 0,
      );
      if (first) return `${first[0]}: ${(first[1] as string[])[0]}`;
    }
  } catch {
    /* non-JSON response, fall through */
  }
  return fallback;
}

function moveInArray<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

// A null snapshot means editing just started with no baseline yet, so treat
// it as dirty and let the first save through.
function isDirty<T>(current: T, snapshot: T | null): boolean {
  return !snapshot || JSON.stringify(current) !== JSON.stringify(snapshot);
}

// Mirror the server's validation so blank fields are caught before a save is
// attempted. Returns the first problem found, or null when everything's filled.
function firstCurriculumError(modules: ProgrammeModule[]): string | null {
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m];
    if (!mod.title.trim()) return `Module ${m + 1} needs a title.`;
    if (mod.items.length === 0) return `Module ${m + 1} needs at least one item.`;
    for (const item of mod.items) {
      const label = item.title.trim() || ITEM_META[item.type].label;
      if (!item.title.trim()) return `An item in module ${m + 1} needs a title.`;
      if (item.type === "quiz") {
        if (item.questions.length === 0) return `Quiz "${label}" needs at least one question.`;
        for (const q of item.questions) {
          if (!q.question.trim()) return `A question in quiz "${label}" is empty.`;
          if (q.options.length < 2) return `A question in quiz "${label}" needs at least two options.`;
          if (q.options.some((o) => !o.trim())) return `A question in quiz "${label}" has an empty option.`;
          if (q.answer < 0 || q.answer >= q.options.length)
            return `A question in quiz "${label}" has no correct answer selected.`;
        }
      } else if (!item.url.trim()) {
        return `"${label}" needs a URL.`;
      }
    }
  }
  return null;
}

function firstWrittenTestError(test: WrittenQuestion[]): string | null {
  for (let i = 0; i < test.length; i++) {
    if (!test[i].question.trim()) return `Written test question ${i + 1} is empty.`;
  }
  return null;
}

type ProgrammeKind = "consultant" | "internal";

// The editor has three independently-editable sections that all persist the
// same programme document. Tracking which one triggered the save lets us scope
// the spinner/disabled state to that section's button instead of all three.
type SaveSection = "details" | "curriculum" | "test";

export default function ProgrammesPage() {
  const queryClient = useQueryClient();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [internalProgrammes, setInternalProgrammes] = useState<Programme[]>([]);
  const [savingSection, setSavingSection] = useState<SaveSection | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<ProgrammeKind>("consultant");
  const [preview, setPreview] = useState<PreviewTarget | null>(null);

  const {
    data: allData,
    isLoading,
    isError: programmesErrored,
    refetch: refetchProgrammes,
  } = useQuery<Programme[]>({
    queryKey: ["programmes"],
    queryFn: async () => {
      const res = await fetch("/api/programmes");
      if (!res.ok) throw new Error("Failed to fetch programmes");
      return res.json();
    },
  });

  const {
    data: instructorUsers = [],
    isError: instructorsErrored,
  } = useQuery<Instructor[]>({
    queryKey: ["instructor-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?role=Instructor");
      if (!res.ok) throw new Error("Failed to fetch instructors");
      const users: Array<{ userId: string; name: string; email: string; verified: string }> = await res.json();
      return users.map((u) => ({ id: u.userId, name: u.name, email: u.email, verified: u.verified === "complete" }));
    },
  });

  // A fetch failure would otherwise render as an empty "No programmes yet.",
  // which looks identical to a genuinely empty list, surface it explicitly.
  useEffect(() => {
    if (programmesErrored) toast.error("Couldn't load programmes. Check your connection and try again.");
  }, [programmesErrored]);
  useEffect(() => {
    if (instructorsErrored) toast.error("Couldn't load instructors. Instructor assignment may be incomplete.");
  }, [instructorsErrored]);

  // Tracks whether the currently-open editor has an in-progress edit that
  // hasn't been saved, so switching programmes or closing the tab can warn
  // before silently discarding it.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // Sync server data into the editable local lists during render (not in an
  // effect, which would trigger a cascading re-render). Keep any local,
  // unsaved state — drafts, and the currently-open programme if it has
  // unsaved edits — so a background refetch (e.g. on window refocus) can't
  // silently wipe work in progress.
  const mergeServerData = (prev: Programme[], serverList: Programme[]) => {
    const keepLocal = prev.filter(
      (p) => p.programmeId.startsWith("draft-") || (hasUnsavedChanges && p.programmeId === selectedId)
    );
    const keepIds = new Set(keepLocal.map((p) => p.programmeId));
    return [...keepLocal, ...serverList.filter((p) => !keepIds.has(p.programmeId))];
  };
  const [syncedData, setSyncedData] = useState<Programme[] | undefined>(undefined);
  if (allData && syncedData !== allData) {
    setSyncedData(allData);
    setProgrammes((prev) => mergeServerData(prev, allData.filter((p) => !p.isInternal)));
    setInternalProgrammes((prev) => mergeServerData(prev, allData.filter((p) => p.isInternal)));
  }

  // A draft only gets a real id once it's saved; block creating another
  // programme (in either list) until the current draft has been saved.
  const hasConsultantDraft = programmes.some((p) => p.programmeId.startsWith("draft-"));
  const hasInternalDraft = internalProgrammes.some((p) => p.programmeId.startsWith("draft-"));

  const selected =
    selectedKind === "consultant"
      ? programmes.find((p) => p.programmeId === selectedId) ?? null
      : internalProgrammes.find((p) => p.programmeId === selectedId) ?? null;

  const setForKind = selectedKind === "consultant" ? setProgrammes : setInternalProgrammes;

  const updateProgramme = (id: string, updates: Partial<Programme>) => {
    setForKind((prev) => prev.map((p) => (p.programmeId === id ? { ...p, ...updates } : p)));
  };

  const selectProgramme = (kind: ProgrammeKind, id: string | null) => {
    if (hasUnsavedChanges && (kind !== selectedKind || id !== selectedId)) {
      if (!window.confirm("You have unsaved changes on this programme. Discard them and switch?")) return;
      setHasUnsavedChanges(false);
    }
    setSelectedKind(kind);
    setSelectedId(id);
  };

  // Returns true on success so editors only leave edit mode when the save lands.
  const saveProgramme = async (id: string, section: SaveSection): Promise<boolean> => {
    const programme = [...programmes, ...internalProgrammes].find((p) => p.programmeId === id);
    if (!programme) return false;
    // Never persist an unnamed programme.
    if (!programme.name.trim()) return false;
    setSavingSection(section);
    try {
      const isDraft = id.startsWith("draft-");
      // Drafts live only in local state until the first save: POST to create,
      // then swap the temp id for the real one the DB hands back.
      const { programmeId: _omit, ...payload } = programme;
      void _omit;
      if (isDraft) {
        const res = await fetch("/api/programmes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          toast.error(await readSaveError(res, "Couldn't create the programme."));
          return false;
        }
        const created: Programme = await res.json();
        // Swap the temp draft for the real record in place so the editor stays
        // mounted without a flicker before the refetch lands.
        (programme.isInternal ? setInternalProgrammes : setProgrammes)((prev) =>
          prev.map((p) => (p.programmeId === id ? created : p))
        );
        setSelectedId(created.programmeId);
        toast.success("Programme created");
      } else {
        const res = await fetch(`/api/programmes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.status === 409) {
          // Someone else saved a newer version. Pull the latest in so the editor
          // shows current data, and let the user re-apply their change.
          toast.error("This programme was changed elsewhere. Refreshed to the latest version, please redo your edit.");
          await queryClient.invalidateQueries({ queryKey: ["programmes"] });
          return false;
        }
        if (!res.ok) {
          toast.error(await readSaveError(res, "Couldn't save the programme."));
          return false;
        }
        toast.success("Programme saved");
      }
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
      return true;
    } catch {
      toast.error("Couldn't save the programme. Please try again.");
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const addProgramme = (kind: ProgrammeKind) => {
    const isInternal = kind === "internal";
    // Local-only draft, no DB write until it's named and saved.
    const draft: Programme = {
      programmeId: `draft-${Date.now()}`,
      name: "",
      description: "",
      instructorIds: [],
      modules: [],
      writtenTest: [],
      // Consultant programmes are always the Consultant type; internal programmes pick
      // from the non-consultant roles.
      roles: isInternal ? [] : ["Consultant"],
      isInternal,
    };
    (isInternal ? setInternalProgrammes : setProgrammes)((prev) => [draft, ...prev]);
    selectProgramme(kind, draft.programmeId);
  };

  const deleteProgramme = async (id: string) => {
    // A draft was never persisted, just drop it from local state.
    if (id.startsWith("draft-")) {
      setProgrammes((prev) => prev.filter((p) => p.programmeId !== id));
      setInternalProgrammes((prev) => prev.filter((p) => p.programmeId !== id));
      setSelectedId(null);
      return;
    }
    try {
      const res = await fetch(`/api/programmes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete programme");
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
      setSelectedId(null);
      toast.success("Programme deleted");
    } catch {
      toast.error("Couldn't delete the programme. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Programmes</h1>
        <p className="text-muted-foreground mt-1">
          Build each programme&apos;s curriculum. The content order here is the order consultants see.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[325px_minmax(0,1fr)] gap-4 items-start">
        {/* Programme lists */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-8">
        <Card className="shadow-sm py-3 gap-3">
          <CardHeader className="px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium m-0">Consultant Programmes</CardTitle>
              {hasConsultantDraft || hasInternalDraft ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button size="xs" disabled>
                      <Plus size={12} /> New
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save or discard the current draft first</TooltipContent>
                </Tooltip>
              ) : (
                <Button size="xs" onClick={() => addProgramme("consultant")}>
                  <Plus size={12} /> New
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 flex flex-col gap-1">
            {isLoading && <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>}
            {!isLoading && programmesErrored && (
              <div className="flex flex-col items-center gap-2 px-1 py-3 text-center">
                <p className="text-sm text-destructive m-0">Couldn&apos;t load programmes.</p>
                <Button size="xs" variant="outline" onClick={() => refetchProgrammes()}>Retry</Button>
              </div>
            )}
            {!isLoading && !programmesErrored && programmes.length === 0 && <p className="text-sm text-muted-foreground px-1 py-2">No programmes yet.</p>}
            {programmes.map((p) => {
              const active = selectedKind === "consultant" && p.programmeId === selectedId;
              return (
                <Button
                  key={p.programmeId}
                  onClick={() => selectProgramme("consultant", active ? null : p.programmeId)}
                  variant="ghost"
                  className={`group flex items-center gap-2.5 text-left rounded-lg px-2.5 py-2 h-auto transition-colors border cursor-pointer justify-start w-full whitespace-normal ${
                    active
                      ? "border-primary/40 bg-primary/8"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <span
                    className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <GraduationCap size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium line-clamp-2 ${active ? "text-primary" : "text-foreground"}`}
                    >
                      {p.name || "Untitled Programme"}
                    </span>
                    {(p.roles ?? []).length > 0 && (
                      <span className="flex items-center gap-1 flex-wrap mt-1">
                        {(p.roles ?? []).map((r) => (
                          <Badge key={r} className={`align-middle ${ROLE_BADGE[r]}`}>{r}</Badge>
                        ))}
                      </span>
                    )}
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {p.modules.length} module{p.modules.length === 1 ? "" : "s"} · {(p.instructorIds ?? []).length} instructor
                      {(p.instructorIds ?? []).length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`}
                  />
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Instructor (internal) programmes */}
        <Card className="shadow-sm py-3 gap-3">
          <CardHeader className="px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium m-0">Internal Programmes</CardTitle>
              {hasConsultantDraft || hasInternalDraft ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button size="xs" disabled>
                      <Plus size={12} /> New
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save or discard the current draft first</TooltipContent>
                </Tooltip>
              ) : (
                <Button size="xs" onClick={() => addProgramme("internal")}>
                  <Plus size={12} /> New
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 flex flex-col gap-1">
            {isLoading && <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>}
            {!isLoading && programmesErrored && (
              <div className="flex flex-col items-center gap-2 px-1 py-3 text-center">
                <p className="text-sm text-destructive m-0">Couldn&apos;t load programmes.</p>
                <Button size="xs" variant="outline" onClick={() => refetchProgrammes()}>Retry</Button>
              </div>
            )}
            {!isLoading && !programmesErrored && internalProgrammes.length === 0 && (
              <p className="text-sm text-muted-foreground px-1 py-2">No internal programmes yet.</p>
            )}
            {internalProgrammes.map((p) => {
              const active = selectedKind === "internal" && p.programmeId === selectedId;
              return (
                <Button
                  key={p.programmeId}
                  onClick={() => selectProgramme("internal", active ? null : p.programmeId)}
                  variant="ghost"
                  className={`group flex items-center gap-2.5 text-left rounded-lg px-2.5 py-2 h-auto transition-colors border cursor-pointer justify-start w-full whitespace-normal ${
                    active
                      ? "border-primary/40 bg-primary/8"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <span
                    className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <GraduationCap size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium line-clamp-2 ${active ? "text-primary" : "text-foreground"}`}
                    >
                      {p.name || "Untitled Programme"}
                    </span>
                    {(p.roles ?? []).length > 0 && (
                      <span className="flex items-center gap-1 flex-wrap mt-1">
                        {(p.roles ?? []).map((r) => (
                          <Badge key={r} className={`align-middle ${ROLE_BADGE[r]}`}>{r}</Badge>
                        ))}
                      </span>
                    )}
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {p.modules.length} module{p.modules.length === 1 ? "" : "s"} · {(p.instructorIds ?? []).length} instructor
                      {(p.instructorIds ?? []).length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`}
                  />
                </Button>
              );
            })}
          </CardContent>
        </Card>
        </div>

        {/* Editor */}
        {selected ? (
          <ProgrammeEditor
            key={selected.programmeId}
            programme={selected}
            onChange={(updates) => updateProgramme(selected.programmeId, updates)}
            onDelete={() => deleteProgramme(selected.programmeId)}
            onSave={(section) => saveProgramme(selected.programmeId, section)}
            savingSection={savingSection}
            onPreview={setPreview}
            instructors={instructorUsers}
            onDirtyChange={setHasUnsavedChanges}
          />
        ) : (
          <Card className="shadow-sm">
            <CardContent className="py-20 flex flex-col items-center text-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-medium m-0">Pick a programme to edit</p>
                <p className="text-sm text-muted-foreground m-0 mt-1">
                  Select one from the list, or create a new programme to start building its curriculum.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ResourcePreviewDialog target={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

/* ================= Programme editor ================= */

function ProgrammeEditor({
  programme,
  onChange,
  onDelete,
  onSave,
  savingSection,
  onPreview,
  instructors,
  onDirtyChange,
}: {
  programme: Programme;
  onChange: (updates: Partial<Programme>) => void;
  onDelete: () => Promise<void>;
  onSave: (section: SaveSection) => Promise<boolean>;
  savingSection: SaveSection | null;
  onPreview: (target: PreviewTarget) => void;
  instructors: Instructor[];
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(programme.modules.slice(0, 1).map((m) => m.moduleId))
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // A brand-new programme (no name yet) opens straight in edit mode and hides
  // the Edit button until it has been saved once.
  const [isNew, setIsNew] = useState(() => !programme.name.trim());
  const [editingDetails, setEditingDetails] = useState(() => !programme.name.trim());
  const [nameError, setNameError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  // Until the programme is saved (still a local draft), curriculum and the
  // written test can't be edited, there's no record to attach them to yet.
  const isDraft = programme.programmeId.startsWith("draft-");

  const [detailsSnapshot, setDetailsSnapshot] = useState<Partial<Programme> | null>(null);
  const startEditDetails = () => {
    setDetailsSnapshot({
      name: programme.name,
      description: programme.description,
      instructorIds: programme.instructorIds,
      roles: programme.roles,
    });
    setEditingDetails(true);
  };
  const saveDetails = async () => {
    // Name and at least one type are required, surface inline errors for both
    // at once instead of returning after the first failure.
    const noName = !programme.name.trim();
    const noRole = (programme.roles ?? []).length === 0;
    setNameError(noName);
    setRoleError(noRole);
    if (noName || noRole) return;
    if (await onSave("details")) {
      setEditingDetails(false);
      setIsNew(false);
    }
  };
  const cancelDetails = () => {
    if (detailsSnapshot) onChange(detailsSnapshot);
    setEditingDetails(false);
  };

  const [editingTest, setEditingTest] = useState(false);
  const [editing, setEditing] = useState(false);

  // Curriculum edit: snapshot modules so Cancel can discard changes. Opening
  // edit on an empty curriculum seeds the first module automatically.
  const [modulesSnapshot, setModulesSnapshot] = useState<ProgrammeModule[] | null>(null);
  const startEditCurriculum = () => {
    setModulesSnapshot(programme.modules);
    setEditing(true);
    if (programme.modules.length === 0) addModule();
  };
  const cancelCurriculum = () => {
    if (modulesSnapshot) onChange({ modules: modulesSnapshot });
    setEditing(false);
  };

  // Written test edit: same pattern, snapshot for Cancel, seed first question
  // when opening edit on an empty test.
  const [testSnapshot, setTestSnapshot] = useState<WrittenQuestion[] | null>(null);
  const startEditTest = () => {
    setTestSnapshot(programme.writtenTest);
    setEditingTest(true);
    if (programme.writtenTest.length === 0) {
      onChange({ writtenTest: [{ questionId: nextId("w"), question: "" }] });
    }
  };
  const cancelTest = () => {
    if (testSnapshot) onChange({ writtenTest: testSnapshot });
    setEditingTest(false);
  };

  // Each section's Save is disabled until something actually changes since edit started.
  const detailsDirty = isDirty(
    { name: programme.name, description: programme.description, instructorIds: programme.instructorIds, roles: programme.roles },
    detailsSnapshot
  );
  const curriculumDirty = isDirty(programme.modules, modulesSnapshot);
  const testDirty = isDirty(programme.writtenTest, testSnapshot);

  // A brand-new draft counts as "dirty" for the Save button the instant it's
  // created (so Save is reachable and can show the name-required error), but
  // that shouldn't nag the user with a discard-confirm if they haven't
  // actually typed anything into it yet.
  const isUntouchedDraft =
    isNew &&
    !programme.name.trim() &&
    !(programme.description ?? "").trim() &&
    (programme.instructorIds ?? []).length === 0 &&
    JSON.stringify(programme.roles ?? []) === JSON.stringify(programme.isInternal ? [] : ["Consultant"]);

  const anyUnsaved =
    (editingDetails && !isUntouchedDraft && detailsDirty) ||
    (editing && curriculumDirty) ||
    (editingTest && testDirty);

  // Only one section can be in edit mode at a time: saving a section always
  // PUTs the whole programme, so a placeholder module/question left open in
  // another section would fail validation on an unrelated save.
  const otherSectionEditing = (section: SaveSection) =>
    (section !== "details" && editingDetails) ||
    (section !== "curriculum" && editing) ||
    (section !== "test" && editingTest);

  useEffect(() => {
    onDirtyChange?.(anyUnsaved);
  }, [anyUnsaved, onDirtyChange]);

  useEffect(() => {
    return () => onDirtyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateModule = (moduleId: string, updates: Partial<ProgrammeModule>) => {
    onChange({ modules: programme.modules.map((m) => (m.moduleId === moduleId ? { ...m, ...updates } : m)) });
  };

  const addModule = () => {
    const created: ProgrammeModule = { moduleId: nextId("mod"), title: "", items: [] };
    onChange({ modules: [...programme.modules, created] });
    setExpandedModules((prev) => new Set(prev).add(created.moduleId));
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "module") {
      onChange({ modules: moveInArray(programme.modules, source.index, destination.index) });
      return;
    }

    if (type === "item") {
      const moduleId = source.droppableId.replace("items-", "");
      const mod = programme.modules.find((m) => m.moduleId === moduleId);
      if (!mod) return;
      const reorderedItems = moveInArray(mod.items, source.index, destination.index);
      onChange({
        modules: programme.modules.map((m) => (m.moduleId === moduleId ? { ...m, items: reorderedItems } : m)),
      });
      return;
    }

    if (type === "quiz") {
      const itemId = source.droppableId.replace("quiz-", "");
      for (const m of programme.modules) {
        const item = m.items.find((i) => i.resourceId === itemId);
        if (item && item.type === "quiz") {
          const reorderedQuestions = moveInArray(item.questions, source.index, destination.index);
          const newItems = m.items.map((i) => (i.resourceId === itemId ? { ...i, questions: reorderedQuestions } : i));
          onChange({
            modules: programme.modules.map((mod) => (mod.moduleId === m.moduleId ? { ...mod, items: newItems } : mod)),
          });
          return;
        }
      }
    }
  };

  const toggleInstructor = (instructorId: string) => {
    const current = programme.instructorIds ?? [];
    onChange({
      instructorIds: current.includes(instructorId)
        ? current.filter((id) => id !== instructorId)
        : [...current, instructorId],
    });
  };

  const toggleRole = (role: AssignableRole) => {
    const current = programme.roles ?? [];
    const next = current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
    if (next.length > 0) setRoleError(false);
    onChange({ roles: next });
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Details */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium m-0">Programme Details</CardTitle>
            <CardDescription>Name the programme and assign its instructors.</CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isNew && (
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} /> Delete
              </Button>
            )}
            {!isNew && !editingDetails && (
              otherSectionEditing("details") ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button size="sm" variant="outline" disabled>
                      <Pencil size={14} /> Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Finish or cancel the other section you&apos;re editing first.</TooltipContent>
                </Tooltip>
              ) : (
                <Button size="sm" variant="outline" onClick={startEditDetails}>
                  <Pencil size={14} /> Edit
                </Button>
              )
            )}
            {editingDetails && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={isNew ? onDelete : cancelDetails}
                >
                  <X size={14} /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveDetails}
                  disabled={savingSection === "details" || !detailsDirty}
                >
                  {savingSection === "details" ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Save</>}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {editingDetails ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="programme-name">Name</Label>
                <Input
                  id="programme-name"
                  value={programme.name}
                  onChange={(e) => {
                    onChange({ name: e.target.value });
                    if (nameError && e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="Enter the programme name"
                  aria-invalid={nameError}
                />
                {nameError && <p className="text-xs text-destructive m-0">Name is required</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="programme-description">Description</Label>
                <Textarea
                  id="programme-description"
                  value={programme.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Enter the programme description"
                  className="min-h-16 resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Instructors</Label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {instructors.map((ins) => {
                    const assigned = (programme.instructorIds ?? []).includes(ins.id);
                    const button = (
                      <Button
                        type="button"
                        onClick={() => toggleInstructor(ins.id)}
                        disabled={!ins.verified}
                        title={ins.verified ? ins.email : undefined}
                        variant={assigned ? "default" : "outline"}
                        size="sm"
                        className="inline-flex items-center gap-1.5"
                      >
                        {assigned ? <Check size={12} /> : <Plus size={12} />}
                        {ins.name}
                        {!ins.verified && <span className="text-[10px] opacity-70">(pending)</span>}
                      </Button>
                    );
                    if (ins.verified) return <span key={ins.id}>{button}</span>;
                    return (
                      <Tooltip key={ins.id}>
                        <TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger>
                        <TooltipContent>{ins.email}, pending verification</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground m-0">
                  Tap an instructor to assign or remove them. Instructors pending verification can&apos;t be assigned.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Consultant programmes only offer the Consultant type; internal
                      programmes offer the other four roles. */}
                  {(programme.isInternal
                    ? ASSIGNABLE_ROLES.filter((r) => r !== "Consultant")
                    : (["Consultant"] as AssignableRole[])
                  ).map((r) => {
                    const on = (programme.roles ?? []).includes(r);
                    const pill = (
                      <Button
                        type="button"
                        onClick={() => toggleRole(r)}
                        disabled={!programme.isInternal}
                        variant="outline"
                        size="sm"
                        className={`inline-flex items-center h-7 rounded-full px-2.5 text-xs font-medium transition-all ${ROLE_BADGE[r]} ${
                          on ? "ring-2 ring-current ring-offset-1 ring-offset-background" : "opacity-40 hover:opacity-75"
                        } ${!programme.isInternal ? "cursor-default" : ""}`}
                      >
                        {r}
                      </Button>
                    );
                    if (programme.isInternal) return <span key={r}>{pill}</span>;
                    return (
                      <Tooltip key={r}>
                        <TooltipTrigger render={<span className="inline-flex" />}>{pill}</TooltipTrigger>
                        <TooltipContent>Consultant programmes are always the Consultant type</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <p className={`text-xs m-0 ${roleError ? "text-destructive" : "text-muted-foreground"}`}>
                  {roleError
                    ? "Select at least one type."
                    : programme.isInternal
                    ? "Select one or more types this programme serves."
                    : "Consultant programmes are for consultants only."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Name</Label>
                <p className="text-base text-foreground mt-1">{programme.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Description</Label>
                <p className="text-sm text-foreground mt-1 leading-relaxed whitespace-pre-wrap">
                  {programme.description || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2 block">Instructors</Label>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {(programme.instructorIds ?? []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">-</span>
                  ) : (
                    (programme.instructorIds ?? []).map((id) => {
                      const ins = instructors.find((i) => i.id === id);
                      if (!ins) return null;
                      return (
                        <div key={id} className="inline-flex items-center gap-1.5 h-7 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground" title={ins.email}>
                          {ins.name}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2 block">Type</Label>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {(programme.roles ?? []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">-</span>
                  ) : (
                    (programme.roles ?? []).map((r) => <Badge key={r} className={`align-middle ${ROLE_BADGE[r]}`}>{r}</Badge>)
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Curriculum */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base font-medium m-0">Curriculum</CardTitle>
            <CardDescription>
              {isDraft
                ? "Save the programme details first, then build its curriculum."
                : editing
                ? "Drag the handle to reorder. Add videos, PDFs, links, or quizzes to each module."
                : "The order shown here is the order consultants see."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing && (
              <Button size="sm" variant="outline" onClick={addModule}>
                <Plus size={14} /> Module
              </Button>
            )}
            {editing && (
              <Button size="sm" variant="outline" onClick={cancelCurriculum}>
                <X size={14} /> Cancel
              </Button>
            )}
            {(() => {
              const blockedByOtherSection = !editing && otherSectionEditing("curriculum");
              const button = (
                <Button
                  size="sm"
                  variant={editing ? "default" : "outline"}
                  disabled={
                    isDraft || savingSection === "curriculum" || (editing && !curriculumDirty) || blockedByOtherSection
                  }
                  onClick={async () => {
                    if (editing) {
                      const err = firstCurriculumError(programme.modules);
                      if (err) { toast.error(err); return; }
                      if (await onSave("curriculum")) setEditing(false);
                    } else startEditCurriculum();
                  }}
                >
                  {savingSection === "curriculum" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editing ? (
                    <>
                      <Check size={14} /> Save
                    </>
                  ) : (
                    <>
                      <Pencil size={14} /> Edit
                    </>
                  )}
                </Button>
              );
              if (!blockedByOtherSection) return button;
              return (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger>
                  <TooltipContent>Finish or cancel the other section you&apos;re editing first.</TooltipContent>
                </Tooltip>
              );
            })()}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="modules" type="module">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3">
                  {programme.modules.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      {editing ? "No modules yet. Add the first module to start building." : "No modules added yet."}
                    </p>
                  )}
                  {programme.modules.map((module, mIndex) => (
                    <Draggable key={module.moduleId} draggableId={module.moduleId} index={mIndex} isDragDisabled={!editing}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          <ModuleCard
                            module={module}
                            index={mIndex}
                            editing={editing}
                            expanded={expandedModules.has(module.moduleId)}
                            onToggle={() => toggleModule(module.moduleId)}
                            onUpdate={(updates) => updateModule(module.moduleId, updates)}
                            onRemove={() => onChange({ modules: programme.modules.filter((m) => m.moduleId !== module.moduleId) })}
                            onPreview={onPreview}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Written test */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium m-0">Programme-End Written Test</CardTitle>
            <CardDescription>
              {isDraft
                ? "Save the programme details first, then add the written test."
                : "Free-text questions, evaluated by assigned instructors."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editingTest && (
              <Button size="sm" variant="outline" onClick={cancelTest}>
                <X size={14} /> Cancel
              </Button>
            )}
            {(() => {
              const blockedByOtherSection = !editingTest && otherSectionEditing("test");
              const button = (
                <Button
                  size="sm"
                  variant={editingTest ? "default" : "outline"}
                  disabled={
                    isDraft || savingSection === "test" || (editingTest && !testDirty) || blockedByOtherSection
                  }
                  onClick={async () => {
                    if (editingTest) {
                      const err = firstWrittenTestError(programme.writtenTest);
                      if (err) { toast.error(err); return; }
                      if (await onSave("test")) setEditingTest(false);
                    } else startEditTest();
                  }}
                >
                  {savingSection === "test" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingTest ? (
                    <>
                      <Check size={14} /> Save
                    </>
                  ) : (
                    <>
                      <Pencil size={14} /> Edit
                    </>
                  )}
                </Button>
              );
              if (!blockedByOtherSection) return button;
              return (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger>
                  <TooltipContent>Finish or cancel the other section you&apos;re editing first.</TooltipContent>
                </Tooltip>
              );
            })()}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {programme.writtenTest.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No questions added.</p>
          )}
          {programme.writtenTest.map((w, i) => (
            <div key={w.questionId} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground shrink-0 mt-2.5 w-4 text-right">{i + 1}.</span>
              {editingTest ? (
                <Textarea
                  value={w.question}
                  placeholder="Write the question"
                  onChange={(e) =>
                    onChange({
                      writtenTest: programme.writtenTest.map((q) =>
                        q.questionId === w.questionId ? { ...q, question: e.target.value } : q
                      ),
                    })
                  }
                  className="flex-1 min-h-12 resize-none"
                />
              ) : (
                <p className="flex-1 text-sm text-foreground m-0 mt-2 whitespace-pre-wrap">
                  {w.question}
                </p>
              )}
              {editingTest && (
                <Button
                  variant="destructive"
                  size="icon-sm"
                  title="Remove question"
                  onClick={() => onChange({ writtenTest: programme.writtenTest.filter((q) => q.questionId !== w.questionId) })}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
          {editingTest && (
            <Button
              variant="outline"
              size="sm"
              className="self-start mt-1"
              onClick={() => onChange({ writtenTest: [...programme.writtenTest, { questionId: nextId("w"), question: "" }] })}
            >
              <Plus size={14} /> Add Question
            </Button>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={(open) => !deleting && setConfirmDelete(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete programme?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{programme.name}&rdquo; and all its modules, quizzes, and tests will be
              removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setDeleting(true);
                try {
                  await onDelete();
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================= Module card ================= */

function ModuleCard({
  module,
  index,
  editing,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onPreview,
  dragHandleProps,
}: {
  module: ProgrammeModule;
  index: number;
  editing: boolean;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<ProgrammeModule>) => void;
  onRemove: () => void;
  onPreview: (target: PreviewTarget) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}) {
  const lessonCount = module.items.filter((i) => i.type !== "quiz").length;
  const quizCount = module.items.filter((i) => i.type === "quiz").length;

  const addItem = (type: ModuleItem["type"]) => {
    const item: ModuleItem =
      type === "quiz"
        ? { resourceId: nextId("item"), type: "quiz", title: "", questions: [] }
        : { resourceId: nextId("item"), type, title: "", url: "" };
    onUpdate({ items: [...module.items, item] });
  };

  const updateItem = (itemId: string, updates: Partial<ModuleItem>) => {
    onUpdate({
      items: module.items.map((it) => (it.resourceId === itemId ? ({ ...it, ...updates } as ModuleItem) : it)),
    });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-2 py-2 bg-muted/40">
        {editing && (
          <div {...dragHandleProps} className="flex items-center justify-center p-1.5 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-grab active:cursor-grabbing">
            <GripVertical size={14} />
          </div>
        )}
        <Button
          type="button"
          onClick={onToggle}
          title={expanded ? "Collapse module" : "Expand module"}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 shrink-0 rounded-md px-1.5 py-1 hover:bg-muted transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="size-6 rounded-md bg-background border border-border text-xs font-medium text-muted-foreground flex items-center justify-center">
            {index + 1}
          </span>
        </Button>
        {editing ? (
          <Input
            value={module.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={`Module ${index + 1} title`}
            className="flex-1 h-9 min-w-24 font-medium bg-background"
          />
        ) : (
          <Button type="button" onClick={onToggle} variant="ghost" className="flex-1 min-w-0 h-auto text-left justify-start">
            <span className="block text-sm font-medium truncate">
              {module.title || `Module ${index + 1}`}
            </span>
          </Button>
        )}
        <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:inline px-1">
          {lessonCount} lesson{lessonCount === 1 ? "" : "s"} · {quizCount} quiz{quizCount === 1 ? "" : "zes"}
        </span>
        {editing && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="destructive"
              size="icon-sm"
              title="Delete module"
              onClick={onRemove}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <Droppable droppableId={"items-" + module.moduleId} type="item">
          {(provided) => (
            <div className="p-2.5 flex flex-col gap-1.5" ref={provided.innerRef} {...provided.droppableProps}>
              {module.items.length === 0 && (
                <p className="text-sm text-muted-foreground py-2 px-1">
                  {editing ? "This module is empty. Add videos, PDFs, links, or a quiz below." : "No content yet."}
                </p>
              )}
              {module.items.map((item, iIndex) => (
                <Draggable key={item.resourceId} draggableId={item.resourceId} index={iIndex} isDragDisabled={!editing}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <ContentItemRow
                        item={item}
                        editing={editing}
                        onUpdate={(updates) => updateItem(item.resourceId, updates)}
                        onRemove={() => onUpdate({ items: module.items.filter((it) => it.resourceId !== item.resourceId) })}
                        onPreview={onPreview}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {editing && (
                <div className="flex justify-end mt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="default"
                          size="sm"
                          className="shadow-sm"
                        />
                      }
                    >
                      <Plus size={14} /> Add content
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      {(Object.keys(ITEM_META) as ModuleItem["type"][]).map((type) => {
                        const Meta = ITEM_META[type];
                        return (
                          <DropdownMenuItem key={type} onClick={() => addItem(type)}>
                            <Meta.icon size={15} className="text-primary" />
                            {Meta.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}

/* ================= Content item row ================= */

function ContentItemRow({
  item,
  editing,
  onUpdate,
  onRemove,
  onPreview,
  dragHandleProps,
}: {
  item: ModuleItem;
  editing: boolean;
  onUpdate: (updates: Partial<ModuleItem>) => void;
  onRemove: () => void;
  onPreview: (target: PreviewTarget) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}) {
  // A freshly added quiz has no questions yet, open it expanded so the builder
  // is ready to type into instead of needing an extra click.
  const [quizOpen, setQuizOpen] = useState(() => item.type === "quiz" && item.questions.length === 0);
  const Meta = ITEM_META[item.type];

  const dragHandle = (
    <div {...dragHandleProps} className="flex items-center justify-center p-1.5 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-grab active:cursor-grabbing">
      <GripVertical size={14} />
    </div>
  );

  const actions = (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="destructive"
        size="icon-sm"
        title="Remove"
        onClick={onRemove}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );

  if (item.type !== "quiz") {
    // Read-only view: a clean single row.
    if (!editing) {
      return (
        <div className="rounded-lg border border-border bg-card px-2.5 py-2 flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Meta.icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium m-0 truncate">{item.title || Meta.label}</p>
            <p className="text-xs text-muted-foreground m-0 truncate font-mono">{item.url}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8 text-xs text-primary"
            disabled={!item.url}
            onClick={() => onPreview({ type: item.type, title: item.title, url: item.url })}
          >
            <Eye size={13} /> Preview
          </Button>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-border bg-card px-2.5 py-2 flex items-start gap-2">
        {dragHandle}
        <div className="size-7 mt-1 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Meta.icon size={14} />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-10 shrink-0 hidden sm:inline mt-2.5">
          {Meta.label}
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <Input
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={`${Meta.label} title`}
            className="h-9 w-full"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs text-primary shrink-0"
              disabled={!item.url}
              onClick={() => onPreview({ type: item.type, title: item.title, url: item.url })}
            >
              <Eye size={13} /> Preview
            </Button>
            <div className="relative flex-1 min-w-0">
              <Link2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={item.url}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder={
                  item.type === "link"
                    ? "Paste a link (https://example.com)"
                    : item.type === "video"
                    ? "Paste the Vimeo link (vimeo.com/...)"
                    : `Paste the ${Meta.label.toLowerCase()} URL`
                }
                className="h-9 w-full pl-8 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-1">{actions}</div>
      </div>
    );
  }

  // Quiz read-only view.
  if (!editing) {
    return (
      <div className="rounded-lg border border-primary/25 bg-card overflow-hidden">
        <Button
          type="button"
          onClick={() => setQuizOpen((v) => !v)}
          variant="ghost"
          className="w-full flex items-center gap-2 px-2.5 py-2 h-auto text-left hover:bg-muted/40 transition-colors justify-start"
        >
          <div className="size-7 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
            <Meta.icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium m-0 truncate">{item.title || "Quiz"}</p>
            <p className="text-xs text-muted-foreground m-0">
              {item.questions.length} question{item.questions.length === 1 ? "" : "s"}
            </p>
          </div>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted-foreground transition-transform ${quizOpen ? "rotate-180" : ""}`}
          />
        </Button>

        {quizOpen && (
          <div className="px-2.5 pb-2.5 pt-1 flex flex-col gap-3 border-t border-border">
            {item.questions.length === 0 ? (
              <p className="text-xs text-muted-foreground m-0 px-1 py-1">No questions added.</p>
            ) : (
              item.questions.map((q, qIndex) => (
                <div key={q.mcqId} className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium m-0">
                    <span className="text-muted-foreground mr-1.5">{qIndex + 1}.</span>
                    {q.question}
                  </p>
                  <div className="flex flex-col gap-1 pl-5">
                    {q.options.map((opt, oIndex) => {
                      const correct = q.answer === oIndex;
                      return (
                        <div
                          key={oIndex}
                          className={`flex items-center gap-2 text-xs ${
                            correct ? "text-primary font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {correct ? (
                            <Check size={13} className="shrink-0 text-primary" />
                          ) : (
                            <span className="size-3 rounded-full border border-muted-foreground/30 shrink-0" />
                          )}
                          <span>{opt || `Option ${oIndex + 1}`}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Quiz item: collapsible question builder (edit mode)
  return (
    <div className="rounded-lg border border-primary/25 bg-card">
      <div className="flex items-center gap-2 px-2.5 py-2">
        {dragHandle}
        <div className="size-7 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
          <Meta.icon size={14} />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-10 shrink-0 hidden sm:inline">Quiz</span>
        <Input
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Quiz title"
          className="flex-1 h-9 min-w-0 font-medium bg-background"
        />
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs hidden sm:flex"
          onClick={() => setQuizOpen(!quizOpen)}
        >
          {item.questions.length} question{item.questions.length === 1 ? "" : "s"}
          {quizOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </Button>
        {actions}
      </div>
      <div className="px-2.5 pb-2 sm:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-xs"
          onClick={() => setQuizOpen(!quizOpen)}
        >
          {item.questions.length} question{item.questions.length === 1 ? "" : "s"}
          {quizOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </Button>
      </div>

      {quizOpen && (
        <Droppable droppableId={"quiz-" + item.resourceId} type="quiz">
          {(provided) => (
            <div className="px-2.5 pb-2.5 flex flex-col gap-2" ref={provided.innerRef} {...provided.droppableProps}>
              {item.questions.length === 0 && (
                <p className="text-xs text-muted-foreground m-0 px-1">
                  No questions yet. Add one below and pick the correct answer with the radio button.
                </p>
              )}
              {item.questions.map((q, qIndex) => (
                <Draggable key={q.mcqId} draggableId={q.mcqId} index={qIndex} isDragDisabled={!editing}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <McqEditor
                        question={q}
                        onUpdate={(updates) =>
                          onUpdate({ questions: item.questions.map((x) => (x.mcqId === q.mcqId ? { ...x, ...updates } : x)) })
                        }
                        onRemove={() => onUpdate({ questions: item.questions.filter((x) => x.mcqId !== q.mcqId) })}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <Button
                variant="outline"
                size="xs"
                className="self-start mt-1"
                onClick={() =>
                  onUpdate({
                    questions: [
                      ...item.questions,
                      { mcqId: nextId("q"), question: "", options: ["", ""], answer: 0 },
                    ],
                  })
                }
              >
                <Plus size={12} /> Question
              </Button>
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}

function McqEditor({
  question,
  onUpdate,
  onRemove,
  dragHandleProps,
}: {
  question: McqQuestion;
  onUpdate: (updates: Partial<McqQuestion>) => void;
  onRemove: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <div {...dragHandleProps} className="flex items-center justify-center p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-grab active:cursor-grabbing">
          <GripVertical size={14} />
        </div>
        <Input
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          className="flex-1 h-9 font-medium max-w-xl"
          placeholder="Question"
        />
        <Button
          variant="destructive"
          size="icon-sm"
          title="Remove question"
          onClick={onRemove}
        >
          <Trash2 size={14} />
        </Button>
      </div>
      <div className="flex flex-col gap-1 pl-8">
        {question.options.map((opt, oIndex) => (
          <div key={oIndex} className="flex items-center gap-2">
            <input
              type="radio"
              checked={question.answer === oIndex}
              onChange={() => onUpdate({ answer: oIndex })}
              className="accent-primary"
              title="Mark as correct answer"
            />
            <div className="max-w-xl min-w-0">
              <Input
                value={opt}
                onChange={(e) => {
                  const options = [...question.options];
                  options[oIndex] = e.target.value;
                  onUpdate({ options });
                }}
                className={`h-8 text-xs pl-3 ${question.answer === oIndex ? "text-primary font-medium" : ""}`}
                placeholder={`Option ${oIndex + 1}`}
              />
            </div>
            {/* A question must keep at least two options, so the remove control
                only appears once there are more than two. */}
            {question.options.length > 2 && (
              <Button
                variant="destructive"
                size="icon-xs"
                title="Remove option"
                onClick={() => {
                  const options = question.options.filter((_, i) => i !== oIndex);
                  onUpdate({ options, answer: question.answer >= options.length ? 0 : question.answer });
                }}
              >
                <X size={12} />
              </Button>
            )}
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground m-0 mt-0.5">The selected radio marks the correct answer.</p>
        <Button
          variant="outline"
          size="xs"
          className="self-start mt-0.5"
          onClick={() => onUpdate({ options: [...question.options, ""] })}
        >
          <Plus size={12} /> Option
        </Button>
      </div>
    </div>
  );
}

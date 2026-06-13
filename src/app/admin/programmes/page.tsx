"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ResourcePreviewDialog, { type PreviewTarget } from "@/components/resource-preview-dialog";
import { usePortalStore } from "@/lib/portal-store";
import {
  INSTRUCTORS,
  type Programme,
  type ProgrammeModule,
  type ModuleItem,
  type McqQuestion,
} from "@/lib/mock-data";
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
  ExternalLink,
  Check,
  GraduationCap,
  BookOpen,
  Pencil,
} from "lucide-react";

const ITEM_META: Record<ModuleItem["type"], { icon: typeof PlayCircle; label: string }> = {
  video: { icon: PlayCircle, label: "Video" },
  pdf: { icon: FileText, label: "PDF" },
  link: { icon: Link2, label: "Link" },
  quiz: { icon: ListChecks, label: "Quiz" },
};

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

function moveInArray<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export default function ProgrammesPage() {
  const { programmes, setProgrammes } = usePortalStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewTarget | null>(null);

  const selected = programmes.find((p) => p.id === selectedId) ?? null;

  const updateProgramme = (id: string, updates: Partial<Programme>) => {
    setProgrammes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addProgramme = () => {
    const created: Programme = {
      id: nextId("p"),
      name: "Untitled Programme",
      description: "",
      instructorIds: [],
      modules: [],
      writtenTest: [],
    };
    setProgrammes((prev) => [...prev, created]);
    setSelectedId(created.id);
  };

  const deleteProgramme = (id: string) => {
    setProgrammes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Programmes</h1>
        <p className="text-muted-foreground mt-1">
          Build each programme&apos;s curriculum. The content order here is the order students see.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 items-start">
        {/* Programme list */}
        <Card className="shadow-sm py-3 gap-3 lg:sticky lg:top-8">
          <CardHeader className="px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium m-0">All programmes</CardTitle>
              <Button size="xs" className="bg-[#7e55f6] hover:bg-[#6742d4] text-white" onClick={addProgramme}>
                <Plus size={12} /> New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 flex flex-col gap-1">
            {programmes.length === 0 && <p className="text-sm text-muted-foreground px-1 py-2">No programmes yet.</p>}
            {programmes.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`group flex items-center gap-2.5 text-left rounded-lg px-2.5 py-2 transition-colors border ${
                    active
                      ? "border-[#7e55f6]/40 bg-[#7e55f6]/8"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <span
                    className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-[#7e55f6] text-white" : "bg-[#7e55f6]/10 text-[#7e55f6]"
                    }`}
                  >
                    <GraduationCap size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium line-clamp-1 ${active ? "text-[#7e55f6]" : "text-foreground"}`}
                    >
                      {p.name || "Untitled Programme"}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {p.modules.length} module{p.modules.length === 1 ? "" : "s"} · {p.instructorIds.length} instructor
                      {p.instructorIds.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition-colors ${
                      active ? "text-[#7e55f6]" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`}
                  />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Editor */}
        {selected ? (
          <ProgrammeEditor
            key={selected.id}
            programme={selected}
            onChange={(updates) => updateProgramme(selected.id, updates)}
            onDelete={() => deleteProgramme(selected.id)}
            onPreview={setPreview}
          />
        ) : (
          <Card className="shadow-sm">
            <CardContent className="py-20 flex flex-col items-center text-center gap-3">
              <div className="size-12 rounded-xl bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-medium m-0">Pick a programme to edit</p>
                <p className="text-sm text-muted-foreground m-0 mt-1">
                  Select one from the list, or create a new programme to start building its curriculum.
                </p>
              </div>
              <Button size="sm" className="bg-[#7e55f6] hover:bg-[#6742d4] text-white" onClick={addProgramme}>
                <Plus size={14} /> New Programme
              </Button>
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
  onPreview,
}: {
  programme: Programme;
  onChange: (updates: Partial<Programme>) => void;
  onDelete: () => void;
  onPreview: (target: PreviewTarget) => void;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(programme.modules.slice(0, 1).map((m) => m.id))
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateModule = (moduleId: string, updates: Partial<ProgrammeModule>) => {
    onChange({ modules: programme.modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)) });
  };

  const addModule = () => {
    const created: ProgrammeModule = { id: nextId("mod"), title: "", items: [] };
    onChange({ modules: [...programme.modules, created] });
    setExpandedModules((prev) => new Set(prev).add(created.id));
  };

  const toggleInstructor = (instructorId: string) => {
    onChange({
      instructorIds: programme.instructorIds.includes(instructorId)
        ? programme.instructorIds.filter((id) => id !== instructorId)
        : [...programme.instructorIds, instructorId],
    });
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
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive shrink-0"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={14} /> Delete
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="programme-name">Name</Label>
            <Input
              id="programme-name"
              value={programme.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Investment Banking Foundations"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="programme-description">Description</Label>
            <Textarea
              id="programme-description"
              value={programme.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="A short summary of what students will learn"
              className="min-h-16 resize-none"
            />
          </div>
          {/* Instructor assignment: click a chip to assign or unassign */}
          <div className="flex flex-col gap-1.5">
            <Label>Instructors</Label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {INSTRUCTORS.map((ins) => {
                const assigned = programme.instructorIds.includes(ins.id);
                return (
                  <button
                    key={ins.id}
                    type="button"
                    onClick={() => toggleInstructor(ins.id)}
                    title={ins.email}
                    className={`inline-flex items-center gap-1.5 h-7 rounded-full border px-2.5 text-xs font-medium transition-colors ${
                      assigned
                        ? "border-transparent bg-[#7e55f6] text-white hover:bg-[#6742d4]"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {assigned ? <Check size={12} /> : <Plus size={12} />}
                    {ins.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground m-0">Tap an instructor to assign or remove them.</p>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base font-medium m-0">Curriculum</CardTitle>
            <CardDescription>
              {editing
                ? "Drag the handle to reorder. Add videos, PDFs, links, or quizzes to each module."
                : "The order shown here is the order students see."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing && (
              <Button size="sm" variant="outline" onClick={addModule}>
                <Plus size={14} /> Module
              </Button>
            )}
            <Button
              size="sm"
              className={editing ? "bg-[#7e55f6] hover:bg-[#6742d4] text-white" : ""}
              variant={editing ? "default" : "outline"}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? (
                <>
                  <Check size={14} /> Done
                </>
              ) : (
                <>
                  <Pencil size={14} /> Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {programme.modules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {editing ? "No modules yet. Add the first module to start building." : "No modules added yet."}
            </p>
          )}
          {programme.modules.map((module, mIndex) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={mIndex}
              total={programme.modules.length}
              editing={editing}
              expanded={expandedModules.has(module.id)}
              onToggle={() => toggleModule(module.id)}
              onUpdate={(updates) => updateModule(module.id, updates)}
              onMove={(dir) => onChange({ modules: moveInArray(programme.modules, mIndex, mIndex + dir) })}
              onRemove={() => onChange({ modules: programme.modules.filter((m) => m.id !== module.id) })}
              onPreview={onPreview}
            />
          ))}
        </CardContent>
      </Card>

      {/* Written test */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium m-0">Programme-End Written Test</CardTitle>
            <CardDescription>Free-text questions, evaluated by assigned instructors.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ writtenTest: [...programme.writtenTest, { id: nextId("w"), question: "" }] })}
          >
            <Plus size={14} /> Add Question
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {programme.writtenTest.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No questions yet.</p>
          )}
          {programme.writtenTest.map((w, i) => (
            <div key={w.id} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground shrink-0 mt-2.5 w-4 text-right">{i + 1}.</span>
              <Textarea
                value={w.question}
                placeholder="Write the question"
                onChange={(e) =>
                  onChange({
                    writtenTest: programme.writtenTest.map((q) =>
                      q.id === w.id ? { ...q, question: e.target.value } : q
                    ),
                  })
                }
                className="flex-1 min-h-12 resize-none"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                title="Remove question"
                onClick={() => onChange({ writtenTest: programme.writtenTest.filter((q) => q.id !== w.id) })}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete programme?</DialogTitle>
            <DialogDescription>
              &ldquo;{programme.name}&rdquo; and all its modules, quizzes, and tests will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                onDelete();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================= Module card ================= */

function ModuleCard({
  module,
  index,
  total,
  editing,
  expanded,
  onToggle,
  onUpdate,
  onMove,
  onRemove,
  onPreview,
}: {
  module: ProgrammeModule;
  index: number;
  total: number;
  editing: boolean;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<ProgrammeModule>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPreview: (target: PreviewTarget) => void;
}) {
  const lessonCount = module.items.filter((i) => i.type !== "quiz").length;
  const quizCount = module.items.filter((i) => i.type === "quiz").length;

  const addItem = (type: ModuleItem["type"]) => {
    const item: ModuleItem =
      type === "quiz"
        ? { id: nextId("item"), type: "quiz", title: "", questions: [] }
        : { id: nextId("item"), type, title: "", url: "" };
    onUpdate({ items: [...module.items, item] });
  };

  const updateItem = (itemId: string, updates: Partial<ModuleItem>) => {
    onUpdate({
      items: module.items.map((it) => (it.id === itemId ? ({ ...it, ...updates } as ModuleItem) : it)),
    });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-2 py-2 bg-muted/40">
        <button
          type="button"
          onClick={onToggle}
          title={expanded ? "Collapse module" : "Expand module"}
          className="flex items-center gap-1.5 shrink-0 rounded-md px-1.5 py-1 hover:bg-muted transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="size-6 rounded-md bg-background border border-border text-xs font-medium text-muted-foreground flex items-center justify-center">
            {index + 1}
          </span>
        </button>
        {editing ? (
          <Input
            value={module.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={`Module ${index + 1} title`}
            className="flex-1 h-9 min-w-24 font-medium bg-background"
          />
        ) : (
          <button type="button" onClick={onToggle} className="flex-1 min-w-0 text-left">
            <span className="block text-sm font-medium truncate">
              {module.title || `Module ${index + 1}`}
            </span>
          </button>
        )}
        <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:inline px-1">
          {lessonCount} lesson{lessonCount === 1 ? "" : "s"} · {quizCount} quiz{quizCount === 1 ? "" : "zes"}
        </span>
        {editing && (
          <div className="flex shrink-0">
            <Button variant="ghost" size="icon-sm" disabled={index === 0} title="Move up" onClick={() => onMove(-1)}>
              <ChevronUp size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={index === total - 1}
              title="Move down"
              onClick={() => onMove(1)}
            >
              <ChevronDown size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              title="Delete module"
              onClick={onRemove}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="p-2.5 flex flex-col gap-1.5">
          {module.items.length === 0 && (
            <p className="text-sm text-muted-foreground py-2 px-1">
              {editing ? "This module is empty. Add videos, PDFs, links, or a quiz below." : "No content yet."}
            </p>
          )}
          {module.items.map((item, iIndex) => (
            <ContentItemRow
              key={item.id}
              item={item}
              index={iIndex}
              total={module.items.length}
              editing={editing}
              onUpdate={(updates) => updateItem(item.id, updates)}
              onMove={(dir) => onUpdate({ items: moveInArray(module.items, iIndex, iIndex + dir) })}
              onRemove={() => onUpdate({ items: module.items.filter((it) => it.id !== item.id) })}
              onPreview={onPreview}
            />
          ))}

          {editing && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center mt-1 border border-dashed border-border text-muted-foreground hover:text-foreground"
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
                      <Meta.icon size={15} className="text-[#7e55f6]" />
                      {Meta.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= Content item row ================= */

function ContentItemRow({
  item,
  index,
  total,
  editing,
  onUpdate,
  onMove,
  onRemove,
  onPreview,
}: {
  item: ModuleItem;
  index: number;
  total: number;
  editing: boolean;
  onUpdate: (updates: Partial<ModuleItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPreview: (target: PreviewTarget) => void;
}) {
  const [quizOpen, setQuizOpen] = useState(false);
  const Meta = ITEM_META[item.type];

  const actions = (
    <div className="flex shrink-0">
      <Button variant="ghost" size="icon-sm" disabled={index === 0} title="Move up" onClick={() => onMove(-1)}>
        <ChevronUp size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={index === total - 1}
        title="Move down"
        onClick={() => onMove(1)}
      >
        <ChevronDown size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive"
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
          <div className="size-7 rounded-md bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center shrink-0">
            <Meta.icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium m-0 truncate">{item.title || Meta.label}</p>
            <p className="text-xs text-muted-foreground m-0 truncate font-mono">{item.url || "No link added"}</p>
          </div>
          {item.type === "link" ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-8 text-xs text-[#7e55f6]"
              disabled={!item.url}
              onClick={() => window.open(item.url, "_blank", "noopener")}
            >
              <ExternalLink size={13} /> Open
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-8 text-xs text-[#7e55f6]"
              disabled={!item.url}
              onClick={() => onPreview({ type: item.type as "video" | "pdf", title: item.title, url: item.url })}
            >
              <Eye size={13} /> Preview
            </Button>
          )}
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-border bg-card px-2.5 py-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-[#7e55f6]/10 text-[#7e55f6] flex items-center justify-center shrink-0">
            <Meta.icon size={14} />
          </div>
          <span className="text-xs font-medium text-muted-foreground w-10 shrink-0 hidden sm:inline">
            {Meta.label}
          </span>
          <Input
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={`${Meta.label} title`}
            className="flex-1 h-9 min-w-0"
          />
          {actions}
        </div>
        <div className="relative">
          <Link2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={item.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder={
              item.type === "link"
                ? "Paste a link (https://example.com)"
                : `Paste the ${Meta.label.toLowerCase()} URL`
            }
            className="h-9 w-full pl-8 text-sm"
          />
        </div>
      </div>
    );
  }

  // Quiz read-only view.
  if (!editing) {
    return (
      <div className="rounded-lg border border-[#7e55f6]/25 bg-[#7e55f6]/4 px-2.5 py-2 flex items-center gap-2">
        <div className="size-7 rounded-md bg-[#7e55f6] text-white flex items-center justify-center shrink-0">
          <Meta.icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium m-0 truncate">{item.title || "Quiz"}</p>
          <p className="text-xs text-muted-foreground m-0">
            {item.questions.length} question{item.questions.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    );
  }

  // Quiz item: collapsible question builder (edit mode)
  return (
    <div className="rounded-lg border border-[#7e55f6]/25 bg-[#7e55f6]/4">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="size-7 rounded-md bg-[#7e55f6] text-white flex items-center justify-center shrink-0">
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
        <div className="px-2.5 pb-2.5 flex flex-col gap-2">
          {item.questions.length === 0 && (
            <p className="text-xs text-muted-foreground m-0 px-1">
              No questions yet. Add one below and pick the correct answer with the radio button.
            </p>
          )}
          {item.questions.map((q) => (
            <McqEditor
              key={q.id}
              question={q}
              onUpdate={(updates) =>
                onUpdate({ questions: item.questions.map((x) => (x.id === q.id ? { ...x, ...updates } : x)) })
              }
              onRemove={() => onUpdate({ questions: item.questions.filter((x) => x.id !== q.id) })}
            />
          ))}
          <Button
            variant="outline"
            size="xs"
            className="self-start"
            onClick={() =>
              onUpdate({
                questions: [
                  ...item.questions,
                  { id: nextId("q"), question: "", options: ["Option A", "Option B"], answer: 0 },
                ],
              })
            }
          >
            <Plus size={12} /> Question
          </Button>
        </div>
      )}
    </div>
  );
}

function McqEditor({
  question,
  onUpdate,
  onRemove,
}: {
  question: McqQuestion;
  onUpdate: (updates: Partial<McqQuestion>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Input
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          className="flex-1 h-9 font-medium"
          placeholder="Question"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          title="Remove question"
          onClick={onRemove}
        >
          <Trash2 size={14} />
        </Button>
      </div>
      <div className="flex flex-col gap-1 pl-2">
        {question.options.map((opt, oIndex) => (
          <div key={oIndex} className="flex items-center gap-2">
            <input
              type="radio"
              checked={question.answer === oIndex}
              onChange={() => onUpdate({ answer: oIndex })}
              className="accent-[#7e55f6]"
              title="Mark as correct answer"
            />
            <Input
              value={opt}
              onChange={(e) => {
                const options = [...question.options];
                options[oIndex] = e.target.value;
                onUpdate({ options });
              }}
              className={`flex-1 h-8 text-xs ${question.answer === oIndex ? "text-[#7e55f6] font-medium" : ""}`}
              placeholder={`Option ${oIndex + 1}`}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              title="Remove option"
              onClick={() => {
                const options = question.options.filter((_, i) => i !== oIndex);
                onUpdate({ options, answer: question.answer >= options.length ? 0 : question.answer });
              }}
            >
              <Trash2 size={12} />
            </Button>
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

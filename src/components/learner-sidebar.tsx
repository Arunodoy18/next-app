"use client";

import { useRouter, usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Award,
  ChevronsUpDown,
  ChevronDown,
  GraduationCap,
  MessageSquare,
  Lock,
  Settings,
} from "lucide-react";
import { useLearner, CERTIFICATE_VIEW, GRADE_VIEW, WRITTEN_EXAM_VIEW } from "@/components/learner-context";
import { useUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";

const RESOURCE_ICONS: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
};

export function LearnerSidebarContent({ closeSidebar }: { closeSidebar: () => void }) {
  const {
    config,
    programme,
    activeModule,
    setActiveModule,
    expandedModule,
    setExpandedModule,
    openResource,
    setOpenResource,
    setFullscreenItem,
    completed,
    isLocked,
    moduleCompletionPercent,
    programmeCompletionPercent,
    writtenSubmitted,
    handleProgrammeChange,
  } = useLearner();

  const { basePath, programmes: PROGRAMMES, renderProgrammeSwitcherExtra } = config;
  const router = useRouter();
  const pathname = usePathname();

  const showWrittenExam = activeModule === WRITTEN_EXAM_VIEW;

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Programme</p>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full">
            <span className="text-sm font-medium leading-snug truncate">{programme.title}</span>
            <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Your Programmes</p>
            <DropdownMenuSeparator />
            {PROGRAMMES.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => {
                  handleProgrammeChange(p.id);
                  closeSidebar();
                }}
                className={renderProgrammeSwitcherExtra ? "flex flex-col items-start gap-1" : ""}
              >
                <span>{p.title}</span>
                {renderProgrammeSwitcherExtra?.(p)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {renderProgrammeSwitcherExtra?.(programme)}

        <Progress value={programmeCompletionPercent} className="mt-1" />
        <p className="text-xs text-muted-foreground">
          Programme completion:{" "}
          <span className="font-medium text-foreground">{programmeCompletionPercent}%</span>
        </p>
      </div>

      <nav
        onClickCapture={() => {
          if (pathname !== basePath) router.push(basePath);
        }}
        className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden pr-1 -mr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <p className="text-xs uppercase tracking-wide text-muted-foreground px-3 mb-1">Modules</p>
        {programme.modules.map((module, moduleIndex) => {
          const isActive = activeModule === module.id;
          const isExpanded = expandedModule === module.id;
          return (
            <div key={module.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setExpandedModule(isExpanded ? "" : module.id);
                  setActiveModule(isExpanded ? "" : module.id);
                  closeSidebar();
                }}
                className={`flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-[#7e55f6] hover:bg-[#6742d4] text-white" : "border border-border hover:bg-muted text-foreground"
                }`}
              >
                <span className="font-medium truncate">
                  {moduleIndex + 1}. {module.title}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {moduleCompletionPercent(module) === 100 && <CheckCircle2 size={14} className="text-green-500" />}
                  <span className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {moduleCompletionPercent(module)}%
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-white/80" : "text-muted-foreground"}`}
                  />
                </span>
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-0.5 mt-1 ml-3 pl-3 border-l border-border">
                  {module.resources.map((resource, resourceIndex) => {
                    const Icon = RESOURCE_ICONS[resource.type];
                    const done = !!completed[resource.id];
                    const locked = isLocked(resource.id);
                    return (
                      <button
                        key={resource.id}
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          setActiveModule(module.id);
                          setOpenResource(openResource === resource.id ? "" : resource.id);
                          setFullscreenItem("");
                          closeSidebar();
                        }}
                        className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-xs hover:bg-muted transition-colors ${
                          locked ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""
                        } ${openResource === resource.id ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                      >
                        <Icon size={14} className="shrink-0 text-[#7e55f6]" />
                        <span className="flex-1 truncate">
                          {moduleIndex + 1}.{resourceIndex + 1} {resource.title}
                        </span>
                        {locked ? (
                          <Lock size={14} className="shrink-0 text-muted-foreground/30" />
                        ) : (
                          <CheckCircle2 size={14} className={`shrink-0 ${done ? "text-green-500" : "text-muted-foreground/30"}`} />
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={isLocked(module.quiz.id)}
                    onClick={() => {
                      setActiveModule(module.id);
                      setOpenResource(openResource === module.quiz.id ? "" : module.quiz.id);
                      setFullscreenItem("");
                      closeSidebar();
                    }}
                    className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-xs hover:bg-muted transition-colors ${
                      isLocked(module.quiz.id) ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""
                    } ${openResource === module.quiz.id ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                  >
                    <HelpCircle size={14} className="shrink-0 text-[#7e55f6]" />
                    <span className="flex-1 truncate">
                      {moduleIndex + 1}.{module.resources.length + 1} {module.quiz.title}
                    </span>
                    {isLocked(module.quiz.id) ? (
                      <Lock size={14} className="shrink-0 text-muted-foreground/30" />
                    ) : (
                      <CheckCircle2
                        size={14}
                        className={`shrink-0 ${completed[module.quiz.id] ? "text-green-500" : "text-muted-foreground/30"}`}
                      />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setActiveModule(WRITTEN_EXAM_VIEW);
            closeSidebar();
          }}
          className={`flex items-center justify-between gap-2 text-left px-3 py-2 mt-1 rounded-lg text-sm ${
            showWrittenExam ? "bg-[#7e55f6] hover:bg-[#6742d4] text-white" : "border border-border hover:bg-muted text-foreground"
          }`}
        >
          <span className="flex items-center gap-2 font-medium truncate">
            <FileText size={16} className={`shrink-0 ${showWrittenExam ? "text-white" : "text-[#7e55f6]"}`} />
            Written Exam
          </span>
          {writtenSubmitted && (
            <CheckCircle2 size={14} className={`shrink-0 ${showWrittenExam ? "text-white" : "text-green-500"}`} />
          )}
        </button>
      </nav>
    </>
  );
}

export function LearnerSidebarFooter({ closeSidebar }: { closeSidebar: () => void }) {
  const { config, activeModule, setActiveModule } = useLearner();
  const { basePath, settingsPath, messagesPath, showCertificate } = config;
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const isInstructor = user?.role === "Instructor";

  const showMessages = pathname === messagesPath;
  const showGrade = activeModule === GRADE_VIEW;
  const showCertificateView = showCertificate && activeModule === CERTIFICATE_VIEW;
  const showSettings = pathname === settingsPath;

  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => {
          router.push(messagesPath);
          closeSidebar();
        }}
        className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm w-full ${
          showMessages ? "bg-[#7e55f6] text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        <MessageSquare size={18} />
        <span className="font-medium">Message Instructor</span>
      </button>
      <button
        type="button"
        onClick={() => {
          if (pathname !== basePath) router.push(basePath);
          setActiveModule(GRADE_VIEW);
          closeSidebar();
        }}
        className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm w-full ${
          showGrade ? "bg-[#7e55f6] text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        <GraduationCap size={18} />
        <span className="font-medium">Grade</span>
      </button>
      {showCertificate && (
        <button
          type="button"
          onClick={() => {
            if (pathname !== basePath) router.push(basePath);
            setActiveModule(CERTIFICATE_VIEW);
            closeSidebar();
          }}
          className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm w-full ${
            showCertificateView ? "bg-[#7e55f6] text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Award size={18} />
          <span className="font-medium">Certificate</span>
        </button>
      )}
      {isInstructor && basePath === "/internal" && (
        <Link
          href="/instructor"
          onClick={closeSidebar}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full bg-[#7e55f6] hover:bg-[#6742d4] text-white font-medium"
        >
          <ArrowRightLeft size={18} />
          Access Portal
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          router.push(settingsPath);
          closeSidebar();
        }}
        className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm w-full ${
          showSettings ? "bg-[#7e55f6] text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        <Settings size={18} />
        <span className="font-medium">Account Settings</span>
      </button>
    </div>
  );
}

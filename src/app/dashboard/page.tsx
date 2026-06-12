"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Logo from '@/components/logo/logo';
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Award,
  LogOut,
  Settings,
  ChevronsUpDown,
  ChevronDown,
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X,
  PanelLeftIcon,
  Lock,
  Maximize2,
  Minimize2,
} from 'lucide-react';

type ResourceType = 'video' | 'pdf';

interface Resource {
  id: string;
  type: ResourceType;
  title: string;
}

interface Quiz {
  id: string;
  title: string;
  score: number | null;
}

interface Module {
  id: string;
  title: string;
  resources: Resource[];
  quiz: Quiz;
}

interface Programme {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

const PROGRAMMES: Programme[] = [
  {
    id: 'p1',
    title: 'Mergers & Acquisitions Consulting',
    description: 'Advisory frameworks, valuation techniques, and deal execution for M&A consultants.',
    modules: [
      {
        id: 'p1-m1',
        title: 'Deal Sourcing & Due Diligence',
        resources: [
          { id: 'p1-m1-v1', type: 'video', title: 'Sourcing Strategies for Acquirers' },
          { id: 'p1-m1-p1', type: 'pdf', title: 'Due Diligence Checklist' },
        ],
        quiz: { id: 'p1-m1-q', title: 'Due Diligence Quiz', score: null },
      },
      {
        id: 'p1-m2',
        title: 'Valuation Methods',
        resources: [
          { id: 'p1-m2-v1', type: 'video', title: 'DCF & Comparable Company Analysis' },
          { id: 'p1-m2-p1', type: 'pdf', title: 'Valuation Models Reference' },
        ],
        quiz: { id: 'p1-m2-q', title: 'Valuation Quiz', score: null },
      },
      {
        id: 'p1-m3',
        title: 'Deal Structuring & Negotiation',
        resources: [
          { id: 'p1-m3-v1', type: 'video', title: 'Structuring the Term Sheet' },
          { id: 'p1-m3-p1', type: 'pdf', title: 'Negotiation Playbook' },
        ],
        quiz: { id: 'p1-m3-q', title: 'Deal Structuring Quiz', score: null },
      },
    ],
  },
  {
    id: 'p2',
    title: 'Private Equity Fundamentals',
    description: 'Fund structures, portfolio strategy, and value creation for private equity professionals.',
    modules: [
      {
        id: 'p2-m1',
        title: 'Fund Structures & LP Relations',
        resources: [
          { id: 'p2-m1-v1', type: 'video', title: 'Understanding Fund Structures' },
          { id: 'p2-m1-p1', type: 'pdf', title: 'LP Agreement Essentials' },
        ],
        quiz: { id: 'p2-m1-q', title: 'Fund Structures Quiz', score: null },
      },
      {
        id: 'p2-m2',
        title: 'Portfolio Value Creation',
        resources: [
          { id: 'p2-m2-v1', type: 'video', title: 'Operational Improvement Levers' },
          { id: 'p2-m2-p1', type: 'pdf', title: 'Value Creation Playbook' },
        ],
        quiz: { id: 'p2-m2-q', title: 'Value Creation Quiz', score: null },
      },
    ],
  },
];

const RESOURCE_ICONS: Record<ResourceType, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  video: 'Video',
  pdf: 'PDF',
};

const SAMPLE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';
const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const SAMPLE_QUIZ_QUESTIONS: { id: string; question: string; options: string[]; answer: number }[] = [
  {
    id: 'q1',
    question: 'What is the primary purpose of due diligence in a deal?',
    options: ['To negotiate price', 'To verify facts and assess risk', 'To sign the contract', 'To market the deal'],
    answer: 1,
  },
  {
    id: 'q2',
    question: 'Which of these is a common valuation method?',
    options: ['Discounted Cash Flow (DCF)', 'Search Engine Optimization', 'Inventory Turnover', 'Net Promoter Score'],
    answer: 0,
  },
  {
    id: 'q3',
    question: 'A term sheet is best described as:',
    options: ['A final binding contract', 'A non-binding outline of key deal terms', 'A tax filing document', 'A marketing brochure'],
    answer: 1,
  },
];

const PROGRESS_KEY_PREFIX = 'programme-progress-';
const CERTIFICATE_VIEW = 'certificate';
const GRADE_VIEW = 'grade';

function gradeLetter(percent: number): string {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

export default function Dashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const user = mounted ? localStorage.getItem('user') : null;
  const [completedState, setCompleted] = useState<Record<string, boolean> | null>(null);
  const [activeProgramme, setActiveProgramme] = useState<string>(PROGRAMMES[0]?.id ?? '');
  const [activeModule, setActiveModule] = useState<string>(PROGRAMMES[0]?.modules[0]?.id ?? '');
  const [expandedModule, setExpandedModule] = useState<string>(PROGRAMMES[0]?.modules[0]?.id ?? '');
  const [openResource, setOpenResource] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [fullscreenItem, setFullscreenItem] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  const storedCompleted = useMemo<Record<string, boolean>>(() => {
    if (!user) return {};
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY_PREFIX + user) ?? '{}');
    } catch {
      return {};
    }
  }, [user]);
  const completed = completedState ?? storedCompleted;

  const toggleItem = (itemId: string, allItems: string[]) => {
    if (!user) return;
    const updated = { ...completed };
    const wasCompleted = !!updated[itemId];
    if (wasCompleted) {
      const idx = allItems.indexOf(itemId);
      allItems.forEach((id, i) => {
        if (i >= idx) delete updated[id];
      });
    } else {
      updated[itemId] = true;
    }
    setCompleted(updated);
    localStorage.setItem(PROGRESS_KEY_PREFIX + user, JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleProgrammeChange = (programmeId: string) => {
    setActiveProgramme(programmeId);
    const programme = PROGRAMMES.find((p) => p.id === programmeId);
    setActiveModule(programme?.modules[0]?.id ?? '');
    setSidebarOpen(false);
  };

  if (!user) {
    return null;
  }

  const programme = PROGRAMMES.find((p) => p.id === activeProgramme) ?? PROGRAMMES[0];

  // Sequential unlock: an item is locked until everything before it is completed
  const allItems: string[] = programme.modules.flatMap((m) => [...m.resources.map((r) => r.id), m.quiz.id]);
  const firstIncompleteIndex = allItems.findIndex((id) => !completed[id]);
  const isLocked = (itemId: string) => {
    if (firstIncompleteIndex === -1) return false;
    return allItems.indexOf(itemId) > firstIncompleteIndex;
  };

  // Each module's "items" = its resources + its quiz (for completion progress)
  const moduleItemCount = (m: Module) => m.resources.length + 1;
  const moduleCompletedCount = (m: Module) =>
    m.resources.filter((r) => completed[r.id]).length + (completed[m.quiz.id] ? 1 : 0);

  const moduleCompletionPercent = (m: Module) => Math.round((moduleCompletedCount(m) / moduleItemCount(m)) * 100);

  const totalItems = programme.modules.reduce((sum, m) => sum + moduleItemCount(m), 0);
  const totalCompleted = programme.modules.reduce((sum, m) => sum + moduleCompletedCount(m), 0);
  const programmeCompletionPercent = totalItems === 0 ? 0 : Math.round((totalCompleted / totalItems) * 100);
  const isComplete = totalCompleted === totalItems;

  // Grades are based on quiz scores only
  const moduleGrade = (m: Module): number | null => {
    if (!quizSubmitted[m.quiz.id]) return null;
    const correct = SAMPLE_QUIZ_QUESTIONS.filter((q) => quizAnswers[`${m.quiz.id}-${q.id}`] === q.answer).length;
    return Math.round((correct / SAMPLE_QUIZ_QUESTIONS.length) * 100);
  };

  const gradedModules = programme.modules.filter((m) => quizSubmitted[m.quiz.id]);
  const programmeHasGrade = gradedModules.length > 0;
  const programmeGradePercent = programmeHasGrade
    ? Math.round(gradedModules.reduce((sum, m) => sum + (moduleGrade(m) ?? 0), 0) / gradedModules.length)
    : 0;

  const currentModule = programme.modules.find((m) => m.id === activeModule);
  const currentModuleIndex = programme.modules.findIndex((m) => m.id === activeModule);
  const showCertificate = activeModule === CERTIFICATE_VIEW;
  const showGrade = activeModule === GRADE_VIEW;

  const currentModuleGrade = currentModule ? moduleGrade(currentModule) : null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar trigger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center h-10 w-10 rounded-lg border border-border hover:bg-muted transition-colors md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar collapse toggle */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed((c) => !c)}
        className={`fixed top-4 z-[60] hidden md:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-[left] duration-200 ease-in-out ${
          sidebarCollapsed ? 'left-4' : 'left-[21rem]'
        }`}
      >
        <PanelLeftIcon size={18} />
      </button>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top-right account menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={sidebarOpen}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left ${
            sidebarOpen ? 'pointer-events-none opacity-50 md:pointer-events-auto md:opacity-100' : ''
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#7e55f6] text-white text-sm font-medium">
              {user.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium capitalize hidden sm:block">{user}</span>
          <ChevronsUpDown size={16} className="text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <p className="px-1.5 py-1.5 text-sm font-medium text-foreground capitalize">{user}</p>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-base py-2 [&_svg]:size-[18px]">
            <Settings size={18} />
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="text-base py-2 [&_svg]:size-[18px]" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            Toggle Theme
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" className="text-base py-2 [&_svg]:size-[18px]" onClick={handleLogout}>
            <LogOut size={18} />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky inset-y-0 md:inset-y-auto md:top-0 left-0 z-50 md:h-screen max-w-[85vw] shrink-0 border-r border-border bg-background overflow-hidden transition-[width,padding,border] duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${sidebarCollapsed ? 'md:w-0 md:border-0' : 'w-80'} ${
          sidebarOpen ? 'w-80' : ''
        }`}
      >
      <div className="w-80 h-full flex flex-col p-4 gap-6 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-[0.25rem] text-[1.4rem] font-normal">
            <Logo width="22" height="42" color="var(--foreground)" className="shrink-0" style={{ marginRight: '0.7rem' }} />
            <div>
              <span className="text-foreground">Blackmont</span> <span className="text-foreground">Academy</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Programme switcher */}
        {(
          <div className="px-2 flex flex-col gap-2">
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
                  <DropdownMenuItem key={p.id} onClick={() => handleProgrammeChange(p.id)}>
                    {p.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Progress value={programmeCompletionPercent} className="mt-1" />
            <p className="text-xs text-muted-foreground">
              Programme completion:{' '}
              <span className="font-medium text-foreground">{programmeCompletionPercent}%</span>
            </p>
          </div>
        )}

        <nav className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-wide text-muted-foreground px-2 mb-1">Modules</p>
          {programme.modules.map((module, moduleIndex) => {
            const isActive = activeModule === module.id;
            const isExpanded = expandedModule === module.id;
            return (
              <div key={module.id} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setExpandedModule(isExpanded ? '' : module.id);
                    setActiveModule(isExpanded ? '' : module.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-[#7e55f6] hover:bg-[#6742d4] text-white' : 'border border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="font-medium truncate">{moduleIndex + 1}. {module.title}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {moduleCompletionPercent(module) === 100 && (
                      <CheckCircle2 size={14} className="text-green-500" />
                    )}
                    <span className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {moduleCompletionPercent(module)}%
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''} ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}
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
                            setOpenResource(openResource === resource.id ? '' : resource.id);
                            setFullscreenItem('');
                            setSidebarOpen(false);
                          }}
                          className={`flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors ${
                            locked ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
                          } ${
                            openResource === resource.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          <Icon size={14} className="shrink-0 text-[#7e55f6]" />
                          <span className="flex-1 truncate">{moduleIndex + 1}.{resourceIndex + 1} {resource.title}</span>
                          {locked ? (
                            <Lock size={14} className="shrink-0 text-muted-foreground/30" />
                          ) : (
                            <CheckCircle2 size={14} className={`shrink-0 ${done ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={isLocked(module.quiz.id)}
                      onClick={() => {
                        setActiveModule(module.id);
                        setOpenResource(openResource === module.quiz.id ? '' : module.quiz.id);
                        setFullscreenItem('');
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors ${
                        isLocked(module.quiz.id) ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
                      } ${
                        openResource === module.quiz.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <HelpCircle size={14} className="shrink-0 text-[#7e55f6]" />
                      <span className="flex-1 truncate">{moduleIndex + 1}.{module.resources.length + 1} {module.quiz.title}</span>
                      {isLocked(module.quiz.id) ? (
                        <Lock size={14} className="shrink-0 text-muted-foreground/30" />
                      ) : (
                        <CheckCircle2 size={14} className={`shrink-0 ${completed[module.quiz.id] ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              setActiveModule(GRADE_VIEW);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm ${
              showGrade ? 'bg-[#7e55f6] text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <GraduationCap size={18} />
            <span className="font-medium">Grade</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveModule(CERTIFICATE_VIEW);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm ${
              showCertificate ? 'bg-[#7e55f6] text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Award size={18} />
            <span className="font-medium">Certificate</span>
          </button>
        </div>
      </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 pt-20 sm:p-8 md:pt-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-normal m-0">{programme.title}</h1>
            <p className="text-muted-foreground mt-1">{programme.description}</p>
          </div>

          {showGrade ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-medium m-0">Grade Report</CardTitle>
                <CardDescription className="mt-1">
                  Overall grade:{' '}
                  <span className="font-medium text-foreground">
                    {programmeHasGrade ? `${gradeLetter(programmeGradePercent)} (${programmeGradePercent}%)` : 'No grade yet'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {programme.modules.map((module) => {
                  const grade = moduleGrade(module);
                  return (
                    <div key={module.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">{module.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {grade !== null ? `${gradeLetter(grade)} (${grade}%)` : 'No grade yet'}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : showCertificate ? (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center text-center gap-4 p-10">
                <Award size={48} className={isComplete ? 'text-[#7e55f6]' : 'text-muted-foreground/40'} />
                <div>
                  <CardTitle className="text-2xl font-medium m-0 mb-2">Certificate of Completion</CardTitle>
                  <CardDescription>
                    {isComplete
                      ? `Congratulations! You have completed ${programme.title}.`
                      : 'Complete all modules and quizzes to unlock your certificate.'}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  disabled={!isComplete}
                  className="bg-[#7e55f6] hover:bg-[#6742d4] text-white shadow-md disabled:opacity-50 disabled:pointer-events-none"
                >
                  Download Certificate
                </Button>
              </CardContent>
            </Card>
          ) : currentModule ? (
            <div className="flex flex-col gap-4">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-medium m-0">{currentModuleIndex + 1}. {currentModule.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {moduleCompletedCount(currentModule)} / {moduleItemCount(currentModule)} completed
                    </CardDescription>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground shrink-0 text-right">
                    {currentModuleGrade !== null ? `${gradeLetter(currentModuleGrade)} (${currentModuleGrade}%)` : 'No grade yet'}
                  </span>
                </CardHeader>
                <CardContent>
                  <Progress value={moduleCompletionPercent(currentModule)} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium m-0">Resources</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {currentModule.resources.map((resource, resourceIndex) => {
                    const Icon = RESOURCE_ICONS[resource.type];
                    const done = !!completed[resource.id];
                    const locked = isLocked(resource.id);
                    const isOpen = openResource === resource.id && !locked;
                    return (
                      <div key={resource.id} className="flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => {
                            setOpenResource(isOpen ? '' : resource.id);
                            setFullscreenItem('');
                          }}
                          className={`flex items-center gap-3 p-4 rounded-lg border border-border transition-colors text-left ${
                            locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'
                          }`}
                        >
                          <Icon size={22} className="text-[#7e55f6] shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium m-0">{currentModuleIndex + 1}.{resourceIndex + 1} {resource.title}</p>
                            <p className="text-xs text-muted-foreground m-0">{RESOURCE_LABELS[resource.type]}</p>
                          </div>
                          {locked ? (
                            <Lock size={22} className="shrink-0 text-muted-foreground/30" />
                          ) : (
                            <CheckCircle2
                              size={22}
                              className={`shrink-0 ${done ? 'text-green-500' : 'text-muted-foreground/30'}`}
                            />
                          )}
                        </button>

                        {isOpen && (
                          fullscreenItem === resource.id ? (
                            <div className="fixed inset-0 z-[80] bg-background">
                              {resource.type === 'video' ? (
                                <video controls autoPlay className="w-full h-full bg-black" src={SAMPLE_VIDEO_URL} />
                              ) : (
                                <iframe src={SAMPLE_PDF_URL} className="w-full h-full" title={resource.title} />
                              )}
                              <div className="absolute top-0 inset-x-0 h-12 z-10 peer/top hidden md:block" />
                              <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm transition-opacity md:opacity-0 md:peer-hover/top:opacity-100 md:hover:opacity-100 z-20">
                                <p className="text-sm font-medium m-0 truncate">{resource.title}</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => setFullscreenItem('')}>
                                  <Minimize2 size={14} />
                                  Exit Fullscreen
                                </Button>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 h-12 z-10 peer/bottom hidden md:block" />
                              <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-end border-t border-border bg-background/95 backdrop-blur-sm transition-opacity md:opacity-0 md:peer-hover/bottom:opacity-100 md:hover:opacity-100 z-20">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => toggleItem(resource.id, allItems)}
                                  className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                                >
                                  {done ? 'Mark as Incomplete' : 'Mark as Complete'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-border overflow-hidden">
                              {resource.type === 'video' ? (
                                <video controls className="w-full max-h-[360px] bg-black" src={SAMPLE_VIDEO_URL} />
                              ) : (
                                <iframe src={SAMPLE_PDF_URL} className="w-full h-[400px]" title={resource.title} />
                              )}
                              <div className="p-3 flex items-center justify-between border-t border-border">
                                <Button type="button" variant="outline" size="sm" onClick={() => setFullscreenItem(resource.id)}>
                                  <Maximize2 size={14} />
                                  Fullscreen
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => toggleItem(resource.id, allItems)}
                                  className="bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                                >
                                  {done ? 'Mark as Incomplete' : 'Mark as Complete'}
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium m-0">Module Quiz</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isLocked(currentModule.quiz.id)}
                    onClick={() => {
                      setOpenResource(openResource === currentModule.quiz.id ? '' : currentModule.quiz.id);
                      setFullscreenItem('');
                    }}
                    className={`flex items-center gap-3 p-4 rounded-lg border border-border transition-colors text-left w-full ${
                      isLocked(currentModule.quiz.id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'
                    }`}
                  >
                    <HelpCircle size={22} className="text-[#7e55f6] shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium m-0">{currentModule.quiz.title}</p>
                      <p className="text-xs text-muted-foreground m-0">
                        {isLocked(currentModule.quiz.id) ? 'Locked' : completed[currentModule.quiz.id] ? 'Completed' : 'Not attempted'}
                      </p>
                    </div>
                    {isLocked(currentModule.quiz.id) ? (
                      <Lock size={22} className="shrink-0 text-muted-foreground/30" />
                    ) : (
                      <CheckCircle2
                        size={22}
                        className={`shrink-0 ${completed[currentModule.quiz.id] ? 'text-green-500' : 'text-muted-foreground/30'}`}
                      />
                    )}
                  </button>

                  {openResource === currentModule.quiz.id && !isLocked(currentModule.quiz.id) && (
                    <div className={fullscreenItem === currentModule.quiz.id ? 'fixed inset-0 z-[80] bg-background overflow-y-auto' : 'bg-card/50 rounded-xl border border-border mt-2'}>
                      <div className={fullscreenItem === currentModule.quiz.id ? 'max-w-4xl mx-auto w-full p-6 sm:p-12 min-h-screen flex flex-col' : 'p-5 sm:p-8 flex flex-col'}>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
                          <div>
                            <p className="text-sm font-semibold text-[#7e55f6] uppercase tracking-wider mb-1">Module Quiz</p>
                            <h3 className="text-2xl font-medium m-0">{currentModule.quiz.title}</h3>
                          </div>
                          {fullscreenItem === currentModule.quiz.id ? (
                            <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full px-4" onClick={() => setFullscreenItem('')}>
                              <Minimize2 size={16} className="mr-2" />
                              Exit Fullscreen
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full px-4" onClick={() => setFullscreenItem(currentModule.quiz.id)}>
                              <Maximize2 size={16} className="mr-2" />
                              Fullscreen
                            </Button>
                          )}
                        </div>

                        {/* Questions List */}
                        <div className="flex flex-col gap-10 mb-10">
                          {SAMPLE_QUIZ_QUESTIONS.map((q, qIndex) => {
                            const qKey = `${currentModule.quiz.id}-${q.id}`;
                            const selected = quizAnswers[qKey];
                            const submitted = !!quizSubmitted[currentModule.quiz.id];
                            
                            return (
                              <div key={q.id} className="flex flex-col gap-4">
                                <h4 className="text-lg font-medium m-0 leading-snug">
                                  <span className="text-muted-foreground mr-2">{qIndex + 1}.</span>
                                  {q.question}
                                </h4>
                                <div className="flex flex-col gap-3 ml-6">
                                  {q.options.map((option, oIndex) => {
                                    const isSelected = selected === oIndex;
                                    const isCorrect = oIndex === q.answer;
                                    
                                    let style = 'border-border bg-background hover:border-[#7e55f6]/50 hover:bg-muted/30';
                                    let radioStyle = 'border-muted-foreground/30';
                                    
                                    if (submitted) {
                                      if (isCorrect) {
                                        style = 'border-green-500 bg-green-500/10 shadow-[0_0_0_1px_rgba(34,197,94,1)]';
                                        radioStyle = 'border-green-500 bg-green-500';
                                      } else if (isSelected) {
                                        style = 'border-red-500 bg-red-500/10 shadow-[0_0_0_1px_rgba(239,68,68,1)]';
                                        radioStyle = 'border-red-500 bg-red-500';
                                      }
                                    } else if (isSelected) {
                                      style = 'border-[#7e55f6] bg-[#7e55f6]/5 shadow-[0_0_0_1px_rgba(126,85,246,1)]';
                                      radioStyle = 'border-[#7e55f6]';
                                    }
                                    
                                    return (
                                      <button
                                        key={oIndex}
                                        type="button"
                                        disabled={submitted}
                                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [qKey]: oIndex }))}
                                        className={`text-left p-4 rounded-xl border transition-all duration-200 group ${style}`}
                                      >
                                        <div className="flex items-start gap-4">
                                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${radioStyle} ${!submitted && !isSelected ? 'group-hover:border-[#7e55f6]/50' : ''}`}>
                                            {isSelected && !submitted && <div className="w-2.5 h-2.5 rounded-full bg-[#7e55f6]" />}
                                            {submitted && isCorrect && <CheckCircle2 size={12} className="text-white" />}
                                            {submitted && isSelected && !isCorrect && <X size={12} className="text-white" />}
                                          </div>
                                          <span className={`text-base ${submitted && isCorrect ? 'font-medium' : ''}`}>{option}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Action */}
                        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                          {quizSubmitted[currentModule.quiz.id] ? (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <CheckCircle2 size={24} className="text-green-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground m-0">Your Score</p>
                                  <p className="text-2xl font-bold text-green-500 m-0 leading-none">
                                    {SAMPLE_QUIZ_QUESTIONS.filter((q) => quizAnswers[`${currentModule.quiz.id}-${q.id}`] === q.answer).length} <span className="text-base font-normal text-muted-foreground">/ {SAMPLE_QUIZ_QUESTIONS.length}</span>
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="h-12 px-8 rounded-full"
                                onClick={() => {
                                  setQuizSubmitted((prev) => ({ ...prev, [currentModule.quiz.id]: false }));
                                  setQuizAnswers((prev) => {
                                    const next = { ...prev };
                                    SAMPLE_QUIZ_QUESTIONS.forEach((q) => delete next[`${currentModule.quiz.id}-${q.id}`]);
                                    return next;
                                  });
                                }}
                              >
                                Retake Quiz
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">
                                Answer all questions to submit.
                              </p>
                              <Button
                                type="button"
                                size="lg"
                                onClick={() => {
                                  setQuizSubmitted((prev) => ({ ...prev, [currentModule.quiz.id]: true }));
                                  if (!completed[currentModule.quiz.id]) toggleItem(currentModule.quiz.id, allItems);
                                }}
                                disabled={SAMPLE_QUIZ_QUESTIONS.some((q) => quizAnswers[`${currentModule.quiz.id}-${q.id}`] === undefined)}
                                className="bg-[#7e55f6] hover:bg-[#6742d4] text-white h-12 px-8 rounded-full font-semibold shadow-md disabled:opacity-50 transition-all"
                              >
                                Submit Quiz
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

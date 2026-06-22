// remov1234
export type LessonType = "video" | "pdf" | "link";

export interface McqQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

/**
 * A module is an ordered sequence of items. Lessons (video/pdf/link) carry a
 * URL; quizzes carry MCQ questions and can sit anywhere in the sequence.
 */
export type ModuleItem =
  | { id: string; type: LessonType; title: string; url: string }
  | { id: string; type: "quiz"; title: string; questions: McqQuestion[] };

export interface ProgrammeModule {
  id: string;
  title: string;
  items: ModuleItem[];
}

export interface WrittenQuestion {
  id: string;
  question: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  assignedProgrammeIds: string[];
}

export interface Programme {
  id: string;
  name: string;
  description: string;
  instructorIds: string[];
  modules: ProgrammeModule[];
  writtenTest: WrittenQuestion[];
  // One or more roles this programme serves, toggled in the programme editor.
  // Internal programmes are seeded with a single role.
  roles?: AssignableRole[];
}

export type UserRole =
  | "Student"
  | "Instructor"
  | "Admin"
  | "Business Development"
  | "HR"
  | "Project Management";

// The five roles a programme can be toggled for and a learner can hold. Admin
// is excluded — it is a platform role, not a programme track.
export const ASSIGNABLE_ROLES = [
  "Student",
  "Instructor",
  "HR",
  "Project Management",
  "Business Development",
] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

// One Tailwind class string per role so badges scan at a glance. Shared by the
// admin users table and the reusable <RoleBadge> component.
export const ROLE_BADGE: Record<UserRole, string> = {
  Student: "bg-muted text-muted-foreground border-border",
  Instructor: "bg-blue-500/10 text-blue-600 border-blue-600",
  Admin: "bg-amber-500/10 text-amber-600 border-amber-600",
  "Business Development": "bg-emerald-500/10 text-emerald-600 border-emerald-600",
  HR: "bg-rose-500/10 text-rose-600 border-rose-600",
  "Project Management": "bg-cyan-500/10 text-cyan-600 border-cyan-600",
};

// Just the text colour per role — used to tint a learner's name to match their
// role (Students stay default). Mirrors the text colour in ROLE_BADGE.
export const ROLE_TEXT: Record<UserRole, string> = {
  Student: "",
  Instructor: "text-blue-600",
  Admin: "text-amber-600",
  "Business Development": "text-emerald-600",
  HR: "text-rose-600",
  "Project Management": "text-cyan-600",
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Students enrol in a single programme; instructors and admins can be
  // allotted one or more programmes.
  programmeId?: string;
  programmeIds?: string[];
  signupDate: string;
}

export interface StudentModuleProgress {
  moduleId: string;
  completed: boolean;
  mcqScore: number | null;
}

export interface WrittenAnswer {
  questionId: string;
  answer: string;
  score: number | null;
  feedback: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  programmeId: string;
  signupDate: string;
  moduleProgress: StudentModuleProgress[];
  writtenAnswers: WrittenAnswer[];
}

export const INSTRUCTORS: Instructor[] = [
  { id: "ins1", name: "Alastair Montgomery", email: "a.montgomery@blackmont.ac.uk", assignedProgrammeIds: ["p1"] },
  { id: "ins2", name: "Eleanor Vance", email: "e.vance@blackmont.ac.uk", assignedProgrammeIds: ["p2"] },
  { id: "ins3", name: "Arthur Pendelton", email: "a.pendelton@blackmont.ac.uk", assignedProgrammeIds: ["p1", "p2"] },
];

export const PROGRAMMES: Programme[] = [
  {
    id: "p1",
    name: "Mergers & Acquisitions Consulting",
    description: "Advisory frameworks, valuation techniques, and deal execution for M&A consultants.",
    instructorIds: ["ins1", "ins3"],
    roles: ["Student"],
    modules: [
      {
        id: "p1-m1",
        title: "Deal Sourcing & Due Diligence",
        items: [
          {
            id: "p1-m1-v1",
            type: "video",
            title: "Sourcing Strategies for Acquirers",
            url: "https://videos.blackmont.edu/ma/sourcing-strategies",
          },
          {
            id: "p1-m1-p1",
            type: "pdf",
            title: "Due Diligence Checklist",
            url: "https://files.blackmont.edu/ma/dd-checklist.pdf",
          },
          {
            id: "p1-m1-q1",
            type: "quiz",
            title: "Due Diligence Check-in",
            questions: [
              {
                id: "q1",
                question: "What is the primary purpose of due diligence in a deal?",
                options: ["To negotiate price", "To verify facts and assess risk", "To sign the contract", "To market the deal"],
                answer: 1,
              },
            ],
          },
          {
            id: "p1-m1-l1",
            type: "link",
            title: "Case Study: Failed Diligence",
            url: "https://hbr.org/case-study/failed-diligence",
          },
        ],
      },
      {
        id: "p1-m2",
        title: "Valuation Methods",
        items: [
          {
            id: "p1-m2-v1",
            type: "video",
            title: "DCF & Comparable Company Analysis",
            url: "https://videos.blackmont.edu/ma/dcf-comps",
          },
          {
            id: "p1-m2-p1",
            type: "pdf",
            title: "Valuation Models Reference",
            url: "https://files.blackmont.edu/ma/valuation-models.pdf",
          },
          {
            id: "p1-m2-q1",
            type: "quiz",
            title: "Valuation Methods Quiz",
            questions: [
              {
                id: "q1",
                question: "Which of these is a common valuation method?",
                options: ["Discounted Cash Flow (DCF)", "Search Engine Optimization", "Inventory Turnover", "Net Promoter Score"],
                answer: 0,
              },
            ],
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Describe how you would structure a deal for a client acquiring a distressed competitor." },
      { id: "w2", question: "Explain the trade-offs between an asset purchase and a stock purchase." },
    ],
  },
  {
    id: "p2",
    name: "Private Equity Fundamentals",
    description: "Fund structures, portfolio strategy, and value creation for private equity professionals.",
    instructorIds: ["ins2"],
    roles: ["Student"],
    modules: [
      {
        id: "p2-m1",
        title: "Fund Structures & LP Relations",
        items: [
          {
            id: "p2-m1-v1",
            type: "video",
            title: "Understanding Fund Structures",
            url: "https://videos.blackmont.edu/pe/fund-structures",
          },
          {
            id: "p2-m1-p1",
            type: "pdf",
            title: "LP Agreement Essentials",
            url: "https://files.blackmont.edu/pe/lp-agreements.pdf",
          },
          {
            id: "p2-m1-q1",
            type: "quiz",
            title: "Fund Structures Quiz",
            questions: [
              {
                id: "q1",
                question: "A term sheet is best described as:",
                options: ["A final binding contract", "A non-binding outline of key deal terms", "A tax filing document", "A marketing brochure"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "p2-m2",
        title: "Portfolio Value Creation",
        items: [
          {
            id: "p2-m2-v1",
            type: "video",
            title: "Operational Improvement Levers",
            url: "https://videos.blackmont.edu/pe/improvement-levers",
          },
          {
            id: "p2-m2-q1",
            type: "quiz",
            title: "Mid-module Check",
            questions: [
              {
                id: "q1",
                question: "Which lever most directly improves portfolio company margins?",
                options: ["Procurement optimization", "Logo redesign", "Office relocation", "Press releases"],
                answer: 0,
              },
            ],
          },
          {
            id: "p2-m2-p1",
            type: "pdf",
            title: "Value Creation Playbook",
            url: "https://files.blackmont.edu/pe/value-creation.pdf",
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Outline a 100-day value creation plan for a newly acquired portfolio company." },
    ],
  },
];

export const USERS: AppUser[] = [
  { id: "u1", name: "Oliver Smith", email: "oliver.smith@student.co.uk", role: "Student", programmeId: "p1", signupDate: "2023-11-12T10:00:00Z" },
  { id: "u2", name: "Charlotte Jones", email: "charlotte.jones@student.co.uk", role: "Student", programmeId: "p1", signupDate: "2024-01-05T14:30:00Z" },
  { id: "u3", name: "Harry Williams", email: "harry.williams@student.co.uk", role: "Student", programmeId: "p2", signupDate: "2023-10-20T09:15:00Z" },
  { id: "u4", name: "Amelia Taylor", email: "amelia.taylor@student.co.uk", role: "Student", programmeId: "p2", signupDate: "2024-02-18T11:45:00Z" },
  { id: "u9", name: "Thomas Brown", email: "thomas.brown@student.co.uk", role: "Student", programmeId: "p1", signupDate: "2024-03-01T16:20:00Z" },
  { id: "u10", name: "Olivia Davies", email: "olivia.davies@student.co.uk", role: "Student", programmeId: "p2", signupDate: "2023-12-05T08:10:00Z" },
  { id: "u11", name: "William Evans", email: "william.evans@student.co.uk", role: "Student", programmeId: "p1", signupDate: "2024-01-22T13:05:00Z" },
  { id: "u12", name: "Emily Thomas", email: "emily.thomas@student.co.uk", role: "Student", programmeId: "p2", signupDate: "2023-09-10T09:40:00Z" },
  { id: "u5", name: "Alastair Montgomery", email: "a.montgomery@blackmont.ac.uk", role: "Instructor", signupDate: "2022-05-15T09:00:00Z" },
  { id: "u6", name: "Eleanor Vance", email: "e.vance@blackmont.ac.uk", role: "Instructor", signupDate: "2022-08-20T10:30:00Z" },
  { id: "u7", name: "Arthur Pendelton", email: "a.pendelton@blackmont.ac.uk", role: "Instructor", signupDate: "2021-11-05T14:15:00Z" },
  { id: "u8", name: "Admin User", email: "admin@blackmont.ac.uk", role: "Admin", signupDate: "2020-01-10T08:00:00Z" },
  { id: "u13", name: "Sophie Walker", email: "s.walker@blackmont.ac.uk", role: "Business Development", programmeIds: ["ip1"], signupDate: "2023-06-14T09:30:00Z" },
  { id: "u14", name: "James Carter", email: "j.carter@blackmont.ac.uk", role: "HR", programmeIds: ["ip2"], signupDate: "2023-07-21T10:15:00Z" },
  { id: "u15", name: "Grace Hughes", email: "g.hughes@blackmont.ac.uk", role: "Project Management", programmeIds: ["ip3"], signupDate: "2023-08-30T11:00:00Z" },
  { id: "u16", name: "Daniel Cooper", email: "d.cooper@blackmont.ac.uk", role: "Business Development", programmeIds: ["ip1"], signupDate: "2024-01-09T09:45:00Z" },
  { id: "u17", name: "Lena Hoffmann", email: "l.hoffmann@blackmont.ac.uk", role: "HR", programmeIds: ["ip2"], signupDate: "2024-02-12T10:20:00Z" },
  { id: "u18", name: "Marcus Lee", email: "m.lee@blackmont.ac.uk", role: "Project Management", programmeIds: ["ip3"], signupDate: "2024-03-04T11:30:00Z" },
  { id: "u19", name: "Isabella Rossi", email: "i.rossi@blackmont.ac.uk", role: "Business Development", programmeIds: ["ip1"], signupDate: "2024-02-19T09:50:00Z" },
  { id: "u20", name: "Nathan Brooks", email: "n.brooks@blackmont.ac.uk", role: "Business Development", programmeIds: ["ip1"], signupDate: "2024-04-01T10:05:00Z" },
  { id: "u21", name: "Chloe Bennett", email: "c.bennett@blackmont.ac.uk", role: "Project Management", programmeIds: ["ip3"], signupDate: "2024-03-18T11:15:00Z" },
  { id: "u22", name: "Owen Mitchell", email: "o.mitchell@blackmont.ac.uk", role: "Project Management", programmeIds: ["ip3"], signupDate: "2024-04-22T13:40:00Z" },
];

export const STUDENTS: StudentRecord[] = [
  {
    id: "u1",
    name: "Oliver Smith",
    email: "oliver.smith@student.co.uk",
    programmeId: "p1",
    signupDate: "2023-11-12T10:00:00Z",
    moduleProgress: [
      { moduleId: "p1-m1", completed: true, mcqScore: 100 },
      { moduleId: "p1-m2", completed: true, mcqScore: 80 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would structure the deal as a phased asset acquisition, prioritizing key contracts and IP while ring-fencing legacy liabilities through a holdco structure.",
        score: null,
        feedback: "",
      },
      {
        questionId: "w2",
        answer:
          "An asset purchase lets the buyer pick specific assets/liabilities and often gives a stepped-up tax basis, while a stock purchase transfers the whole entity including hidden liabilities but is simpler to execute.",
        score: 90,
        feedback: "Strong grasp of tax and liability trade-offs.",
      },
    ],
  },
  {
    id: "u2",
    name: "Charlotte Jones",
    email: "charlotte.jones@student.co.uk",
    programmeId: "p1",
    signupDate: "2024-01-05T14:30:00Z",
    moduleProgress: [
      { moduleId: "p1-m1", completed: true, mcqScore: 100 },
      { moduleId: "p1-m2", completed: false, mcqScore: null },
    ],
    writtenAnswers: [],
  },
  {
    id: "u3",
    name: "Harry Williams",
    email: "harry.williams@student.co.uk",
    programmeId: "p2",
    signupDate: "2023-10-20T09:15:00Z",
    moduleProgress: [
      { moduleId: "p2-m1", completed: true, mcqScore: 100 },
      { moduleId: "p2-m2", completed: true, mcqScore: 100 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "Week 1-2: stabilize management team and reporting cadence. Week 3-6: quick-win procurement and pricing actions. Week 7-14: roll out operational KPIs and begin systems integration.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u4",
    name: "Amelia Taylor",
    email: "amelia.taylor@student.co.uk",
    programmeId: "p2",
    signupDate: "2024-02-18T11:45:00Z",
    moduleProgress: [
      { moduleId: "p2-m1", completed: true, mcqScore: 100 },
      { moduleId: "p2-m2", completed: false, mcqScore: null },
    ],
    writtenAnswers: [],
  },
  {
    id: "u9",
    name: "Thomas Brown",
    email: "thomas.brown@student.co.uk",
    programmeId: "p1",
    signupDate: "2024-03-01T16:20:00Z",
    moduleProgress: [
      { moduleId: "p1-m1", completed: false, mcqScore: null },
      { moduleId: "p1-m2", completed: false, mcqScore: null },
    ],
    writtenAnswers: [],
  },
  {
    id: "u10",
    name: "Olivia Davies",
    email: "olivia.davies@student.co.uk",
    programmeId: "p2",
    signupDate: "2023-12-05T08:10:00Z",
    moduleProgress: [
      { moduleId: "p2-m1", completed: true, mcqScore: 80 },
      { moduleId: "p2-m2", completed: true, mcqScore: 90 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I will focus heavily on operational cost synergies, scaling up Sales & Marketing in the first 30 days, and executing supply chain integration by day 90.",
        score: 85,
        feedback: "Good timing breakdown, but need more specifics on procurement.",
      },
    ],
  },
  {
    id: "u11",
    name: "William Evans",
    email: "william.evans@student.co.uk",
    programmeId: "p1",
    signupDate: "2024-01-22T13:05:00Z",
    moduleProgress: [
      { moduleId: "p1-m1", completed: true, mcqScore: 90 },
      { moduleId: "p1-m2", completed: false, mcqScore: null },
    ],
    writtenAnswers: [],
  },
  {
    id: "u12",
    name: "Emily Thomas",
    email: "emily.thomas@student.co.uk",
    programmeId: "p2",
    signupDate: "2023-09-10T09:40:00Z",
    moduleProgress: [
      { moduleId: "p2-m1", completed: true, mcqScore: 100 },
      { moduleId: "p2-m2", completed: true, mcqScore: 100 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "My value creation plan centers on technology stack modernization, transition to a SaaS model, and expanding into European enterprise markets.",
        score: null,
        feedback: "",
      },
    ],
  },
];

export interface ChatMessage {
  id: string;
  from: "student" | "instructor";
  text: string;
  sentAt: string;
}

export interface MessageThread {
  id: string;
  studentId: string;
  programmeId: string;
  unread: boolean;
  messages: ChatMessage[];
}

export const THREADS: MessageThread[] = [
  {
    id: "t1",
    studentId: "u1",
    programmeId: "p1",
    unread: true,
    messages: [
      {
        id: "t1-1",
        from: "student",
        text: "Sir, in the DCF video the terminal value calculation was a bit unclear. Could you share an example with the exit multiple method?",
        sentAt: "Mon 10:24",
      },
    ],
  },
  {
    id: "t2",
    studentId: "u3",
    programmeId: "p2",
    unread: false,
    messages: [
      {
        id: "t2-1",
        from: "student",
        text: "Is there a deadline for the programme-end written test? I want to plan my submission.",
        sentAt: "Fri 16:02",
      },
      {
        id: "t2-2",
        from: "instructor",
        text: "No hard deadline, but I'd recommend submitting within two weeks of finishing the last module so the content is fresh.",
        sentAt: "Fri 17:40",
      },
    ],
  },
  {
    id: "t3",
    studentId: "u2",
    programmeId: "p1",
    unread: true,
    messages: [
      {
        id: "t3-1",
        from: "student",
        text: "I scored low on the Valuation Methods quiz. Is it possible to re-attempt it after revising the material?",
        sentAt: "Today 09:12",
      },
    ],
  },
];

export function programmeName(id: string): string {
  return PROGRAMMES.find((p) => p.id === id)?.name ?? "N/A";
}

export function instructorName(id: string): string {
  return INSTRUCTORS.find((i) => i.id === id)?.name ?? "N/A";
}

/* ============================================================
 * Blackmont Internal — instructor-only training track.
 *
 * Instructors are the *learners* here. Internal programmes reuse the
 * Programme/StudentRecord/MessageThread shapes but live in a separate
 * dataset so the student-facing track stays untouched. There is a written
 * programme (written test) but no certificate.
 * ============================================================ */

export const INTERNAL_PROGRAMMES: Programme[] = [
  {
    id: "ip1",
    name: "Client Growth Essentials",
    description:
      "Pipeline building, prospecting, and deal negotiation for the Business Development track.",
    // Lead instructor(s) assigned to deliver this internal module.
    instructorIds: ["ins1", "ins3"],
    roles: ["Business Development"],
    modules: [
      {
        id: "ip1-m1",
        title: "Pipeline & Prospecting",
        items: [
          {
            id: "ip1-m1-v1",
            type: "video",
            title: "Building a Qualified Pipeline",
            url: "https://videos.blackmont.edu/internal/pipeline",
          },
          {
            id: "ip1-m1-p1",
            type: "pdf",
            title: "Prospecting Playbook",
            url: "https://files.blackmont.edu/internal/prospecting-playbook.pdf",
          },
          {
            id: "ip1-m1-q1",
            type: "quiz",
            title: "Prospecting Check-in",
            questions: [
              {
                id: "q1",
                question: "What is the primary goal of qualifying a lead early?",
                options: ["To close faster", "To focus effort on winnable deals", "To inflate the pipeline", "To skip discovery"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip1-m2",
        title: "Negotiation & Closing",
        items: [
          {
            id: "ip1-m2-v1",
            type: "video",
            title: "Negotiating to a Win-Win",
            url: "https://videos.blackmont.edu/internal/negotiation",
          },
          {
            id: "ip1-m2-q1",
            type: "quiz",
            title: "Closing Quiz",
            questions: [
              {
                id: "q1",
                question: "A concession should ideally be:",
                options: ["Given freely", "Traded for something of value", "Avoided entirely", "Decided by the client"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip1-m3",
        title: "Account Mapping & Stakeholders",
        items: [
          {
            id: "ip1-m3-v1",
            type: "video",
            title: "Mapping the Decision Unit",
            url: "https://videos.blackmont.edu/internal/account-mapping",
          },
          {
            id: "ip1-m3-p1",
            type: "pdf",
            title: "Stakeholder Map Template",
            url: "https://files.blackmont.edu/internal/stakeholder-map.pdf",
          },
          {
            id: "ip1-m3-q1",
            type: "quiz",
            title: "Stakeholders Quiz",
            questions: [
              {
                id: "q1",
                question: "The economic buyer is best described as the person who:",
                options: ["Uses the product daily", "Controls the budget and final yes", "Writes the contract", "Books the demo"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip1-m4",
        title: "Value Proposition & Storytelling",
        items: [
          {
            id: "ip1-m4-v1",
            type: "video",
            title: "Framing Value for the Buyer",
            url: "https://videos.blackmont.edu/internal/value-prop",
          },
          {
            id: "ip1-m4-q1",
            type: "quiz",
            title: "Value Quiz",
            questions: [
              {
                id: "q1",
                question: "A strong value proposition leads with:",
                options: ["Product features", "The buyer's outcome", "Pricing", "Company history"],
                answer: 1,
              },
            ],
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Describe how you would recover a stalled deal late in the sales cycle." },
    ],
  },
  {
    id: "ip2",
    name: "People & Culture Foundations",
    description: "People policies, compliance, and employee relations for the HR track.",
    instructorIds: ["ins3"],
    roles: ["HR"],
    modules: [
      {
        id: "ip2-m1",
        title: "People Policies & Compliance",
        items: [
          {
            id: "ip2-m1-v1",
            type: "video",
            title: "Core Employment Policies",
            url: "https://videos.blackmont.edu/internal/hr-policies",
          },
          {
            id: "ip2-m1-p1",
            type: "pdf",
            title: "Employee Handbook",
            url: "https://files.blackmont.edu/internal/employee-handbook.pdf",
          },
          {
            id: "ip2-m1-q1",
            type: "quiz",
            title: "Policy Quiz",
            questions: [
              {
                id: "q1",
                question: "Where should a confidential grievance first be recorded?",
                options: ["A public channel", "The approved HR case system", "Personal notes", "Nowhere"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip2-m2",
        title: "Recruitment & Onboarding",
        items: [
          {
            id: "ip2-m2-v1",
            type: "video",
            title: "Fair and Effective Hiring",
            url: "https://videos.blackmont.edu/internal/hiring",
          },
          {
            id: "ip2-m2-p1",
            type: "pdf",
            title: "Onboarding Checklist",
            url: "https://files.blackmont.edu/internal/onboarding-checklist.pdf",
          },
          {
            id: "ip2-m2-q1",
            type: "quiz",
            title: "Hiring Quiz",
            questions: [
              {
                id: "q1",
                question: "Structured interviews mainly improve:",
                options: ["Speed only", "Fairness and comparability", "Office morale", "Salary budgets"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip2-m3",
        title: "Performance & Wellbeing",
        items: [
          {
            id: "ip2-m3-v1",
            type: "video",
            title: "Supporting Performance Conversations",
            url: "https://videos.blackmont.edu/internal/performance",
          },
          {
            id: "ip2-m3-q1",
            type: "quiz",
            title: "Wellbeing Quiz",
            questions: [
              {
                id: "q1",
                question: "A good performance conversation is:",
                options: ["One-directional", "Two-way and evidence-based", "Saved for year-end only", "Always informal"],
                answer: 1,
              },
            ],
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Outline how you would handle a sensitive employee grievance fairly and confidentially." },
    ],
  },
  {
    id: "ip3",
    name: "Delivery Excellence",
    description: "Planning, delivery, and risk management for the Project Management track.",
    instructorIds: ["ins1", "ins3"],
    roles: ["Project Management"],
    modules: [
      {
        id: "ip3-m1",
        title: "Planning & Delivery",
        items: [
          {
            id: "ip3-m1-v1",
            type: "video",
            title: "From Scope to Delivery Plan",
            url: "https://videos.blackmont.edu/internal/delivery-plan",
          },
          {
            id: "ip3-m1-p1",
            type: "pdf",
            title: "Project Planning Toolkit",
            url: "https://files.blackmont.edu/internal/project-toolkit.pdf",
          },
          {
            id: "ip3-m1-q1",
            type: "quiz",
            title: "Delivery Quiz",
            questions: [
              {
                id: "q1",
                question: "The main purpose of a risk register is to:",
                options: ["Assign blame", "Track and mitigate risks proactively", "Pad the timeline", "Replace the plan"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip3-m2",
        title: "Stakeholders & Communication",
        items: [
          {
            id: "ip3-m2-v1",
            type: "video",
            title: "Keeping Stakeholders Aligned",
            url: "https://videos.blackmont.edu/internal/stakeholder-comms",
          },
          {
            id: "ip3-m2-p1",
            type: "pdf",
            title: "Communication Plan Template",
            url: "https://files.blackmont.edu/internal/comms-plan.pdf",
          },
          {
            id: "ip3-m2-q1",
            type: "quiz",
            title: "Communication Quiz",
            questions: [
              {
                id: "q1",
                question: "A RACI chart is used to clarify:",
                options: ["Budget lines", "Roles and responsibilities", "Risk scores", "Sprint length"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip3-m3",
        title: "Risk & Quality Management",
        items: [
          {
            id: "ip3-m3-v1",
            type: "video",
            title: "Managing Risk and Quality Together",
            url: "https://videos.blackmont.edu/internal/risk-quality",
          },
          {
            id: "ip3-m3-q1",
            type: "quiz",
            title: "Risk Quiz",
            questions: [
              {
                id: "q1",
                question: "Risk response 'mitigation' means you:",
                options: ["Ignore the risk", "Reduce its likelihood or impact", "Transfer it to the client", "Accept it fully"],
                answer: 1,
              },
            ],
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Describe how you would bring a project that is slipping behind schedule back on track." },
    ],
  },
  {
    id: "ip4",
    name: "Instructor Excellence",
    description: "Facilitation, feedback, and assessment design for the Instructor track.",
    instructorIds: ["ins1", "ins3"],
    roles: ["Instructor"],
    modules: [
      {
        id: "ip4-m1",
        title: "Facilitation & Feedback",
        items: [
          {
            id: "ip4-m1-v1",
            type: "video",
            title: "Running an Engaging Session",
            url: "https://videos.blackmont.edu/internal/facilitation",
          },
          {
            id: "ip4-m1-p1",
            type: "pdf",
            title: "Feedback Frameworks Guide",
            url: "https://files.blackmont.edu/internal/feedback-frameworks.pdf",
          },
          {
            id: "ip4-m1-q1",
            type: "quiz",
            title: "Facilitation Quiz",
            questions: [
              {
                id: "q1",
                question: "Effective feedback is best when it is:",
                options: ["Vague and general", "Specific and actionable", "Delayed for weeks", "Only positive"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip4-m2",
        title: "Assessment Design",
        items: [
          {
            id: "ip4-m2-v1",
            type: "video",
            title: "From Outcomes to Rubrics",
            url: "https://videos.blackmont.edu/internal/assessment-design",
          },
          {
            id: "ip4-m2-p1",
            type: "pdf",
            title: "Rubric Design Toolkit",
            url: "https://files.blackmont.edu/internal/rubric-toolkit.pdf",
          },
          {
            id: "ip4-m2-q1",
            type: "quiz",
            title: "Assessment Quiz",
            questions: [
              {
                id: "q1",
                question: "A good rubric primarily improves:",
                options: ["Grading speed only", "Consistency and fairness of marking", "Class size", "Video quality"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip4-m3",
        title: "Inclusive Teaching",
        items: [
          {
            id: "ip4-m3-v1",
            type: "video",
            title: "Designing for Every Learner",
            url: "https://videos.blackmont.edu/internal/inclusive-teaching",
          },
          {
            id: "ip4-m3-q1",
            type: "quiz",
            title: "Inclusion Quiz",
            questions: [
              {
                id: "q1",
                question: "Inclusive teaching mainly aims to:",
                options: ["Lower standards", "Remove barriers so all can learn", "Reduce content", "Speed up grading"],
                answer: 1,
              },
            ],
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Describe how you give actionable feedback on a written submission. Give a concrete example." },
    ],
  },
];

// Internal learner records across the three role tracks. Some ids match
// Instructor users (u5/u6/u7); others are role-holders (Business Development,
// HR, Project Management) so their role badge shows across the portals.
export const INTERNAL_STUDENTS: StudentRecord[] = [
  {
    id: "u5",
    name: "Alastair Montgomery",
    email: "a.montgomery@blackmont.ac.uk",
    programmeId: "ip1",
    signupDate: "2024-01-15T09:00:00Z",
    moduleProgress: [
      { moduleId: "ip1-m1", completed: true, mcqScore: 100 },
      { moduleId: "ip1-m2", completed: false, mcqScore: null },
    ],
    writtenAnswers: [],
  },
  {
    id: "u6",
    name: "Eleanor Vance",
    email: "e.vance@blackmont.ac.uk",
    programmeId: "ip2",
    signupDate: "2024-02-02T10:30:00Z",
    moduleProgress: [
      { moduleId: "ip2-m1", completed: true, mcqScore: 90 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would record the grievance in the approved HR case system, hear the employee privately, follow the documented procedure, and keep all parties informed without breaching confidentiality.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u7",
    name: "Arthur Pendelton",
    email: "a.pendelton@blackmont.ac.uk",
    programmeId: "ip3",
    signupDate: "2023-12-10T14:15:00Z",
    moduleProgress: [{ moduleId: "ip3-m1", completed: true, mcqScore: 100 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would re-baseline the plan against the critical path, cut or defer non-essential scope, surface risks early to stakeholders, and add focused capacity to the bottleneck.",
        score: 95,
        feedback: "Excellent, well-structured recovery approach.",
      },
    ],
  },
  // Business Development (ip1) learners.
  {
    id: "u13",
    name: "Sophie Walker",
    email: "s.walker@blackmont.ac.uk",
    programmeId: "ip1",
    signupDate: "2023-06-14T09:30:00Z",
    moduleProgress: [
      { moduleId: "ip1-m1", completed: true, mcqScore: 95 },
      { moduleId: "ip1-m2", completed: true, mcqScore: 88 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would reopen the conversation with a fresh value hypothesis, identify the real blocker with the economic buyer, and propose a small, low-risk next step to rebuild momentum.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u16",
    name: "Daniel Cooper",
    email: "d.cooper@blackmont.ac.uk",
    programmeId: "ip1",
    signupDate: "2024-01-09T09:45:00Z",
    moduleProgress: [
      { moduleId: "ip1-m1", completed: true, mcqScore: 80 },
      { moduleId: "ip1-m2", completed: true, mcqScore: 86 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would diagnose where the deal stalled, re-engage the economic buyer with a sharper value case, and agree a concrete next step with a date to rebuild momentum.",
        score: 87,
        feedback: "Good diagnosis and a clear, time-bound next step.",
      },
    ],
  },
  // HR (ip2) learners.
  {
    id: "u14",
    name: "James Carter",
    email: "j.carter@blackmont.ac.uk",
    programmeId: "ip2",
    signupDate: "2023-07-21T10:15:00Z",
    moduleProgress: [{ moduleId: "ip2-m1", completed: true, mcqScore: 100 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would acknowledge the concern, log it in the case system, run a fair and confidential process, and document each step and outcome.",
        score: 92,
        feedback: "Strong, policy-aligned response.",
      },
    ],
  },
  {
    id: "u17",
    name: "Lena Hoffmann",
    email: "l.hoffmann@blackmont.ac.uk",
    programmeId: "ip2",
    signupDate: "2024-02-12T10:20:00Z",
    moduleProgress: [{ moduleId: "ip2-m1", completed: true, mcqScore: 85 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would hear both sides separately, keep records, and escalate only if the documented procedure required it.",
        score: null,
        feedback: "",
      },
    ],
  },
  // Project Management (ip3) learners.
  {
    id: "u15",
    name: "Grace Hughes",
    email: "g.hughes@blackmont.ac.uk",
    programmeId: "ip3",
    signupDate: "2023-08-30T11:00:00Z",
    moduleProgress: [{ moduleId: "ip3-m1", completed: true, mcqScore: 90 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would confirm the critical path, renegotiate scope with the sponsor, and add a short daily check-in to unblock the team quickly.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u18",
    name: "Marcus Lee",
    email: "m.lee@blackmont.ac.uk",
    programmeId: "ip3",
    signupDate: "2024-03-04T11:30:00Z",
    moduleProgress: [{ moduleId: "ip3-m1", completed: true, mcqScore: 100 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would re-baseline, cut non-essential scope, and surface risks early with a clear recovery plan and owners.",
        score: 88,
        feedback: "Clear recovery plan.",
      },
    ],
  },
  // More Business Development (ip1) learners.
  {
    id: "u19",
    name: "Isabella Rossi",
    email: "i.rossi@blackmont.ac.uk",
    programmeId: "ip1",
    signupDate: "2024-02-19T09:50:00Z",
    moduleProgress: [
      { moduleId: "ip1-m1", completed: true, mcqScore: 92 },
      { moduleId: "ip1-m2", completed: true, mcqScore: 78 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would qualify the urgency, map the decision unit, and propose a tightly scoped pilot to prove value before pushing for a larger commitment.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u20",
    name: "Nathan Brooks",
    email: "n.brooks@blackmont.ac.uk",
    programmeId: "ip1",
    signupDate: "2024-04-01T10:05:00Z",
    moduleProgress: [
      { moduleId: "ip1-m1", completed: true, mcqScore: 100 },
      { moduleId: "ip1-m2", completed: false, mcqScore: null },
    ],
    writtenAnswers: [],
  },
  // More Project Management (ip3) learners.
  {
    id: "u21",
    name: "Chloe Bennett",
    email: "c.bennett@blackmont.ac.uk",
    programmeId: "ip3",
    signupDate: "2024-03-18T11:15:00Z",
    moduleProgress: [{ moduleId: "ip3-m1", completed: true, mcqScore: 95 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would identify the bottleneck, replan around the critical path, and agree a realistic, sponsor-approved recovery timeline.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u22",
    name: "Owen Mitchell",
    email: "o.mitchell@blackmont.ac.uk",
    programmeId: "ip3",
    signupDate: "2024-04-22T13:40:00Z",
    moduleProgress: [{ moduleId: "ip3-m1", completed: true, mcqScore: 100 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would protect the critical path, defer nice-to-haves, and run short daily stand-ups to clear blockers fast.",
        score: 90,
        feedback: "Solid, pragmatic plan.",
      },
    ],
  },
];

export const INTERNAL_THREADS: MessageThread[] = [
  {
    id: "it1",
    studentId: "u5",
    programmeId: "ip1",
    unread: true,
    messages: [
      {
        id: "it1-1",
        from: "student",
        text: "For the prospecting module, is the playbook the latest 2024 revision?",
        sentAt: "Tue 11:05",
      },
    ],
  },
  {
    id: "it2",
    studentId: "u7",
    programmeId: "ip3",
    unread: false,
    messages: [
      {
        id: "it2-1",
        from: "student",
        text: "Could you share an example risk register for the delivery planning exercise?",
        sentAt: "Wed 09:20",
      },
      {
        id: "it2-2",
        from: "instructor",
        text: "Of course — I've added a sample risk register to the Project Planning Toolkit PDF.",
        sentAt: "Wed 10:02",
      },
    ],
  },
  {
    id: "it3",
    studentId: "u13",
    programmeId: "ip1",
    unread: true,
    messages: [
      {
        id: "it3-1",
        from: "student",
        text: "On the closing module, how should I handle a buyer who keeps asking for last-minute discounts?",
        sentAt: "Mon 14:20",
      },
    ],
  },
  {
    id: "it4",
    studentId: "u17",
    programmeId: "ip2",
    unread: true,
    messages: [
      {
        id: "it4-1",
        from: "student",
        text: "Is the updated grievance procedure covered in the People & Culture handbook?",
        sentAt: "Thu 09:10",
      },
    ],
  },
  {
    id: "it5",
    studentId: "u18",
    programmeId: "ip3",
    unread: false,
    messages: [
      {
        id: "it5-1",
        from: "student",
        text: "Thanks for the feedback on my recovery plan — really helpful.",
        sentAt: "Fri 16:45",
      },
    ],
  },
  {
    id: "it6",
    studentId: "u19",
    programmeId: "ip1",
    unread: true,
    messages: [
      {
        id: "it6-1",
        from: "student",
        text: "For the pilot approach, what's a good way to scope it so it doesn't drag on?",
        sentAt: "Tue 10:30",
      },
    ],
  },
  {
    id: "it7",
    studentId: "u21",
    programmeId: "ip3",
    unread: true,
    messages: [
      {
        id: "it7-1",
        from: "student",
        text: "Could you review my critical-path assumptions before I share them with the sponsor?",
        sentAt: "Wed 15:05",
      },
    ],
  },
];

export function internalProgrammeName(id: string): string {
  return INTERNAL_PROGRAMMES.find((p) => p.id === id)?.name ?? "N/A";
}

// True when a learner record corresponds to an Instructor user — used to tag
// internal learners with an "(Instructor)" bracket across the portals.
export function isInstructorLearner(id: string): boolean {
  return USERS.some((u) => u.id === id && u.role === "Instructor");
}

// The role of the user behind a learner id, if any. Used to render a role
// badge next to a learner's name across the portals.
export function learnerRole(id: string): UserRole | null {
  return USERS.find((u) => u.id === id)?.role ?? null;
}

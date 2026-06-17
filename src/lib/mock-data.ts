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
}

export type UserRole = "Student" | "Instructor" | "Admin";

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
    name: "Instructor Onboarding & Compliance",
    description:
      "Platform standards, safeguarding, and academic-integrity policy every Blackmont instructor must complete.",
    // Lead instructor(s) assigned to deliver this internal module.
    instructorIds: ["ins3"],
    modules: [
      {
        id: "ip1-m1",
        title: "Teaching Standards & Code of Conduct",
        items: [
          {
            id: "ip1-m1-v1",
            type: "video",
            title: "The Blackmont Instructor Charter",
            url: "https://videos.blackmont.edu/internal/instructor-charter",
          },
          {
            id: "ip1-m1-p1",
            type: "pdf",
            title: "Code of Conduct Handbook",
            url: "https://files.blackmont.edu/internal/code-of-conduct.pdf",
          },
          {
            id: "ip1-m1-q1",
            type: "quiz",
            title: "Conduct Check-in",
            questions: [
              {
                id: "q1",
                question: "Who is responsible for upholding academic integrity in a cohort?",
                options: ["Only the admin team", "The assigned instructor", "The students alone", "No one"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "ip1-m2",
        title: "Safeguarding & Data Handling",
        items: [
          {
            id: "ip1-m2-v1",
            type: "video",
            title: "Handling Student Data Responsibly",
            url: "https://videos.blackmont.edu/internal/data-handling",
          },
          {
            id: "ip1-m2-q1",
            type: "quiz",
            title: "Safeguarding Quiz",
            questions: [
              {
                id: "q1",
                question: "Where should sensitive student records be stored?",
                options: ["Personal email", "Approved Blackmont systems only", "Public shared drives", "Local desktop"],
                answer: 1,
              },
            ],
          },
        ],
      },
    ],
    writtenTest: [
      { id: "w1", question: "Describe how you would handle a suspected case of academic misconduct in your cohort." },
    ],
  },
  {
    id: "ip2",
    name: "Advanced Teaching Methods",
    description: "Facilitation techniques, feedback frameworks, and assessment design for experienced instructors.",
    instructorIds: ["ins1"],
    modules: [
      {
        id: "ip2-m1",
        title: "Designing Effective Assessments",
        items: [
          {
            id: "ip2-m1-v1",
            type: "video",
            title: "From Learning Outcomes to Rubrics",
            url: "https://videos.blackmont.edu/internal/rubrics",
          },
          {
            id: "ip2-m1-p1",
            type: "pdf",
            title: "Assessment Design Toolkit",
            url: "https://files.blackmont.edu/internal/assessment-toolkit.pdf",
          },
          {
            id: "ip2-m1-q1",
            type: "quiz",
            title: "Assessment Design Quiz",
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
    ],
    writtenTest: [
      { id: "w1", question: "Outline how you give actionable feedback on a written submission. Give a concrete example." },
    ],
  },
];

// Internal learner records — ids match Instructor users (u5/u6/u7) so an
// internal learner is trivially an instructor.
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
    programmeId: "ip1",
    signupDate: "2024-02-02T10:30:00Z",
    moduleProgress: [
      { moduleId: "ip1-m1", completed: true, mcqScore: 90 },
      { moduleId: "ip1-m2", completed: true, mcqScore: 100 },
    ],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I would document the incident, follow the academic-integrity policy, give the student a chance to respond, and escalate to the admin team with evidence.",
        score: null,
        feedback: "",
      },
    ],
  },
  {
    id: "u7",
    name: "Arthur Pendelton",
    email: "a.pendelton@blackmont.ac.uk",
    programmeId: "ip2",
    signupDate: "2023-12-10T14:15:00Z",
    moduleProgress: [{ moduleId: "ip2-m1", completed: true, mcqScore: 100 }],
    writtenAnswers: [
      {
        questionId: "w1",
        answer:
          "I open with what worked, then identify one or two priority improvements with specific examples, and close with a concrete next step the learner can take.",
        score: 95,
        feedback: "Excellent, well-structured feedback approach.",
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
        text: "For the safeguarding module, is the data-handling policy the latest 2024 revision?",
        sentAt: "Tue 11:05",
      },
    ],
  },
  {
    id: "it2",
    studentId: "u7",
    programmeId: "ip2",
    unread: false,
    messages: [
      {
        id: "it2-1",
        from: "student",
        text: "Could you share an example rubric for the assessment design exercise?",
        sentAt: "Wed 09:20",
      },
      {
        id: "it2-2",
        from: "instructor",
        text: "Of course — I've added a sample rubric to the Assessment Design Toolkit PDF.",
        sentAt: "Wed 10:02",
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

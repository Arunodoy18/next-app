# Graph Report - .  (2026-06-25)

## Corpus Check
- Corpus is ~41,078 words - fits in a single context window. You may not need a graph.

## Summary
- 686 nodes · 1417 edges · 56 communities (26 shown, 30 thin omitted)
- Extraction: 94% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 288,544 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_User & Roles|User & Roles]]
- [[_COMMUNITY_Authentication & JWT|Authentication & JWT]]
- [[_COMMUNITY_User & Roles|User & Roles]]
- [[_COMMUNITY_Admin Portal|Admin Portal]]
- [[_COMMUNITY_StudentLearner Portal|Student/Learner Portal]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Authentication & JWT|Authentication & JWT]]
- [[_COMMUNITY_Email Services|Email Services]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_StudentLearner Portal|Student/Learner Portal]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Email Services|Email Services]]
- [[_COMMUNITY_StudentLearner Portal|Student/Learner Portal]]
- [[_COMMUNITY_Admin Portal|Admin Portal]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_StudentLearner Portal|Student/Learner Portal]]
- [[_COMMUNITY_Admin Portal|Admin Portal]]
- [[_COMMUNITY_Email Services|Email Services]]
- [[_COMMUNITY_User & Roles|User & Roles]]
- [[_COMMUNITY_Curriculum & Programmes|Curriculum & Programmes]]
- [[_COMMUNITY_User & Roles|User & Roles]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Email Services|Email Services]]
- [[_COMMUNITY_Curriculum & Programmes|Curriculum & Programmes]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Email Services|Email Services]]
- [[_COMMUNITY_Email Services|Email Services]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_StudentLearner Portal|Student/Learner Portal]]
- [[_COMMUNITY_StudentLearner Portal|Student/Learner Portal]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Types & Interfaces|Types & Interfaces]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 102 edges
2. `Button()` - 23 edges
3. `usePortalStore()` - 19 edges
4. `Card()` - 17 edges
5. `CardContent()` - 17 edges
6. `compilerOptions` - 16 edges
7. `Next.js App Project` - 16 edges
8. `CardHeader()` - 14 edges
9. `CardTitle()` - 14 edges
10. `connectToDatabase()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Next.js App Project` ----> `shadcn/ui Component Library`  [1.0]
  package.json → components.json
- `Next.js App Project` ----> `Tailwind CSS`  [1.0]
  package.json → components.json
- `Next.js App Project` ----> `TypeScript`  [1.0]
  package.json → eslint.config.mjs
- `Admin Users Page` ----> `Sonner Toast Notifications`  [1.0]
  src/app/admin/users/page.tsx → package.json
- `Admin Users Page` ----> `Zod Schema Validation`  [1.0]
  src/app/admin/users/page.tsx → package.json

## Import Cycles
- 1-file cycle: `eslint.config.mjs -> eslint.config.mjs`

## Hyperedges (group relationships)
- **** — login_route, forgot_password_route, verify_credentials_route [0.9]
- **** — admin_overview_page, admin_performance_page, admin_programmes_page, admin_users_page [0.95]
- **** — curriculum, module_content, video_content, pdf_content, link_content, quiz_content [0.9]
- **** — user_creation_flow, credentials_verification, verification_email [0.9]
- **** — admin_users_page, users_api_route, user_detail_api_route [0.95]
- **** — student_performance, module_progress, quiz_scoring, written_answer_evaluation [0.9]
- **Learner Portal Ecosystem** — layout_student, component_learner_context, component_learner_content, component_learner_sidebar, component_portal_shell [INFERRED]
- **Instructor Portal Ecosystem** — page_instructor_overview, page_instructor_students, page_instructor_messages, page_instructor_evaluations [INFERRED]
- **Internal Training Portal** — layout_internal, page_internal_content, page_internal_messages, page_internal_settings [INFERRED]
- **Authentication Flow** — page_root, page_login, page_forgot_password [INFERRED]
- **Account Management** — component_account_settings, page_student_settings, page_internal_settings [INFERRED]
- **New User Creation Flow** — route:admin:users, util:credentials, model:User, email:templates, schema:user [INFERRED]
- **Login Flow** — route:auth:login, model:User, auth:server, util:rateLimit [INFERRED]
- **Credentials Verification & Reset Flow** — route:auth:verify, model:User, auth:server, util:credentials, email:templates [INFERRED]
- **Database Layer** — db:mongodb, model:User, type:UserDoc [INFERRED]
- **Email System** — email:templates, mail:authMailer, lib:mailgun, env:MAILGUN_API_KEY, env:MAILGUN_DOMAIN [INFERRED]
- **JWT Authentication System** — auth:server, auth:client, constant:SESSION_COOKIE, interface:TokenPayload, lib:jsonwebtoken, env:JWT_SECRET [INFERRED]
- **Rate Limiting System** — util:rateLimit, interface:RateLimitEntry [INFERRED]
- **Admin Access Control** — route:admin:users, auth:server, type:UserDoc [INFERRED]
- **Password Security** — auth:server, util:credentials, route:auth:verify, lib:bcryptjs [INFERRED]
- **Authentication System** — function:proxy, type:AuthRole, interface:User, constant:SESSION_COOKIE, dependency:jsonwebtoken, dependency:bcryptjs [INFERRED]
- **User Database Schema** — interface:User, model:UserSchema, dependency:mongoose, type:AuthRole [INFERRED]
- **Middleware & Route Protection** — file:src/proxy.ts, function:proxy, function:forward, constant:PROTECTED_ROUTES, constant:ROLE_HOME, export:config [INFERRED]
- **Project Configuration & Build** — config:tsconfig.json, config:package.json, config:.gitignore [INFERRED]
- **Code Quality & Technical Debt** — review:high_architecture_6, review:high_architecture_8, review:medium_quality_11, doc:review.md, doc:tasks.md [INFERRED]
- **Security Fixes Applied** — review:critical_security_1, review:critical_security_5, function:proxy [INFERRED]
- **Admin Portal Pages** — page_admin_perf, page_admin_programmes, page_admin_users [INFERRED]
- **Instructor Portal Pages** — page_instructor_home, page_instructor_students, page_instructor_eval, page_instructor_messages [INFERRED]
- **Student Portal Pages** — page_student_layout, page_student_messages [INFERRED]
- **Internal Portal Pages** — page_internal_layout, page_internal_messages, page_internal_home, page_internal_settings [INFERRED]
- **Learner Portal Ecosystem** — student_portal, internal_portal, portal_shell_component, learner_context, learner_sidebar [INFERRED]
- **Standard + Internal Data Merging** — page_admin_perf, page_instructor_home, page_instructor_students, page_instructor_eval, page_instructor_messages [INFERRED]
- **Design Tokens & Patterns** — color_scheme_purple, color_scheme_green, color_scheme_amber, ui_card_shadow, ui_badge_pattern [INFERRED]

## Communities (56 total, 30 thin omitted)

### Community 0 - "User & Roles"
Cohesion: 0.06
Nodes (72): RESOURCE_ICONS, RESOURCE_LABELS, AssignableRole, ROLE_BADGE, WrittenAnswer, cn(), SORT_OPTIONS, SORT_OPTIONS (+64 more)

### Community 1 - "Authentication & JWT"
Cohesion: 0.07
Nodes (47): RootPage(), AuthResult, requireAuth(), ROLE_HOME, signToken(), verifyPassword(), verifyToken(), Authentication System (+39 more)

### Community 2 - "User & Roles"
Cohesion: 0.05
Nodes (48): ChatMessage, initials(), InstructorChat(), loadMessages(), SAMPLE_CONVERSATIONS, storageKey(), LearnerRoleBadge(), PreviewTarget (+40 more)

### Community 3 - "Admin Portal"
Cohesion: 0.06
Nodes (50): Admin Overview Page, Admin Performance Page, Admin Portal, Admin Programmes Page, Alert Color: Amber, Success Color: Green, Primary Color: Purple (#7e55f6), Account Settings Component (+42 more)

### Community 4 - "Student/Learner Portal"
Cohesion: 0.11
Nodes (19): Drafts, emptyDrafts(), StudentDetailDialog(), ChangeCredentialsInput, changeCredentialsSchema, ChangeNameInput, changeNameSchema, RequestCredentialsResetInput (+11 more)

### Community 5 - "Configuration"
Cohesion: 0.10
Nodes (15): questrial, TITLE_MAP, PlaceholderGuard(), CREDS, SuperuserBubble(), localListeners, PlaceholderContext, PlaceholderProvider() (+7 more)

### Community 6 - "UI Components"
Cohesion: 0.08
Nodes (24): eslintConfig, ESLint Configuration, Next.js Core Web Vitals, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss (+16 more)

### Community 7 - "Authentication & JWT"
Cohesion: 0.09
Nodes (23): Package Configuration, TypeScript Configuration, Protected Routes, Role Home Paths, Session Cookie Name, React Query, Bcrypt Password Hashing, JWT Library (+15 more)

### Community 8 - "Email Services"
Cohesion: 0.09
Nodes (23): dependencies, @base-ui/react, bcryptjs, class-variance-authority, clsx, form-data, @hookform/resolvers, lucide-react (+15 more)

### Community 9 - "UI Components"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Student/Learner Portal"
Cohesion: 0.15
Nodes (12): RESOURCE_ICONS, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 11 - "Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Email Services"
Cohesion: 0.20
Nodes (19): Client Auth Module, Server Auth Module, MongoDB Connection, Email Templates Service, bcryptjs Library, jsonwebtoken Library, Mailgun Library, Auth Mailer Service (+11 more)

### Community 13 - "Student/Learner Portal"
Cohesion: 0.13
Nodes (16): LearnerContent(), gradeLetter(), LearnerContext, LearnerContextValue, LearnerDashboardConfig, Module, Quiz, Resource (+8 more)

### Community 14 - "Admin Portal"
Cohesion: 0.17
Nodes (11): AdminShell(), AdminOverview(), PortalNavItem, InstructorEvaluationsPage(), InstructorShell(), InstructorOverview(), PortalStoreProvider(), usePortalStore() (+3 more)

### Community 15 - "Database & Models"
Cohesion: 0.14
Nodes (14): bcryptjs Library, Component Path Aliases, JSON Web Token Library, Lucide React Icons, MongoDB Database, Mongoose MongoDB ODM, Next.js App Project, Next.js v16.2.9 (+6 more)

### Community 16 - "Student/Learner Portal"
Cohesion: 0.20
Nodes (10): LearnerProgramme, LearnerProvider(), useUser(), CONFIG, InternalShell(), PROGRAMMES, INTERNAL_PROGRAMMES, CONFIG (+2 more)

### Community 17 - "Admin Portal"
Cohesion: 0.20
Nodes (8): Admin Users Management, Admin Users Page, CSV Export, react-hook-form, React Hook Form, TanStack React Query, Sonner Toast Notifications, Zod Schema Validation

### Community 18 - "Email Services"
Cohesion: 0.22
Nodes (10): API Authentication Middleware, Credentials Verification, Forgot Password Route, Mailgun Email Service, Rate Limiting, User Creation Verification Flow, User Detail API Route, Users API Route (+2 more)

### Community 19 - "User & Roles"
Cohesion: 0.29
Nodes (6): getSession(), logout(), TokenPayload, getInitials(), UserSession, AuthRole

### Community 20 - "Curriculum & Programmes"
Cohesion: 0.20
Nodes (10): Content Item Row Component, Curriculum, Link Content Type, MCQ Editor Component, Multiple Choice Question, Module Card Component, Module Content, PDF Content Type (+2 more)

### Community 21 - "User & Roles"
Cohesion: 0.25
Nodes (8): Admin Role, Business Development Role, Human Resources Role, Instructor Role, Project Management Role, Student Role, User Model, User Roles

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 24 - "Curriculum & Programmes"
Cohesion: 0.40
Nodes (5): Drag and Drop Functionality, Hello Pangea DND Library, @hello-pangea/dnd, Programme Editor Component, Programme Management System

### Community 26 - "Configuration"
Cohesion: 0.67
Nodes (3): Bundled Next.js Docs (node_modules/next/dist/docs/), Next.js Breaking Changes Warning, CLAUDE.md Project Instructions

## Knowledge Gaps
- **173 isolated node(s):** `allow`, `$schema`, `style`, `rsc`, `tsx` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Admin Portal` connect `Admin Portal` to `Admin Portal`, `Admin Portal`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `React Hook Form` connect `Admin Portal` to `User & Roles`, `Student/Learner Portal`, `Database & Models`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `allow`, `$schema`, `style` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User & Roles` be split into smaller, more focused modules?**
  _Cohesion score 0.05512035322603618 - nodes in this community are weakly interconnected._
- **Should `Authentication & JWT` be split into smaller, more focused modules?**
  _Cohesion score 0.06829488919041157 - nodes in this community are weakly interconnected._
- **Should `User & Roles` be split into smaller, more focused modules?**
  _Cohesion score 0.05472636815920398 - nodes in this community are weakly interconnected._
- **Should `Admin Portal` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
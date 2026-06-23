# Graph Report - .  (2026-06-23)

## Corpus Check
- Corpus is ~35,711 words - fits in a single context window. You may not need a graph.

## Summary
- 629 nodes · 1093 edges · 105 communities (29 shown, 76 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Badge Components|UI Badge Components]]
- [[_COMMUNITY_UI Button Components|UI Button Components]]
- [[_COMMUNITY_Admin User Management|Admin User Management]]
- [[_COMMUNITY_UI Dropdown Menu|UI Dropdown Menu]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_UI Badge Components|UI Badge Components]]
- [[_COMMUNITY_Instructor Chat System|Instructor Chat System]]
- [[_COMMUNITY_Utilities|Utilities]]
- [[_COMMUNITY_Schema Validation|Schema Validation]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_UI Dropdown Menu|UI Dropdown Menu]]
- [[_COMMUNITY_Instructor Chat System|Instructor Chat System]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_Mock Data|Mock Data]]
- [[_COMMUNITY_Custom Hooks|Custom Hooks]]
- [[_COMMUNITY_Admin User Management|Admin User Management]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Admin User Management|Admin User Management]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Admin Dashboard|Admin Dashboard]]
- [[_COMMUNITY_Schema Validation|Schema Validation]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Schema Validation|Schema Validation]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Mock Data|Mock Data]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Custom Hooks|Custom Hooks]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Configuration|Configuration]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Admin User Management|Admin User Management]]
- [[_COMMUNITY_Admin User Management|Admin User Management]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Custom Hooks|Custom Hooks]]
- [[_COMMUNITY_Evaluation Management|Evaluation Management]]
- [[_COMMUNITY_Page Components|Page Components]]
- [[_COMMUNITY_Page Components|Page Components]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication & Tokens|Authentication & Tokens]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication & Tokens|Authentication & Tokens]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication & Tokens|Authentication & Tokens]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Page Components|Page Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Context Providers|Context Providers]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Custom Components|Custom Components]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Mock Data|Mock Data]]
- [[_COMMUNITY_Mock Data|Mock Data]]
- [[_COMMUNITY_Mock Data|Mock Data]]
- [[_COMMUNITY_Mock Data|Mock Data]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Authentication|Authentication]]
- [[_COMMUNITY_Database & Models|Database & Models]]
- [[_COMMUNITY_Schema Validation|Schema Validation]]
- [[_COMMUNITY_Schema Validation|Schema Validation]]
- [[_COMMUNITY_Schema Validation|Schema Validation]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 75 edges
2. `Button()` - 19 edges
3. `usePortalStore()` - 19 edges
4. `compilerOptions` - 16 edges
5. `Card()` - 15 edges
6. `CardContent()` - 15 edges
7. `CardHeader()` - 13 edges
8. `CardTitle()` - 13 edges
9. `CardDescription()` - 12 edges
10. `Badge()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `InstructorMessagesPage()` --calls--> `initials()`  [INFERRED]
  src/app/instructor/messages/page.tsx → src/components/instructor-chat.tsx
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuSubContent()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (105 total, 76 thin omitted)

### Community 0 - "UI Badge Components"
Cohesion: 0.08
Nodes (42): AdminOverview(), LearnerRoleBadge(), InstructorEvaluationsPage(), InstructorOverview(), learnerRole(), programmeName(), ROLE_BADGE, usePortalStore() (+34 more)

### Community 1 - "UI Button Components"
Cohesion: 0.06
Nodes (50): ChatMessage, initials(), InstructorChat(), loadMessages(), storageKey(), PreviewTarget, Drafts, emptyDrafts() (+42 more)

### Community 2 - "Admin User Management"
Cohesion: 0.08
Nodes (32): hashPassword(), ROLE_HOME, signToken(), TokenPayload, verifyPassword(), verifyToken(), cached, connectToDatabase() (+24 more)

### Community 3 - "UI Dropdown Menu"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, bcryptjs, class-variance-authority, clsx, form-data, @hello-pangea/dnd, jsonwebtoken (+35 more)

### Community 4 - "Theme System"
Cohesion: 0.10
Nodes (13): metadata, questrial, UserRole, PlaceholderGuard(), CREDS, SuperuserBubble(), PlaceholderContext, PlaceholderProvider() (+5 more)

### Community 5 - "UI Badge Components"
Cohesion: 0.13
Nodes (22): cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CardAction() (+14 more)

### Community 6 - "Instructor Chat System"
Cohesion: 0.07
Nodes (27): AppUser, AssignableRole, ChatMessage, INTERNAL_PROGRAMMES, INTERNAL_STUDENTS, INTERNAL_THREADS, LessonType, McqQuestion (+19 more)

### Community 7 - "Utilities"
Cohesion: 0.08
Nodes (26): Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator (+18 more)

### Community 8 - "Schema Validation"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "UI Dropdown Menu"
Cohesion: 0.14
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+3 more)

### Community 11 - "Instructor Chat System"
Cohesion: 0.16
Nodes (18): InstructorEvaluationsPage, InstructorMessagesPage, InstructorOverview, InternalDivider, MessageRow, ProgrammeRow, QueueRow, InstructorStudentsPage (+10 more)

### Community 12 - "Authentication"
Cohesion: 0.14
Nodes (13): logout(), Dashboard(), gradeLetter(), Module, Programme, PROGRAMMES, Quiz, Resource (+5 more)

### Community 13 - "Theme System"
Cohesion: 0.16
Nodes (17): ResourcePreviewDialog, RoleBadge, StudentDetailDialog, ThemeToggle, Badge, badgeVariants, Button, buttonVariants (+9 more)

### Community 14 - "Mock Data"
Cohesion: 0.15
Nodes (14): gradeLetter(), Internal(), Module, Programme, PROGRAMMES, Quiz, Resource, RESOURCE_ICONS (+6 more)

### Community 15 - "Custom Hooks"
Cohesion: 0.15
Nodes (13): PortalShell, Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, DropdownMenu, DropdownMenuContent (+5 more)

### Community 16 - "Admin User Management"
Cohesion: 0.27
Nodes (7): AdminShell(), getSession(), PortalNavItem, getInitials(), useUser(), InstructorShell(), PortalStoreProvider()

### Community 18 - "Admin User Management"
Cohesion: 0.33
Nodes (6): AdminUsersContent, AdminUsersPage, downloadCsv, fetchUsers, toCsv, GET /api/admin/users

### Community 19 - "Authentication"
Cohesion: 0.33
Nodes (6): UserSession, getInitials, useUser, PROTECTED_ROUTES, proxy, AuthRole

### Community 20 - "Admin Dashboard"
Cohesion: 0.40
Nodes (5): ContentItemRow, McqEditor, ModuleCard, ProgrammeEditor, moveInArray

### Community 22 - "Authentication"
Cohesion: 0.50
Nodes (4): authRoleEnum, createUserSchema, updateUserSchema, userSchema

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (3): Bundled Next.js Docs (node_modules/next/dist/docs/), Next.js Breaking Changes Warning, CLAUDE.md Project Instructions

### Community 24 - "Community 24"
Cohesion: 1.00
Nodes (3): App Icon SVG, Brand Glyph (Ascending Bars / Growth Motif), Purple Brand Color #7e55f6

### Community 27 - "Schema Validation"
Cohesion: 0.67
Nodes (3): SEED_USERS, UserSchema, seed

### Community 28 - "Custom Components"
Cohesion: 0.67
Nodes (3): Progress, ProgressIndicator, ProgressTrack

### Community 29 - "Mock Data"
Cohesion: 0.67
Nodes (3): CURRENT_INSTRUCTOR, INSTRUCTORS, instructorName

### Community 30 - "Database & Models"
Cohesion: 0.67
Nodes (3): UserSchema, User, verificationBadgeColor

## Knowledge Gaps
- **133 isolated node(s):** `allow`, `$schema`, `style`, `rsc`, `tsx` (+128 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Badge Components` to `UI Badge Components`, `UI Button Components`, `UI Dropdown Menu`, `Mock Data`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `AuthRole` connect `Admin User Management` to `Admin User Management`, `UI Badge Components`, `Authentication`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Button()` connect `UI Button Components` to `UI Badge Components`, `Theme System`, `UI Badge Components`, `Authentication`, `Mock Data`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `allow`, `$schema`, `style` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Badge Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07960014809329878 - nodes in this community are weakly interconnected._
- **Should `UI Button Components` be split into smaller, more focused modules?**
  _Cohesion score 0.0567287784679089 - nodes in this community are weakly interconnected._
- **Should `Admin User Management` be split into smaller, more focused modules?**
  _Cohesion score 0.07928118393234672 - nodes in this community are weakly interconnected._
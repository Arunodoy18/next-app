# Graph Report - .  (2026-06-17)

## Corpus Check
- 0 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 350 nodes · 819 edges · 18 communities (15 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & Layout Shell|Dashboard & Layout Shell]]
- [[_COMMUNITY_Portal Navigation & Roles|Portal Navigation & Roles]]
- [[_COMMUNITY_UI Primitives & Admin Pages|UI Primitives & Admin Pages]]
- [[_COMMUNITY_Chat, Dialogs & Editors|Chat, Dialogs & Editors]]
- [[_COMMUNITY_Implementation Notes & Progress Model|Implementation Notes & Progress Model]]
- [[_COMMUNITY_Auth Pages & Messaging|Auth Pages & Messaging]]
- [[_COMMUNITY_shadcn Component Config|shadcn Component Config]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Build Tooling & Dependencies|Build Tooling & Dependencies]]
- [[_COMMUNITY_Data Model & Portal Concepts|Data Model & Portal Concepts]]
- [[_COMMUNITY_Next.js Docs & Bootstrap|Next.js Docs & Bootstrap]]
- [[_COMMUNITY_Authentication Logic|Authentication Logic]]
- [[_COMMUNITY_Brand Icon|Brand Icon]]
- [[_COMMUNITY_Claude Permissions|Claude Permissions]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Permissions Allowlist|Permissions Allowlist]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 44 edges
2. `INSTRUCTORS` - 34 edges
3. `usePortalStore` - 22 edges
4. `Button()` - 21 edges
5. `Card()` - 16 edges
6. `CardContent()` - 16 edges
7. `compilerOptions` - 16 edges
8. `CardHeader()` - 15 edges
9. `CardTitle()` - 15 edges
10. `CardDescription()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Bundled Next.js Docs (node_modules/next/dist/docs/)` --semantically_similar_to--> `Official Next.js Documentation`  [INFERRED] [semantically similar]
  AGENTS.md → README.md
- `Implementation Guide` --semantically_similar_to--> `Backend Implementation Notes`  [INFERRED] [semantically similar]
  IMPLEMENTATION_GUIDE.md → IMPLEMENTATION.md
- `Frontend-Only Prototype Scope` --rationale_for--> `next-app package`  [INFERRED]
  IMPLEMENTATION_GUIDE.md → package.json
- `Next.js Breaking Changes Warning` --conceptually_related_to--> `Next.js Project README`  [INFERRED]
  AGENTS.md → README.md
- `Prototype Caveat: Dashboard Reads Hardcoded PROGRAMMES` --conceptually_related_to--> `Frontend-Only Prototype Scope`  [INFERRED]
  IMPLEMENTATION.md → IMPLEMENTATION_GUIDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Admin Portal Component Set** — implementation_guide_data_table, implementation_guide_edit_dialog, implementation_guide_module_editor, implementation_guide_written_test_editor [EXTRACTED 0.85]
- **Placeholder Data Model Entities** — implementation_guide_programme, implementation_guide_module, implementation_guide_student, implementation_guide_instructor [EXTRACTED 0.85]
- **Progress Behaviour On Content Change** — implementation_progress_models, implementation_sequential_unlock, implementation_certificate_persistence [INFERRED 0.75]
- **Portal shell layouts** — layout_adminshell, layout_instructorshell, portal_shell_portalshell, portal_store_useportalstore [INFERRED 0.85]
- **Written-test evaluation flow** — performance_page_adminperformancepage, evaluations_page_instructorevaluationspage, student_detail_dialog_studentdetaildialog [INFERRED 0.85]
- **Programme curriculum builder** — programmes_page_programmeeditor, programmes_page_modulecard, programmes_page_contentitemrow, programmes_page_mcqeditor [EXTRACTED 1.00]
- **Portal store seeded from mock datasets** — lib_portal_store_portalstoreprovider, lib_mock_data_programmes, lib_mock_data_students, lib_mock_data_threads [INFERRED 0.85]
- **Internal instructor-learner track mirrors student datasets** — lib_mock_data_internal_programmes, lib_mock_data_internal_students, lib_mock_data_internal_threads [INFERRED 0.75]
- **Per-conversation chat persisted via localStorage keys** — components_instructor_chat_instructorchat, components_instructor_chat_storagekey, components_instructor_chat_loadmessages [EXTRACTED 1.00]

## Communities (18 total, 3 thin omitted)

### Community 0 - "Dashboard & Layout Shell"
Cohesion: 0.05
Nodes (54): metadata, questrial, logout, Dashboard(), gradeLetter(), Module, Programme, Quiz (+46 more)

### Community 1 - "Portal Navigation & Roles"
Cohesion: 0.10
Nodes (38): PortalNavItem, InstructorEvaluationsPage(), CURRENT_INSTRUCTOR, INITIALS, AdminLayout, AdminShell, InstructorLayout, InstructorShell (+30 more)

### Community 2 - "UI Primitives & Admin Pages"
Cohesion: 0.12
Nodes (22): SORT_OPTIONS, SORT_OPTIONS, Badge(), badgeVariants, SelectContent(), SelectItem(), SelectTrigger(), SelectValue() (+14 more)

### Community 3 - "Chat, Dialogs & Editors"
Cohesion: 0.13
Nodes (20): ChatMessage, loadMessages(), storageKey(), PreviewTarget, Drafts, INSTRUCTORS, ContentItemRow(), ITEM_META (+12 more)

### Community 4 - "Implementation Notes & Progress Model"
Cohesion: 0.07
Nodes (32): Backend Implementation Notes, Certificate Once Earned Stays Earned, Completed Item IDs localStorage Map, Behaviour When Content Added To Started Programme, Implementation Guide, Frontend-Only Prototype Scope, StudentRecord.moduleProgress, Dual Progress Models (Learner vs Records) (+24 more)

### Community 5 - "Auth Pages & Messaging"
Cohesion: 0.21
Nodes (12): instructorName, AdminOverview, PageTitle, Button(), buttonVariants, Card(), CardContent(), CardDescription() (+4 more)

### Community 6 - "shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Build Tooling & Dependencies"
Cohesion: 0.11
Nodes (16): devDependencies, eslint, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+8 more)

### Community 9 - "Data Model & Portal Concepts"
Cohesion: 0.20
Nodes (14): Admin Portal (/admin), Placeholder Data Shape, DataTable Component, EditDialog Component, Instructor Entity, Instructor Portal (/instructor), Module Entity, ModuleEditor Component (+6 more)

### Community 10 - "Next.js Docs & Bootstrap"
Cohesion: 0.25
Nodes (9): Bundled Next.js Docs (node_modules/next/dist/docs/), Next.js Breaking Changes Warning, CLAUDE.md Project Instructions, create-next-app Bootstrap, Development Server (npm run dev), Geist Font via next/font, Official Next.js Documentation, Next.js Project README (+1 more)

### Community 11 - "Authentication Logic"
Cohesion: 0.32
Nodes (6): authenticate, login, Account, ACCOUNTS, AuthRole, Login()

### Community 12 - "Brand Icon"
Cohesion: 1.00
Nodes (3): App Icon SVG, Brand Glyph (Ascending Bars / Growth Motif), Purple Brand Color #7e55f6

## Knowledge Gaps
- **114 isolated node(s):** `allow`, `$schema`, `style`, `rsc`, `tsx` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Dashboard & Layout Shell` to `UI Primitives & Admin Pages`, `Chat, Dialogs & Editors`, `Auth Pages & Messaging`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `INSTRUCTORS` connect `Chat, Dialogs & Editors` to `Dashboard & Layout Shell`, `Portal Navigation & Roles`, `UI Primitives & Admin Pages`, `Auth Pages & Messaging`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `Button()` connect `Auth Pages & Messaging` to `Dashboard & Layout Shell`, `Portal Navigation & Roles`, `UI Primitives & Admin Pages`, `Chat, Dialogs & Editors`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `allow`, `$schema`, `style` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Layout Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.050724637681159424 - nodes in this community are weakly interconnected._
- **Should `Portal Navigation & Roles` be split into smaller, more focused modules?**
  _Cohesion score 0.10434782608695652 - nodes in this community are weakly interconnected._
- **Should `UI Primitives & Admin Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.1166429587482219 - nodes in this community are weakly interconnected._
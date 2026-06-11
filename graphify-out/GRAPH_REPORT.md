# Graph Report - .  (2026-06-11)

## Corpus Check
- Corpus is ~6,072 words - fits in a single context window. You may not need a graph.

## Summary
- 170 nodes · 253 edges · 14 communities (10 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 23,434 input · 1,100 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & Course Data|Dashboard & Course Data]]
- [[_COMMUNITY_Dropdown & Card Primitives|Dropdown & Card Primitives]]
- [[_COMMUNITY_shadcn Component Config|shadcn Component Config]]
- [[_COMMUNITY_Auth Pages & Core UI|Auth Pages & Core UI]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Build & Dev Dependencies|Build & Dev Dependencies]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Layout & Theming|Layout & Theming]]
- [[_COMMUNITY_Claude Permission Settings|Claude Permission Settings]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 8 edges
4. `tailwind` - 6 edges
5. `aliases` - 6 edges
6. `Card()` - 6 edges
7. `CardHeader()` - 6 edges
8. `CardTitle()` - 6 edges
9. `CardContent()` - 6 edges
10. `Next.js Project README` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Bundled Next.js Docs (node_modules/next/dist/docs/)` --semantically_similar_to--> `Official Next.js Documentation`  [INFERRED] [semantically similar]
  AGENTS.md → README.md
- `Next.js Breaking Changes Warning` --conceptually_related_to--> `Next.js Project README`  [INFERRED]
  AGENTS.md → README.md
- `AvatarImage()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (14 total, 4 thin omitted)

### Community 0 - "Dashboard & Course Data"
Cohesion: 0.09
Nodes (20): Dashboard(), gradeLetter(), Module, Programme, PROGRAMMES, Quiz, Resource, RESOURCE_ICONS (+12 more)

### Community 1 - "Dropdown & Card Primitives"
Cohesion: 0.14
Nodes (17): cn(), CardAction(), CardFooter(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+9 more)

### Community 2 - "shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 3 - "Auth Pages & Core UI"
Cohesion: 0.27
Nodes (9): Button(), buttonVariants, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle(), Input() (+1 more)

### Community 4 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "Build & Dev Dependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 6 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @base-ui/react, class-variance-authority, clsx, lucide-react, next, next-themes, @radix-ui/react-avatar (+7 more)

### Community 7 - "Project Documentation"
Cohesion: 0.25
Nodes (9): Bundled Next.js Docs (node_modules/next/dist/docs/), Next.js Breaking Changes Warning, CLAUDE.md Project Instructions, create-next-app Bootstrap, Development Server (npm run dev), Geist Font via next/font, Official Next.js Documentation, Next.js Project README (+1 more)

### Community 8 - "Layout & Theming"
Cohesion: 0.32
Nodes (4): metadata, questrial, ThemeProvider(), ThemeToggle()

## Knowledge Gaps
- **86 isolated node(s):** `allow`, `$schema`, `style`, `rsc`, `tsx` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Dropdown & Card Primitives` to `Dashboard & Course Data`, `Auth Pages & Core UI`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Build & Dev Dependencies`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Button()` connect `Auth Pages & Core UI` to `Layout & Theming`, `Dashboard & Course Data`, `Dropdown & Card Primitives`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `allow`, `$schema`, `style` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Course Data` be split into smaller, more focused modules?**
  _Cohesion score 0.09420289855072464 - nodes in this community are weakly interconnected._
- **Should `Dropdown & Card Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._
- **Should `shadcn Component Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
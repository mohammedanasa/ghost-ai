# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 26 (spec: 26-ai-chat-functional.md): AI Chat Functional — complete

## Current Goal

- Ready for next feature spec.

## Completed

- Feature 26 (spec: 26-ai-chat-functional.md): AI Chat Functional
  - `components/editor/ai-sidebar.tsx` — `handleSend` now async: pushes user message to `ai-chat`, calls `POST /api/ai/design` with `{ prompt, roomId, projectId }`, then `POST /api/ai/design/token` with `{ runId }` to get `publicToken`; `useRealtimeRun(runId, { accessToken: publicToken })` tracks run status; `useEffect` on `run.status` pushes AI completion/error message to `ai-chat` and clears run state on terminal status; `isRunActive` (runId !== null) combined with `isGenerating` (AI_PRESENCE events) controls input disabled + button spinner; status strip moves above input, shows only when `isRunActive || statusText`; user bubble: `bg-[#62C073] text-[#0f2e18]`; AI bubble: `bg-subtle text-copy-primary`; submit button: green accent `bg-[#62C073]`; errors shown as AI assistant messages in feed; `useRoom().id` supplies roomId; `useWorkspace().workspaceProject?.id` supplies projectId
  - TypeScript: zero errors, `npm run build` passes
- Feature 25 (spec: 25-sidebar-chat-feed.md): Sidebar Chat Feed
  - `types/tasks.ts` — `ChatMessageSchema` (Zod, `id`, `sender`, `role`, `content`, `timestamp`) + `ChatMessage` type
  - `liveblocks.config.ts` — `Storage.aiChat: LiveList<LiveObject<ChatMessage>>` added; imports `LiveList`, `LiveObject` from `@liveblocks/client` and `ChatMessage` from `@/types/tasks`
  - `components/editor/canvas-room.tsx` — `initialStorage={{ aiChat: new LiveList([]) }}` added to `RoomProvider`
  - `components/editor/ai-sidebar.tsx` — `useStorage` subscribes to `root.aiChat`; messages validated with `ChatMessageSchema.safeParse` before rendering; `useMutation` pushes `new LiveObject(message)` into `aiChat`; `useSelf` provides sender name; message bubbles show sender name + timestamp; error strip for send failures (`sendError` state + `AlertCircle` icon); `messagesEndRef` auto-scrolls on new message; `ai-chat` fully separated from `ai-status-feed` (event listener only)
  - TypeScript: zero errors, `npm run build` passes
- Feature 24 (spec: 24-ai-presence-state.md): AI Presence State
  - `types/tasks.ts` — `AiStatusPayloadSchema` (Zod, `text?: string`) + `AiStatusPayload` type for feed message validation
  - `components/editor/canvas-room.tsx` — added `CanvasWithSidebar` wrapper inside `ClientSideSuspense`; renders `CanvasFlow` + `AiSidebar` together inside `RoomProvider` so sidebar has access to Liveblocks hooks
  - `components/editor/workspace-chrome.tsx` — removed `AiSidebar` (now rendered inside room); simplified to just render `CanvasRoom`
  - `components/editor/ai-sidebar.tsx` — `useEventListener` subscribes to `AI_PRESENCE` (sets `isGenerating`) and `AI_STATUS` (validates via `AiStatusPayloadSchema`, sets `statusText`, clears on complete/error); status strip shows spinner + latest message when AI is active; textarea disabled + placeholder changes when generating; send button shows `Loader2` spinner instead of `Send` icon when generating
  - `components/editor/canvas-flow.tsx` — `CustomCursor` reads `other.presence.thinking` via second `useOther` call; shows `Loader2` spinner in cursor name badge when `thinking` is true
  - TypeScript: zero errors, `npm run build` passes
- Feature 22 (spec: 22-design-agent-api.md): Design Agent API
  - `prisma/models/project.prisma` — `TaskRun` model added with `runId` (unique), `projectId`, `userId`, `createdAt`; index on `runId`; compound index on `userId`+`projectId`; migration `20260602193520_add_task_run` applied
  - `trigger/design-agent.ts` — `designAgent` task: accepts `{ prompt, roomId }`, logs both, echoes them back; follows existing task pattern
  - `app/api/ai/design/route.ts` — `POST`: auth via `getCurrentIdentity`, validates `prompt`/`roomId`/`projectId`, checks project access via `getAccessibleProject`, triggers `design-agent` task, creates `TaskRun` record, returns `{ runId }`
  - `app/api/ai/design/token/route.ts` — `POST`: auth via `getCurrentIdentity`, validates `runId`, verifies ownership via `TaskRun` lookup, generates Trigger.dev public token scoped to the run, returns `{ token }`
  - TypeScript: zero errors, `npm run build` passes
- Feature 21 (spec: 21-canvas-autosave.md): Canvas Autosave
  - `@vercel/blob` installed
  - `app/api/projects/[projectId]/canvas/route.ts` — `PUT`: uploads canvas JSON to Vercel Blob at `canvas/{projectId}.json`, stores blob URL in Prisma `canvasJsonPath`; `GET`: reads blob URL from Prisma, fetches and returns canvas JSON; both routes use `getCurrentIdentity` + `getAccessibleProject` for auth
  - `hooks/use-canvas-autosave.ts` — watches `nodes`/`edges`, debounces 2 s, calls `PUT /api/projects/{projectId}/canvas`, returns `SaveStatus` (`idle | saving | saved | error`)
  - `components/editor/workspace-context.tsx` — added `saveStatus`, `setSaveStatus`, and `workspaceProject` to context shape and default value; re-exports `SaveStatus` type
  - `components/editor/canvas-flow.tsx` — initial-load `useEffect` (runs once): if room is empty, fetches blob canvas and applies nodes/edges via `onNodesChange`/`onEdgesChange`; calls `useCanvasAutosave` and syncs status to context via `setSaveStatus`
  - `components/editor/editor-navbar.tsx` — `SaveIndicator` component renders spinning loader / check / alert icon + text for each status; `saveStatus` prop added to `EditorNavbar`; indicator renders before the Templates button when in workspace
  - `components/editor/editor-chrome.tsx` — `saveStatus`/`setSaveStatus` state added; both passed into `WorkspaceContext.Provider`; `workspaceProject` also surfaced in context; `saveStatus` forwarded to `EditorNavbar`
  - TypeScript: zero errors, `npm run build` passes
- Feature 20 (spec: 20-ai-sidebar-shell.md): AI Sidebar Shell
  - `components/editor/ai-sidebar.tsx` — new component: floating `<aside>` with slide-in animation, header (Bot icon, "AI Workspace" title, "Collaborate with Ghost AI" subtitle, close button), shadcn `Tabs` with "AI Architect" and "Specs" tabs; AI Architect tab has scrollable chat area with bot-icon empty state, 3 starter prompt chips, user/assistant message bubbles, auto-resizing `Textarea` + `Send` icon button; Specs tab has "Generate Spec" button and a static demo spec card with file icon, title, snippet, and disabled download action; active tab uses `bg-ai text-white`; all colors use project tokens
  - `components/editor/workspace-chrome.tsx` — replaced inline placeholder `<aside>` with `<AiSidebar isOpen={isAISidebarOpen} onClose={toggleAISidebar} />`; removed unused `Ghost`/`Sparkles` imports
  - TypeScript: zero errors, `npm run build` passes
- Feature 19 (spec: 19-presence-avatars-cursors.md): Presence Avatars & Live Cursors
  - `liveblocks.config.ts` — renamed `isThinking` → `thinking` in Presence type per spec
  - `components/editor/canvas-room.tsx` — updated `initialPresence` to `{ cursor: null, thinking: false }`
  - `components/editor/canvas-flow.tsx` — `CustomCursor` component renders a small colored SVG pointer + name badge pill (color from `UserMeta.info.color`); `PresenceAvatars` component (React Flow Panel top-right) shows a filtered collaborator avatar stack (up to 5 + overflow chip, ring via box-shadow, initials fallback) with a divider only when collaborators exist, plus Clerk `UserButton` for the current user; current user filtered via `useUser()` Clerk ID; `getInitials` utility for fallback labels
  - TypeScript: zero errors, `npm run build` passes
- Feature 18 (spec: 18-starter-templates.md): Starter Templates
  - `components/editor/starter-templates.ts` — `CanvasTemplate` type + `CANVAS_TEMPLATES` (Microservices, CI/CD Pipeline, Event-Driven System); each node uses shared `CanvasNode`/`CanvasEdge` types and `NODE_COLORS` palette; CI/CD uses 2-row layout for compact preview
  - `components/editor/starter-templates-modal.tsx` — `StarterTemplatesModal` dialog (`max-w-5xl`, fixed `grid-cols-3`); `TemplatePreview` SVG uses template's own coordinate space as dynamic `viewBox` + `width="100%"` so it fills the card at any size; `aspectRatio` set from actual bounds; edges as lines, nodes as shape-matched SVG elements
  - `components/editor/workspace-context.tsx` — added `TemplatePayload` type + `pendingTemplateImport`/`setPendingTemplateImport` to bridge navbar-level open action to canvas-level Liveblocks state
  - `components/editor/canvas-flow.tsx` — `useEffect` watches `pendingTemplateImport`; applies remove+add `NodeChange`/`EdgeChange` events through `onNodesChange`/`onEdgesChange` to stay in Liveblocks storage; clears payload and calls `fitView`
  - `components/editor/editor-navbar.tsx` — `LayoutTemplate` icon button added to workspace action group
  - `components/editor/editor-chrome.tsx` — `isTemplatesOpen` + `pendingTemplateImport` state; `StarterTemplatesModal` wired; `onOpenTemplates` passed to navbar
  - TypeScript: zero errors, `npm run build` passes
- Feature 17 (spec: 17-canvas-ergonomics.md.md): Canvas Ergonomics — floating control bar + keyboard shortcuts
  - `components/editor/canvas-flow.tsx` — `ControlBar` pill component (bottom-left Panel): zoom out/fit/in + divider + undo/redo; buttons use `rfInstanceRef.current` with `{ duration: 200 }` animation; undo/redo via `useUndo`/`useRedo`; disabled state via `useCanUndo`/`useCanRedo` (opacity-30, pointer-events-none)
  - `hooks/useKeyboardShortcuts.ts` — listens on `window`; skips INPUT/TEXTAREA/contentEditable targets; `+`/`=` zoom in, `-` zoom out, `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo, `Cmd/Ctrl+Y` redo
  - TypeScript: zero errors, `npm run build` passes
- Feature 16 (spec: 16-nodes-color-toolbar.md): Node Color Toolbar
  - `components/editor/canvas-node.tsx` — `SwatchButton` (hover glow via box-shadow with text color alpha, active outline ring); `ColorToolbar` (floats 8px above node via `bottom: calc(100% + 8px)`, stops pointer/mouse events to prevent drag); `useReactFlow().updateNodeData` for Liveblocks-backed color changes; wired into all six shapes
  - `types/canvas.ts` — `NODE_COLORS` (8 fill/text pairs per ui-context.md palette), `DEFAULT_NODE_COLOR`, `NodeColor` type
  - Text color derived from fill via palette lookup — both update atomically when a swatch is clicked
  - TypeScript: zero errors, `npm run build` passes
- Feature 16: Edge Behavior and Custom Edge Renderer
  - `components/editor/canvas-edge.tsx` — `CanvasEdgeComponent`: `getSmoothStepPath` for right-angle routing; wide transparent stroke (20px) for hit area; visible stroke dims to 0.45 opacity at rest, full opacity on hover/select; `EdgeLabelRenderer` positioned at `labelX/labelY` from path; double-click opens `EdgeLabelInput` (auto-growing); saved labels as pill badges; faint "Add label…" hint on active unlabelled edges; `updateEdgeData` for collaborative label updates; all pointer events blocked from propagating to canvas
  - `types/canvas.ts` — `CanvasEdgeData` with `label?: string`; `CanvasEdge` updated to use it
  - `components/editor/canvas-node.tsx` — handles styled as 8px white dots with dark border; hidden at opacity 0 by default, fade to 1 on node hover via `nodeHovered` state; both source and target handles on all four sides
  - `components/editor/canvas-flow.tsx` — registers `canvasEdgeTypes`; `defaultEdgeOptions` sets `type: 'canvasEdge'` and `markerEnd: ArrowClosed` with `#f8fafc` color
  - TypeScript: zero errors, `npm run build` passes
- Feature 15: Node Color Toolbar
  - `components/editor/canvas-node.tsx` — `SwatchButton` (hover glow via box-shadow with text color alpha, active outline ring); `ColorToolbar` (floats 8px above node via `bottom: calc(100% + 8px)`, stops pointer/mouse events to prevent drag); both `useReactFlow().updateNodeData` for Liveblocks-backed color changes
  - TypeScript: zero errors, `npm run build` passes
- Feature 14: Node Resizing and Inline Label Editing
  - `components/editor/canvas-node.tsx` — `NodeResizer` (visible when selected, min 60×40, subtle accent handles); `LabelEditor` textarea overlay on double-click: updates via `useReactFlow().updateNodeData`, closes on blur or Escape, stops pointer/mouse propagation to prevent canvas drag
  - TypeScript: zero errors, `npm run build` passes
- Feature 13: Node Shape Rendering
  - `components/editor/canvas-node.tsx` — CSS shapes (rectangle → `rounded-xl`, pill/circle → `rounded-full`) with dynamic border (`--border-subtle` at rest, `--accent-primary` when selected); SVG shapes (diamond, hexagon, cylinder) with `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, and `vectorEffect="non-scaling-stroke"`; all shapes scale with node dimensions
  - `components/editor/shape-panel.tsx` — drag ghost preview via React portal: suppresses default browser ghost with transparent `setDragImage`, tracks cursor with `onDrag` (filters (0,0) terminal event), renders matching shape at default size centered on cursor, clears on `onDragEnd`
  - TypeScript: zero errors, `npm run build` passes
- Feature 12: Shape Panel
  - `types/canvas.ts` — extended `NodeShape` to all 6 shapes + `NODE_COLORS` (8 pairs) + `DEFAULT_NODE_COLOR` + `NODE_SHAPES` (defaults per shape) + `ShapeDragPayload`
  - `components/editor/canvas-node.tsx` — `CanvasNodeComponent`: bordered rectangle renderer with centered label, 4 handles; `canvasNodeTypes` map
  - `components/editor/shape-panel.tsx` — floating pill toolbar with draggable buttons for all 6 shapes; drag payload includes shape + default size
  - `components/editor/canvas-flow.tsx` — registers `canvasNodeTypes`, `onInit` captures React Flow instance; `dragover`/`drop` handlers convert screen coords → flow position and create new nodes with shape payload; `ShapePanel` via React Flow `Panel`
  - TypeScript: zero errors, `npm run build` passes
- Feature 11: Base Canvas
  - `types/canvas.ts` — `CanvasNodeData` (label, color, shape) + `CanvasNode` / `CanvasEdge` custom types
  - `components/editor/canvas-room.tsx` — `LiveblocksProvider` + `RoomProvider` + `ErrorBoundary` + `ClientSideSuspense`
  - `components/editor/canvas-flow.tsx` — `useLiveblocksFlow` (suspense) wired to `ReactFlow` with `MiniMap`, dot `Background`, `Cursors`, `fitView`, loose connections
  - `WorkspaceChrome` updated to accept `roomId` and render `CanvasRoom`
  - `app/editor/[roomId]/page.tsx` passes `roomId` to `WorkspaceChrome`
  - TypeScript: zero errors, `npm run build` passes
- Feature 10: Liveblocks Setup
  - `liveblocks.config.ts` — Presence (cursor, isThinking) + UserMeta (name, avatar, color) types
  - `lib/liveblocks.ts` — lazy-cached node client (`getLiveblocks()`) + deterministic cursor color helper
  - `app/api/liveblocks-auth/route.ts` — POST: Clerk auth, project access check, `getOrCreateRoom`, ID token
  - TypeScript: zero errors, `npm run build` passes
- Feature 09: Share Dialog
  - `app/api/projects/[projectId]/collaborators/route.ts` — GET (list, Clerk-enriched), POST (invite, owner-only)
  - `app/api/projects/[projectId]/collaborators/[collaboratorId]/route.ts` — DELETE (owner-only)
  - `components/editor/share-dialog.tsx` — invite/remove/copy-link, owner vs collaborator views
  - `lib/project-access.ts` — `getAccessibleProject` now returns `isOwner`
  - `WorkspaceContext` extended with `setWorkspaceProject`; `WorkspaceChrome` sets it on mount
  - Share button in `EditorNavbar` wired; `EditorChrome` manages share dialog state
  - TypeScript: zero errors, `npm run build` passes
- Feature 08: Editor Workspace Shell
  - `lib/project-access.ts` — `getCurrentIdentity` + `getAccessibleProject` helpers
  - `components/editor/access-denied.tsx` — centered lock icon + message + back link
  - `app/editor/[roomId]/page.tsx` — server component: auth redirect, access check, workspace layout
  - `components/editor/workspace-chrome.tsx` — client component: workspace navbar (project name, share, AI toggle), canvas placeholder, AI sidebar placeholder
  - `components/editor/project-sidebar.tsx` — active project highlighting + Link navigation
  - `components/editor/editor-chrome.tsx` — passes `activeProjectId` to `ProjectSidebar`
  - TypeScript: zero errors, `npm run build` passes
- Feature 07: Wire Editor Home
  - `lib/projects.ts` — `getOwnedProjects` + `getSharedProjects` server-side data helpers
  - `hooks/use-project-actions.ts` — unified hook: dialog state, room ID preview (slug+suffix), create/rename/delete mutations with `useRouter` navigation
  - `app/editor/layout.tsx` — async server component, fetches owned+shared projects via Clerk `auth()`/`currentUser()`, passes to `EditorChrome`
  - `app/editor/page.tsx` — converted to server component; "New Project" button extracted to `components/editor/new-project-button.tsx`
  - `EditorChrome` — accepts `ProjectData[]` props, uses `useProjectActions`, extracts active project ID from `usePathname`
  - `ProjectSidebar` — real project data from props; owned items show Pencil/Trash, shared items have no actions
  - All three dialog components wired with `onSubmit` + `isLoading`; create dialog shows Room ID preview
  - TypeScript: zero errors, `npm run build` passes
- Feature 06: Project APIs
  - `app/api/projects/route.ts` — GET (list owner's projects), POST (create, default name `Untitled Project`)
  - `app/api/projects/[projectId]/route.ts` — PATCH (rename, owner-only), DELETE (owner-only, 204)
  - `lib/prisma.ts` — fixed union type; `prisma` now exports as `PrismaClient` with `as unknown as PrismaClient` cast for Accelerate branch
  - Auth: 401 for unauthenticated, 403 for non-owner mutations
  - TypeScript: zero errors, `npm run build` passes
- Feature 05: Prisma Schema And Data Layer
  - `prisma/models/project.prisma` — `Project` + `ProjectCollaborator` models with correct relations, indexes, cascade delete
  - `lib/prisma.ts` — cached singleton branching on `prisma+postgres://` (Accelerate) vs direct `@prisma/adapter-pg`
  - Migration `20260529140255_init` applied to Prisma Postgres
  - Client generated to `app/generated/prisma/`
  - TypeScript: zero errors, `npm run build` passes
- Feature 04: Project Dialogs & Editor Home
  - `useProjectDialogs` hook — owns dialog type, target, form name, loading state
  - `ProjectDialogsContext` — exposes `openCreate` to child routes via context
  - Three dialog components in `components/editor/dialogs/`: Create (with live slug preview), Rename (prefilled + auto-focus + Enter to submit), Delete (destructive confirm)
  - `EditorChrome` updated: uses hook, provides context, renders dialogs
  - `ProjectSidebar` updated: mock projects, owned items show Pencil/Trash on hover, shared items have no actions, mobile backdrop scrim
  - `app/editor/page.tsx`: editor home with heading, description, New Project button wired to create dialog
  - TypeScript: zero errors, `npm run build` passes
- Feature 03: Auth
  - `ClerkProvider` wraps root layout with `@clerk/ui` bundled, dark theme from `@clerk/ui/themes`, CSS variable overrides
  - `proxy.ts` at root — protected-first middleware, public routes: `/sign-in`, `/sign-up`
  - `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` — two-panel layout (left panel hidden on mobile)
  - `/` redirects authenticated → `/editor`, unauthenticated → `/sign-in`
  - `UserButton` added to editor navbar right section
  - TypeScript: zero errors, `npm run build` passes
- Feature 02: Editor Chrome
  - `EditorNavbar`: fixed h-12 top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, bg-surface + bottom border
  - `ProjectSidebar`: fixed overlay, slides from left, Projects header + close, Tabs (My Projects/Shared), New Project button
  - Dialog pattern: existing `components/ui/dialog.tsx` already supports title, description, and footer actions — ready for use
  - TypeScript: zero errors
- Feature 01: Design System
  - shadcn/ui initialized (style: base-nova, Tailwind v4, RSC, TSX)
  - Components added: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea → `components/ui/`
  - `lucide-react` installed
  - `lib/utils.ts` created with `cn()` helper (clsx + tailwind-merge)
  - `globals.css` configured with all dark theme CSS custom property tokens and `@theme inline` mapping
  - shadcn semantic tokens wired to Ghost AI dark theme — no light defaults remain
  - TypeScript: zero errors

## In Progress

- (none)

## Next Up

- (none)

## Open Questions

- None.

## Architecture Decisions

- Tailwind v4 with CSS-native theme via `@theme inline` in globals.css — no tailwind.config.js.
- shadcn/ui components live in `components/ui/` and must not be modified after installation.
- Dark-only theme: shadcn semantic tokens (`--background`, `--foreground`, etc.) defined once in `:root` with our hex values — no `.dark {}` override block needed.

## Session Notes

- Project uses Next.js 16.2.6, Tailwind v4 (@tailwindcss/postcss), TypeScript strict mode.
- shadcn style is `base-nova` (chosen by CLI defaults).
- `@import "shadcn/tailwind.css"` handles shadcn → Tailwind utility mapping in CSS.

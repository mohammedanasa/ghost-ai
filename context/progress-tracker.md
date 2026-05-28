# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 03: Auth — complete

## Current Goal

- Ready for next feature spec.

## Completed

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

- None.

## Next Up

- Feature 04 (next feature spec)

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

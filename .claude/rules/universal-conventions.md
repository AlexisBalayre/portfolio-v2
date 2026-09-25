---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Universal TypeScript Conventions: Quick Reference

**CRITICAL:** These rules apply to EVERY TypeScript file in the project. See `@docs/conventions/general.md` for the full doc.

## File naming (enforced by `.claude/hooks/validate-file-naming.sh`)

| Location | Pattern | Example |
| :--- | :--- | :--- |
| `app/` | Next.js reserved names only | `page.tsx`, `layout.tsx`, `route.ts` |
| `components/`, `public/assets/logos/` | PascalCase component | `Header.tsx`, `ProjectCard.tsx` |
| `hooks/` | `use` + PascalCase, re-exported from `hooks/index.ts` | `useOutsideClick.ts` |
| `lib/` | camelCase | `structuredData.ts` |

## Imports

- **Always the `~~/` alias** for project files (`~~/components/Header`). Never `../` chains.
- Order: `react`, `next/*`, third-party, `@heroicons/*`, `~~/*`. Match the neighbouring file.
- Icons come from `@heroicons/react/24/outline` (or `/solid`), imported by name.

## Exports

- `app/**` files use `export default` (framework requirement).
- Components: one component per file, exported under the file's name. Match the neighbouring file's style (`export default` or `export const`); do not mix both in one file.

## Client vs server

- `"use client"` only where the file uses hooks, browser APIs, or event handlers. `layout.tsx` stays a server component.

## Type safety

- Type props with an `interface` at the top of the file. No `any` for content data: derive the shape from the JSON (see `Projects.tsx`); `any[]` in `Timeline.tsx` is legacy, do not copy it.
- Boolean names start with `is` / `has` / `should`.

## Content stays in JSON

- No portfolio copy hardcoded in components (names, dates, descriptions, project links). It lives in `public/assets/data/<locale>/*.json` (UI strings in `ui.json`).
- No hardcoded site URL outside `lib/site.ts` (`siteUrl`), which `app/[locale]/layout.tsx`, `app/sitemap.ts` and `app/robots.ts` import.

## Comments and clean code

- Inline `//` comments explain WHY, never WHAT. No section banners, no journal comments, no commented-out code.
- No em-dash in code, comments, or docs; use a colon, comma, or hyphen.
- DELETE old code when replacing it. YAGNI.

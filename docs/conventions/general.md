# General Conventions

Universal rules for **every** `*.ts` / `*.tsx` file in the repo. Area docs
([frontend](frontend.md), [content](content.md)) layer on top of these; they never relax them.
The quick reference in `.claude/rules/universal-conventions.md` points here.

## File naming

Enforced by `.claude/hooks/validate-file-naming.sh` on every new file.

| Location | Pattern | Example | Why |
| :--- | :--- | :--- | :--- |
| `app/` | Next.js reserved names only (`page`, `layout`, `loading`, `error`, `not-found`, `route`, `sitemap`, `robots`, `manifest`, `opengraph-image`, …) | `app/page.tsx` | The App Router gives these files meaning; anything else under `app/` is either a route segment folder or misplaced UI. |
| `components/` | PascalCase, one component per file | `Header.tsx`, `ProjectCard.tsx` | Matches the exported component name. |
| `public/assets/logos/` | PascalCase `*Logo.tsx` | `GithubLogo.tsx` | Inline SVG React components. |
| `hooks/` | `use` + PascalCase, re-exported from `hooks/index.ts` | `useOutsideClick.ts` | React hook naming rule; the barrel keeps `import { useX } from "~~/hooks"` stable. |
| `lib/` (if introduced) | camelCase | `formatDate.ts` | Plain utilities. |

## Imports

- **Always the `~~/` alias** (`tsconfig.json` maps `~~/*` to the repo root): `~~/components/Header`, `~~/public/assets/data/projects.json`. Never `../../` chains.
- **Order**: `react`, `next/*`, third-party, `@heroicons/*`, `~~/*`. No import-sorting plugin is installed; keep the order by hand and match the neighbouring file.
- **Icons**: `@heroicons/react/24/outline` by default, `/solid` for filled variants. Import by name; never the whole package.
- **JSON content** is imported directly (`import projects from "~~/public/assets/data/projects.json"`); `resolveJsonModule` is on.

## Exports

- Files under `app/` use `export default` because Next.js requires it.
- Components export one component under the file's name. The repo has both styles (`export const Header` in `Header.tsx`, `export default Projects` in `Projects.tsx`): match the style of the file you are editing and of the file that imports it. Never mix a default and a same-named named export in one file.

## Client vs server components

- Add `"use client"` only when the file uses hooks, browser APIs (`window`, `IntersectionObserver`), or event handlers. `app/layout.tsx` is a server component and must stay one: it owns `metadata`, which cannot live in a client file.
- `app/page.tsx` is a client component today because of the About-Me `IntersectionObserver`. Do not move server-only concerns (metadata, JSON-LD) into it.

## Type safety

- Props are typed with an `interface` declared at the top of the component file (`ProjectsProps`, `SkillsProps`). This repo is too small for a `types/` folder; do not create one for a single interface.
- **Content data is typed from its JSON shape.** `Projects.tsx` and `Skills.tsx` declare the item interface; `Timeline.tsx` still uses `any[]`, which is legacy. When touching it, type it (`TimelineItem { logo; title; period; description }`), do not copy the `any`.
- `@typescript-eslint/no-explicit-any` is off in `.eslintrc.json`; that is a permission, not an invitation.
- Boolean names start with `is` / `has` / `should` (`isActive`, `isOpen`).

## Content stays in JSON

The whole point of the architecture: **portfolio copy does not live in components.** Experiences, hackathons, education, projects, and skills come from `public/assets/data/*.json` and are rendered by generic components. When you are about to type a company name, a date, or a project description into a `.tsx` file, stop and put it in the JSON (see [content.md](content.md)).

Two deliberate exceptions:

- The **About Me** block in `app/page.tsx` (name, nationality, location, degrees, bio paragraph).
- The **SEO constants and JSON-LD** in `app/layout.tsx` (`siteUrl`, `siteName`, descriptions, employer, alumni).

No hardcoded site URL anywhere else; `siteUrl` in `layout.tsx` and `siteUrl` in `next-sitemap.config.js` are the two sources.

## Comments

- Inline `//` comments explain **WHY, not WHAT**. If deleting the comment would not confuse a reader, delete it.
- No `// === Section ===` banners inside code. JSX section markers like `{/* Projects */}` in `page.tsx` are the one accepted pattern because the page is a single long tree.
- No journal or changelog comments. No commented-out code. Git is the history.
- **No em-dash** (`—` / `–`) in code, comments, docs, or PR text. Use a colon, comma, or hyphen.

## Clean code

- **Delete old code when you replace it.** No shims, no `// removed` markers, no compat re-exports.
- **YAGNI.** No abstractions for a second page, a CMS, or i18n until they exist.

# General Conventions

Universal rules for **every** `*.ts` / `*.tsx` file in the repo. Area docs
([frontend](frontend.md), [content](content.md)) layer on top of these; they never relax them.
The quick reference in `.claude/rules/universal-conventions.md` points here.

## File naming

Enforced by `.claude/hooks/validate-file-naming.sh` on every new file.

| Location | Pattern | Example | Why |
| :--- | :--- | :--- | :--- |
| `app/` | Next.js reserved names only (`page`, `layout`, `loading`, `error`, `not-found`, `route`, `sitemap`, `robots`, `manifest`, `opengraph-image`, …), under `app/[locale]/` except the site-wide `sitemap.ts`, `robots.ts`, `not-found.tsx` and the pass-through `layout.tsx` at the root | `app/[locale]/page.tsx`, `app/sitemap.ts` | The App Router gives these files meaning; anything else under `app/` is either a route segment folder or misplaced UI. Every page sits under the locale segment so it is built once per language; the sitemap and robots files describe the whole site once. |
| `components/` | PascalCase, one component per file | `Header.tsx`, `ProjectCard.tsx` | Matches the exported component name. |
| `public/assets/logos/` | PascalCase `*Logo.tsx` | `GithubLogo.tsx` | Inline SVG React components. |
| `hooks/` | `use` + PascalCase, re-exported from `hooks/index.ts` | `useOutsideClick.ts` | React hook naming rule; the barrel keeps `import { useX } from "~~/hooks"` stable. |
| `lib/` | camelCase | `posts.ts`, `site.ts` | Plain utilities and loaders. |
| `content/blog/` | lowercase, hyphenated `<slug>.mdx`, French version `<slug>.fr.mdx` | `introducing-the-blog.mdx` | The file name is the URL; the locale suffix picks the language. |
| `public/assets/data/` | `<locale>/<file>.json`, same file names in `en/` and `fr/` | `en/projects.json`, `fr/projects.json` | One folder per locale, mirrored entry for entry. |

## Imports

- **Always the `~~/` alias** (`tsconfig.json` maps `~~/*` to the repo root): `~~/components/Header`, `~~/lib/portfolio`. Never `../../` chains.
- **Order**: `react`, `next/*`, third-party, `@heroicons/*`, `~~/*`. No import-sorting plugin is installed; keep the order by hand and match the neighbouring file.
- **Icons**: `@heroicons/react/24/outline` by default, `/solid` for filled variants. Import by name; never the whole package.
- **JSON content** is imported in exactly two places: `lib/portfolio.ts` (the six content files of each locale, behind `getPortfolio(locale)`) and `lib/i18n.ts` (the two dictionaries, behind `getDictionary(locale)`); `resolveJsonModule` is on. Pages and components go through those loaders, never through a JSON import of their own. **MDX content** is never imported: `lib/posts.ts` reads `content/blog/` from disk at build time.

## Exports

- Files under `app/` use `export default` because Next.js requires it.
- Components export one component under the file's name. The repo has both styles (`export const Header` in `Header.tsx`, `export default Projects` in `Projects.tsx`): match the style of the file you are editing and of the file that imports it. Never mix a default and a same-named named export in one file.

## Client vs server components

- Add `"use client"` only when the file uses hooks, browser APIs (`window`, `IntersectionObserver`), or event handlers. `app/[locale]/layout.tsx` is a server component and must stay one: it owns `generateMetadata`, which cannot live in a client file.
- `app/[locale]/page.tsx` is a server component; the About-Me `IntersectionObserver` lives in `components/AboutMe.tsx`, the only client block of the home page. Keep it that way: the page passes the blog posts (read from disk) and the About Me JSON to the components.

## Type safety

- Props are typed with an `interface` declared at the top of the component file (`ProjectsProps`, `SkillsProps`). This repo is too small for a `types/` folder; do not create one for a single interface.
- **Content data is typed from its JSON shape.** `lib/portfolio.ts` derives `TimelineItem`, `Project`, `SkillCategory` and `About` from the English files and `lib/i18n.ts` derives `Dictionary` from `en/ui.json`, so a French file that drifts fails typecheck (keys) or the build (entries). Components declare the item interface they render (`Projects.tsx`, `Skills.tsx`, `Timeline.tsx`) and take a `locale: Locale` prop; the shapes are structurally compatible with the loader's.
- `@typescript-eslint/no-explicit-any` is off in `.eslintrc.json`; that is a permission, not an invitation.
- Boolean names start with `is` / `has` / `should` (`isActive`, `isOpen`).

## Content stays in JSON

The whole point of the architecture: **no copy lives in components, in either language.** Experiences, hackathons,
education, projects, skills and the About Me block come from `public/assets/data/<locale>/*.json`; every UI string
(menu labels, section titles, button and aria labels, SEO titles and descriptions, the blog title, the social-card
text, the footer line) comes from `public/assets/data/<locale>/ui.json`; blog posts come from `content/blog/*.mdx`
and `*.fr.mdx`; all of it is rendered by generic components that take a `locale`. When you are about to type a
company name, a date, a project description or any sentence into a `.tsx` file, stop and put it in the JSON of both
locales (see [content.md](content.md)). The build refuses a French data file with a missing entry and typecheck
refuses a missing dictionary key.

What stays in code: proper nouns that are not copy (`Alexis Balayre`, the site URL, e-mail, social profile URLs,
the resume and Calendly URLs) and structural tokens (section ids, project ids, tier keys, the locale list).

No hardcoded site URL anywhere else; `siteUrl` in `lib/site.ts` is the one source, and `app/sitemap.ts`, `app/robots.ts`
and the layout all import it from there. The one other copy is `SITE_URL` in `.github/workflows/indexnow.yaml`, which
runs outside the build.

## Comments

- Inline `//` comments explain **WHY, not WHAT**. If deleting the comment would not confuse a reader, delete it.
- No `// === Section ===` banners inside code. JSX section markers like `{/* Projects */}` in `page.tsx` are the one accepted pattern because the page is a single long tree.
- No journal or changelog comments. No commented-out code. Git is the history.
- **No em-dash** (`—` / `–`) in code, comments, docs, or PR text. Use a colon, comma, or hyphen.

## Clean code

- **Delete old code when you replace it.** No shims, no `// removed` markers, no compat re-exports.
- **YAGNI.** No abstractions for a CMS, a third locale or plural rules until they exist; the locale layer is a list, a URL rule and a typed JSON dictionary, and stays that small.

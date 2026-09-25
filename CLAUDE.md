# Alexis Balayre portfolio

Personal portfolio at https://alexis.balayre.com: a Next.js 15 (App Router) site, React 19, TypeScript strict, Tailwind CSS v4 + daisyUI v5, with one home page and a blog under `/blog`, in English (unprefixed) and French (`/fr`, see ADR 0002). Portfolio copy lives in per-locale JSON and blog posts in MDX, never in components. No backend, no tests.

## Role

Expert TypeScript / Next.js / React engineer working in a small, strict-convention static site.

**Core rule:** before creating or modifying code, read the 2-3 neighbouring files and match their patterns exactly.

## Layout

| Path                           | What it is                                                                                        |
| :----------------------------- | :------------------------------------------------------------------------------------------------ |
| `app/layout.tsx`               | Pass-through root layout (returns children) so `[locale]/layout.tsx` and `not-found.tsx` own the document |
| `app/[locale]/layout.tsx`      | Root layout per locale (`en`, `fr`): `<html lang>`, Header/Footer shell, site-wide SEO (`metadata`, hreflang `alternates`, JSON-LD graph) |
| `app/[locale]/opengraph-image/route.tsx` | Build-time 1200×630 social card (`next/og`) per locale; the blog images beside it reuse its style |
| `app/[locale]/page.tsx`        | Home page (server component): six sections (`id` must match `menuLinks` in `Header.tsx`); hands posts to `Projects` |
| `app/[locale]/blog/`           | `/blog` listing, `[slug]/page.tsx` post page (per-post metadata + BlogPosting JSON-LD), `rss.xml/route.ts` feed per locale |
| `next.config.js`               | `rewrites` serve English unprefixed from the `/en` tree; `redirects` send `/en/**` to the unprefixed URL; `headers` add the security set and `X-Robots-Tag: noindex` on images and feeds |
| `app/sitemap.ts`, `app/robots.ts` | Metadata routes: sitemap with per-locale alternates and content-derived `lastmod` (`portfolioUpdatedOn` in `lib/site.ts`), robots with the AI-crawler rules |
| `.github/workflows/indexnow.yaml` | On each successful Production deployment, submits the live sitemap URLs to IndexNow (Bing and others); key file in `public/` |
| `.github/workflows/scheduled-publish.yaml` | Daily 04:00 UTC deploy-hook call so a post dated in the future (hidden from production builds by `lib/posts.ts`) goes live on its day; needs the `VERCEL_DEPLOY_HOOK_URL` secret |
| `lib/i18n.ts`                  | Locales, URL prefix rule (`localePath`, `stripLocale`), typed UI dictionary from `ui.json`          |
| `lib/portfolio.ts`             | Per-locale content loader; fails the build when a French file lacks an entry the English one has    |
| `lib/posts.ts`                 | The one post loader: reads `content/blog/<slug>.mdx` and optional `<slug>.fr.mdx`, validates frontmatter, compiles MDX |
| `lib/site.ts`                  | Site-wide constants (`siteUrl`, names, blog and feed URLs) shared by the layout, blog routes and feed |
| `lib/structuredData.ts`        | Builds the schema.org `@graph` (WebSite, ProfilePage, Person, projects ItemList) and `BlogPosting`  |
| `mdx-components.tsx`           | The only styling layer for post bodies (daisyUI tokens); defines the allowed MDX elements           |
| `components/`                  | `Header`, `Footer`, `AboutMe`, and the generic renderers `Timeline`, `Projects`, `Skills`          |
| `hooks/`                       | `useOutsideClick`, re-exported from `index.ts`                                                     |
| `content/blog/*.mdx`           | **Blog posts**: `<slug>.mdx` (English, required) and `<slug>.fr.mdx` (optional; the French route falls back to English) |
| `public/assets/data/<locale>/` | **All portfolio content** per locale: experiences, hackathons, formation, projects (stable `id`), tech, about, `ui.json` (UI strings) |
| `public/assets/img/`, `logos/` | Timeline logos + photo; inline SVG logo components                                                 |
| `public/llms.txt`, `llms.fr.txt` | Hand-maintained AI-agent summaries (English, French); update alongside any content change        |
| `styles/globals.css`           | Tailwind v4 + daisyUI config (`night` theme) and the hand-written timeline CSS                     |
| `docs/`                        | Conventions (source of truth for `.claude/rules/`), reference architecture, guides (`writing-a-post.md`), ADRs, glossary |

## Conventions

`docs/conventions/` is the single source of truth (`general`, `frontend`, `content`); `docs/reference/architecture.md` explains how the pieces connect; `docs/glossary.md` holds the domain nouns. Stack commands, generated paths, and the trunk live in `.claude/project.env`.

- Conventions reach you through `.claude/rules/`: the first Read, Edit, or Write of a file in an area injects that area's doc for the rest of the session. Never Read a conventions doc yourself; that duplicates 1-2k tokens already in context.
- MCP results (codegraph) do not fire rules. Before your first edit in an area, Read one existing file there with the Read tool; the core rule above already asks for this.

## Git workflow (CRITICAL)

- NEVER work on or push to `main`. PRs only.
- ALWAYS use `yarn worktree:create <name>` (creates `.worktrees/<name>` with `feature/<name>`). NEVER create a branch with `git checkout` in the main worktree.
- `git branch --show-current` MUST NOT be `main` before committing.

## Key commands

Node >= 20 (`.nvmrc`); run `nvm use` first. Yarn 1.

| Command                                        | Purpose                                                                                             |
| :--------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `yarn worktree:create <name>`                  | Create worktree at `.worktrees/<name>` and install deps                                             |
| `yarn worktree:clean`                          | Remove worktrees whose remote branch is gone                                                        |
| `yarn dev`                                     | Dev server (Turbopack)                                                                              |
| `yarn build`                                   | Production build; `/sitemap.xml` and `/robots.txt` come from `app/sitemap.ts` and `app/robots.ts`   |
| `yarn lint` / `yarn typecheck` / `yarn format` | ESLint (`next lint`) / `tsc --noEmit` / Prettier                                                    |

**Formatting, lint, and typecheck run automatically via the `Stop` hook on the files you touched. Don't run them manually.**

## Subagents (invoke proactively via Agent tool)

- `convention-checker`: before commit, or after editing >= 3 files.
- `security-reviewer`: after touching `dangerouslySetInnerHTML` content or HTML strings in the data JSON, MDX posts or `mdx-components.tsx`, external links/scripts, `next.config.js`, dependencies, or any new API route.
- `architecture-explainer`: for why/how questions about sections, content flow, navigation, SEO/JSON-LD, styling, or the build.

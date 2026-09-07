# Alexis Balayre portfolio

Personal portfolio at https://alexis.balayre.com: a single-page Next.js 15 (App Router) site, React 19, TypeScript strict, Tailwind CSS v4 + daisyUI v5. All portfolio copy lives in JSON, not components. No backend, no tests.

## Role

Expert TypeScript / Next.js / React engineer working in a small, strict-convention static site.

**Core rule:** before creating or modifying code, read the 2-3 neighbouring files and match their patterns exactly.

## Layout

| Path                           | What it is                                                                                        |
| :----------------------------- | :------------------------------------------------------------------------------------------------ |
| `app/layout.tsx`               | Server component: Header/Footer shell, **all SEO** (`metadata` + WebSite/Person JSON-LD)           |
| `app/page.tsx`                 | The one page: six sections (`id` must match `menuLinks` in `Header.tsx`)                           |
| `components/`                  | `Header`, `Footer`, and the generic renderers `Timeline`, `Projects`, `Skills`                    |
| `hooks/`                       | `useOutsideClick`, re-exported from `index.ts`                                                     |
| `public/assets/data/*.json`    | **All content**: experiences, hackathons, formation, projects, tech                                |
| `public/assets/img/`, `logos/` | Timeline logos + photo; inline SVG logo components                                                 |
| `public/llms.txt`              | Hand-maintained AI-agent summary; update alongside any content change                             |
| `styles/globals.css`           | Tailwind v4 + daisyUI config (`night` theme) and the hand-written timeline CSS                     |
| `docs/`                        | Conventions (source of truth for `.claude/rules/`), reference architecture, workflow, glossary     |

## Conventions

Path-scoped rules in `.claude/rules/*.md` auto-load the matching `docs/conventions/<area>.md` when you touch a file in that area (`general`, `frontend`, `content`). `docs/conventions/` is the single source of truth; `docs/reference/architecture.md` explains how the pieces connect; `docs/README.md` holds the glossary.

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
| `yarn build`                                   | Production build; `postbuild` regenerates `public/sitemap*.xml` + `robots.txt` (never edit those)   |
| `yarn lint` / `yarn typecheck` / `yarn format` | ESLint (`next lint`) / `tsc --noEmit` / Prettier                                                    |

**Formatting, lint, and typecheck run automatically via the `Stop` hook on the files you touched. Don't run them manually.**

## Subagents (invoke proactively via Agent tool)

- `convention-checker`: before commit, or after editing >= 3 files.
- `security-reviewer`: after touching `dangerouslySetInnerHTML` content or HTML strings in the data JSON, external links/scripts, `next.config.js`, dependencies, or any new API route.
- `architecture-explainer`: for why/how questions about sections, content flow, navigation, SEO/JSON-LD, styling, or the build.

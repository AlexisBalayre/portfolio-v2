---
name: find-dead-code
description: Detect dead-code candidates in this repo (unused components, hooks, logo SVGs, images, CSS classes, data fields) and hand back a ranked list with per-category verification checklists.
disable-model-invocation: true
---

# Find Dead Code

Surface candidates. Never delete. The user verifies and removes.

## Rules

1. **Detect and report only.** Do not run `rm`, `git rm`, or edit imports as part of this skill.
2. **A candidate is a hypothesis, not a verdict.** Every candidate ships with the verification recipe below; the user runs the final eye.
3. **Scope before running.** Ask the user which category, or run all of them if they said "find dead code" with no scope. The repo is small; a full pass is fine.
4. **No em-dash in output.** Project convention.

## Categories

### A. Unreferenced components, hooks, and logo SVGs

Files under `components/`, `hooks/`, and `public/assets/logos/` that nothing imports.

Detection: for `components/Foo.tsx`, grep for `components/Foo"` and `from "~~/components/Foo`; for hooks, grep the hook name and check `hooks/index.ts` re-exports are themselves consumed.

### B. Unused exports

Named exports nothing imports (e.g. a second export next to a component's default export). For `export const fooBar`, grep `\bfooBar\b` across `app/`, `components/`, `hooks/`.

### C. Orphan images

Files in `public/assets/img/` not referenced by any `logo` / `image` field in `public/assets/data/<locale>/*.json`, any `src=` in TSX, or `app/[locale]/layout.tsx` metadata or `app/[locale]/opengraph-image/route.tsx` (favicons, `alexis.jpg`).

```sh
for f in public/assets/img/*; do b=$(basename "$f"); grep -rq "$b" app components public/assets/data public/site.webmanifest || echo "$f"; done
```

### D. Dead CSS

Classes defined in `styles/globals.css` (the hand-written timeline block: `.timeline`, `.containerBis`, `.left`, `.right`, `.content`, pseudo-elements) that no TSX file uses. Grep each class name across `components/` and `app/`.

### E. Unused JSON fields and dependencies

- Fields present in `public/assets/data/<locale>/*.json` items that no component reads (compare against the prop interfaces in `Timeline.tsx`, `Projects.tsx`, `Skills.tsx`).
- `package.json` dependencies with no import anywhere (check `@vercel/analytics` and `@heroicons/react` icon usage).

## Mandatory verification recipe (per candidate, before flagging)

Run all four. A single hit moves the candidate from "dead" to "live" (or "uncertain").

1. **Repo-wide grep, basename without extension**, across `app/`, `components/`, `hooks/`, `public/`, `styles/`, root config files.
2. **String-literal grep.** Image and logo names live in JSON strings, `layout.tsx` metadata, and `site.webmanifest`, not in imports.
3. **Dynamic usage.** Tailwind/daisyUI class names built by template literals (`` `badge-${tier}` ``) hide static references; check `Skills.tsx` style maps before flagging a CSS class.
4. **Framework conventions.** Files under `app/` (`page.tsx`, `layout.tsx`) and `public/` root files (`favicon.ico`, `site.webmanifest`, `llms.txt`, `robots.txt`, `sitemap*.xml`) are consumed by Next.js or crawlers, never imported. Skip them.

## Output format

Hand back a markdown table per category, ranked by confidence (high = passed every check). Example row:

```
| Confidence | Path                        | Last touched | Why suspect                                   | Verification status |
| ---------- | --------------------------- | ------------ | --------------------------------------------- | ------------------- |
| High       | public/assets/logos/XLogo.tsx | 12 months ago| 0 imports across app/ and components/         | Passed all 4 checks |
| Medium     | public/assets/img/old.png   | 8 months ago | 0 string hits in data JSON or TSX             | Check llms.txt / external links before removing |
```

End with: "Verify each row before removing. Open a worktree per category; do not bundle removals across categories in a single PR."

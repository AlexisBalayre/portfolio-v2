---
name: pr-description
description: Write a PR title and description in this repo's house style, then create or update the PR via gh. Use when asked to draft or rewrite a PR title or body, to open a PR, or when another skill opens a PR. Assumes commits exist on the branch.
---

# Write a PR title and description

> This repo tracks work in GitHub issues on `AlexisBalayre/portfolio-v2`; there is no external
> tracker. Reference an issue as `#NN`. No issue? Drop the id everywhere.

## Workflow

1. **Gather context** (run together):

   ```sh
   git branch --show-current                              # MUST NOT be "main"; abort if it is
   git log main..HEAD --pretty=format:'%h %s%n%b'         # commits on this branch
   git diff main...HEAD --stat                            # changed files + churn
   gh pr view --json number,url,state,title,body 2>/dev/null   # non-zero exit = no PR yet
   ```

   Read the diff for the key files (`git diff main...HEAD -- <path>`); on large diffs lean on `--stat` plus the important files.

2. **Ground in the issue (read-only).** Grep branch name + commit subjects for `#\d+` or `issue-\d+`. If found, `gh issue view <n>` for *What/Why* and the canonical link. No id: derive from diff + commits.

3. **Select sections** from the diff (table below). Only include sections that apply.

4. **Draft title + body together.** Title per [Title format](#title-format); body to a temp file (`mktemp`) per [TEMPLATE.md](TEMPLATE.md). For an existing PR, treat the current title as a draft, not a constraint.

5. **Create or update the PR.** Show the drafted **title** and **body** + the exact `gh` command; quick confirm before running unless told to just do it.

   ```sh
   git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || git push -u origin "$(git branch --show-current)"
   # update existing; pass --title only if it changes:
   gh pr edit <number> --body-file <tmp> [--title "<drafted title>"]
   # or create new:
   gh pr create --base main --title "<drafted title>" --body-file <tmp>
   ```

   Report the PR URL.

## Title format

Communicate *what changed and why* at a glance, specific enough that a reviewer can predict the diff. GitHub auto-appends ` (#NNNN)` on merge; do not write it yourself.

```
<type>(<scope>): <summary> (#NN)
```

- **`<type>`**: dominant intent of the diff.

  | Type       | Use for                                     |
  | :--------- | :------------------------------------------ |
  | `feat`     | New section, component, or capability       |
  | `fix`      | Bug fix (layout, links, metadata, build)    |
  | `content`  | Portfolio content only (`public/assets/data/*.json`, `llms.txt`, images) |
  | `refactor` | Code restructuring with no behaviour change |
  | `docs`     | Documentation only (`docs/`, `CLAUDE.md`, READMEs) |
  | `chore`    | Build config, dependencies, tooling, Claude Code config |
  | `perf`     | Performance improvement                     |
  | `security` | Dependency advisories, headers, XSS hardening |

  Mixed diff: pick the user-visible win, mention the rest in `## Notes`.
- **`<scope>`**: optional but usually present. Lowercase kebab. Common scopes in this repo: `ui`, `seo`, `content`, `styles`, `header`, `timeline`, `projects`, `skills`, `deps`, `tooling`, `claude`. Drop the scope when the change is repo-wide.
- **`<summary>`**: imperative present tense, lowercase first word, no trailing period. Proper nouns keep their case (`Next.js`, `Tailwind`, `daisyUI`, `Acolad`); double quotes around identifiers are fine.
- **`(#NN)`**: the GitHub issue the PR addresses; drop entirely if none. Follow-ups with no issue: `(follow-up to #NN)`.

**Lint:**

- No em-dash (`—` / `–`). Hyphen, colon, or rephrase.
- No trailing period; no capital after the colon (proper nouns excepted).
- ≲ 80 chars including `(#NN)`; if over, trim adjectives, not specificity.
- Reject generic verbs (`update`, `improve`, `change`, `various`). Strong fix-title names cause, surface, impact: `fix(timeline): logos stretched on Safari because width/height were unset`, not `fix bug`.

**Worked examples** (paired bodies in [TEMPLATE.md](TEMPLATE.md)):

| Diff shape                            | Title |
| :------------------------------------ | :---- |
| New content entry + llms.txt sync     | `content: add Lia Live AI experience and refresh selected projects` |
| Targeted UI bug, no issue             | `fix(header): mobile menu stays open after navigating to a section` |
| SEO / metadata change                 | `feat(seo): add Person JSON-LD with alumni and employer links (#12)` |
| Dependency security bump              | `security(deps): update Next.js to 15.5.19 (fixes RCE + DoS CVEs)` |
| Repo-wide tooling, no scope           | `chore: add Claude Code config (hooks, rules, review agents)` |

## Section selection

| Section        | Include when                                                                 |
| :------------- | :--------------------------------------------------------------------------- |
| `## What`      | Always. Concrete bullets of what changed.                                    |
| `## How`       | Any code change with a non-obvious approach or notable design decision.      |
| `## Why` / `## Why now` | Docs PRs, or when motivation is not self-evident from What.         |
| `## Content`   | `public/assets/data/*.json`, `public/llms.txt`, or `public/assets/img/` changed. List the entries added, updated, or removed and confirm `llms.txt` / `layout.tsx` metadata were kept in sync. |
| `## Behaviour` | New interaction, layout rule, or edge case worth flagging (mobile vs desktop, theme). |
| `## Notes`     | Asides: "docs-only", "no code change", lint/typecheck green, follow-ups deferred. |

Omit a `## Reviews` section.

## Body rules

- **No em-dash** (`—` / `–`). Hyphen or colon.
- **Issue auto-close.** Add `Closes #NN.` to the body when the PR resolves an issue (the magic word must be in the description, not a comment). Omit when the PR has no issue.
- **No attribution footer.** Never add `🤖 Generated with Claude Code` (or any agent attribution) to the PR body. The `Co-Authored-By` trailer on commits is the only attribution.

# PR body template + worked examples

Sections in this order; include only the ones that apply (see the selection table in
[SKILL.md](SKILL.md)). Bullets are concrete: file names, section names, the exact behaviour.

```md
## What

- <bullet per change; bold the file or section it touches>

## How

<only when the approach is non-obvious>

## Content

- <entries added / updated / removed in public/assets/data/*.json>
- llms.txt and layout.tsx metadata: <synced | not affected>

## Behaviour

- <new interaction, layout rule, or edge case>

## Notes

- <docs-only | no code change | lint + typecheck green | follow-ups deferred>

Closes #NN.
```

---

## Example 1: content update

Title:

```
content: add Lia Live AI experience and refresh selected projects
```

Body:

```md
## What

- **`public/assets/data/experiences.json`**: new top entry for the AI Engineer role at Acolad (Lia Live AI), with the `acolad.png` logo.
- **`public/assets/data/projects.json`**: replaces two archived repos with `claude-code-power-config` and `RagDocs`; images point at `opengraph.githubassets.com` (already in `remotePatterns`).

## Content

- llms.txt: Current Role and Selected Projects sections updated to match.
- layout.tsx metadata: `worksFor` in the Person JSON-LD now names Acolad.

## Notes

- Content only; no component change. Lint + typecheck green.
```

## Example 2: targeted UI fix, no issue

Title:

```
fix(header): mobile menu stays open after navigating to a section
```

Body:

```md
## What

- **`components/Header.tsx`**: close the burger menu in the section-link `onClick` before calling `scrollIntoView`.

## How

The menu state lived only in the outside-click hook, so an in-menu click never toggled it. The link handler now sets `isOpen` to `false` explicitly; `useOutsideClick` is unchanged.

## Behaviour

- Desktop navigation unaffected (no menu state there).

## Notes

- Lint + typecheck green.
```

## Example 3: tooling, repo-wide

Title:

```
chore: add Claude Code config (hooks, rules, review agents)
```

Body:

```md
## What

- **`.claude/`**: settings with permissions + hook wiring, seven deterministic hooks, path-scoped rules, review subagents, and project skills.
- **`docs/`**: conventions (general, frontend, content), reference architecture, worktree workflow.
- **`package.json`**: `lint`, `typecheck`, `format`, `worktree:*` scripts.
- **`CLAUDE.md`**: rewritten as always-on project memory.

## Why

Codifies the worktree-first workflow and gives the agent a quality gate on every response; content edits now get a JSON-shape check and an `llms.txt` sync reminder.

## Notes

- No runtime code change. Lint + typecheck green.
```

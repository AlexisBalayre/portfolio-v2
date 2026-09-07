# Claude Code Configuration

This directory contains all Claude Code customizations for the portfolio. It is an instance of
[claude-code-power-config](https://github.com/AlexisBalayre/claude-code-power-config), trimmed
for a single-package Next.js site: no monorepo rules, no database or gRPC layers, no test
runner, and the generic personal skills stay at user level (`~/.claude/skills/`).

## How It All Fits Together

```
┌─────────────────────────────────────────────────────────┐
│                    Always-On Context                     │
│  CLAUDE.md (layout, git workflow, commands)              │
│  Skill descriptions (names + one-liners)                 │
├─────────────────────────────────────────────────────────┤
│                    On-Demand Context                      │
│  rules/ with paths (load when matching files touched)    │
│    → import docs/conventions/{general,frontend,content}  │
│  Skill full content (load when invoked/relevant)         │
├─────────────────────────────────────────────────────────┤
│                    Isolated Context                       │
│  Subagents (own context window, return summary)          │
├─────────────────────────────────────────────────────────┤
│                    External (Zero Cost)                   │
│  Hooks (shell scripts, no LLM, deterministic)            │
└─────────────────────────────────────────────────────────┘
```

**Context budget matters.** Everything in "Always-On" costs tokens every turn. Rules with
`paths:` and skills load on demand. Subagents run in isolated windows. Hooks cost zero context.

## Directory Structure

```
.claude/
├── settings.json               # Shared project config (permissions, hook wiring, statusline)
├── settings.local.json.example # Template for personal overrides (real file gitignored)
├── statusline.sh               # dir · branch · model · context bar · tokens · cost
│
├── rules/                      # Path-scoped convention rules (auto-load)
│   ├── universal-conventions.md   **/*.ts(x)                        → docs/conventions/general.md
│   ├── frontend-conventions.md    app/ components/ hooks/ styles/   → docs/conventions/frontend.md
│   └── content-conventions.md     public/assets/data/ img/ llms.txt → docs/conventions/content.md
│
├── skills/                     # Project skills (each is <name>/SKILL.md)
│   ├── pr-description/  pr-ci-review/  address-review-comments/          # PR & review
│   ├── resolve-merge-conflicts/  find-dead-code/  improve-codebase-architecture/   # engineering
│   └── grilling/  grill-with-docs/  codebase-design/  domain-modeling/   # thinking / design
│
├── agents/                     # Subagents
│   ├── convention-checker.md  security-reviewer.md  architecture-explainer.md   # proactive
│   ├── review-context.md  review-conventions.md  review-correctness.md         # dispatched by pr-ci-review
│   ├── review-docs.md  review-maintainability.md  review-security.md  review-validator.md
│   └── comment-pruner.md       # dispatched by the comment-pruner Stop hook
│
└── hooks/                      # Deterministic shell scripts (zero LLM cost)
    ├── quality-checks.sh          # Stop: Prettier + ESLint on dirty TS, tsc on the repo
    ├── convention-spot-check.sh   # Stop: advisory content-JSON + TSX checks, llms.txt sync
    ├── comment-pruner.sh          # Stop: dispatch the comment-pruner subagent on new comments
    ├── git-safety.sh              # PreToolUse(Bash): block dangerous git/shell ops
    ├── protect-generated.sh       # PreToolUse(Edit|Write): block sitemap/robots/lockfile edits
    ├── validate-file-naming.sh    # PreToolUse(Write): enforce app/ reserved names, PascalCase, use*
    └── pre-compact-preserve.sh    # PreCompact: inject must-preserve context
```

Catalogs with per-item details: [rules](rules/README.md) · [skills](skills/README.md) ·
[agents](agents/README.md) · [hooks](hooks/README.md).

## Extension Points

### `CLAUDE.md`: project memory

Universal rules Claude sees every session. Kept under ~60 lines. Add only what applies to every
file; area rules go in `rules/`.

### `rules/`: path-scoped conventions

Markdown with `paths:` frontmatter. The universal rule carries a ~40-line quick reference plus an
`@docs/conventions/general.md` import; the area rules are pure `@docs/conventions/<area>.md`
imports (the "split pattern"). Edit the doc, not the rule.

### `skills/`: workflows

`<name>/SKILL.md` with `name` + `description` frontmatter; `disable-model-invocation: true`
makes a skill manual-only. Supporting files (`TEMPLATE.md`, `HTML-REPORT.md`) sit next to it.

### `agents/`: subagents

Markdown with `name`, `description` (say "Use PROACTIVELY" + the trigger), `tools` (minimum
needed), `model` (haiku fast, sonnet balanced, opus deep).

### `hooks/`: deterministic gates

Bash scripts wired in `settings.json`. Read the tool input from stdin (`jq -r '.tool_input…'`),
exit `2` to block with a message on stderr, `0` to allow. Hooks that need the toolchain source
nvm and call `node_modules/.bin` directly.

## Adding new extensions

- **New rule**: create `rules/<area>-conventions.md` with `paths:` + `@docs/conventions/<area>.md`; write the doc; add a row to `rules/README.md`.
- **New skill**: `skills/<name>/SKILL.md`; keep the description to one line that names the trigger; add to `skills/README.md`. Use the user-level `write-a-skill` skill.
- **New agent**: `agents/<name>.md`; add to `agents/README.md` and, if proactive, to the Subagents list in `CLAUDE.md`.
- **New hook**: `hooks/<name>.sh`, `chmod +x`, wire it under the right event in `settings.json` with a timeout; add to `hooks/README.md`.

## Setup

```sh
nvm use && yarn install
cp .claude/settings.local.json.example .claude/settings.local.json   # optional
cp .env.example .env                                                  # optional
cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

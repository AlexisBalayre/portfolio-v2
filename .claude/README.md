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

What a session pays for this config, in approximate tokens (bytes / 4, measured Sept 2026), so
additions stay deliberate:

| Surface | Loaded | Cost |
| :------ | :----- | :--- |
| `CLAUDE.md` | every session | ~1.1k |
| Descriptions of the model-invocable skills | every session | ~0.4k |
| Descriptions of all 11 agents | every session | ~0.7k |
| `universal-conventions` rule + `general.md` | first `.ts` / `.tsx` file touched | ~0.6k + ~1.2k |
| `frontend.md` | first file touched under `app/`, `components/`, `hooks/`, `styles/` | ~1.9k |
| `content.md` | first file touched under `public/assets/data/`, `img/`, or `llms.txt` | ~1.2k |

A rule fires on the first Read, Edit, or Write of a matching path (not on MCP results such as
codegraph) and its `@import` pulls the whole file, so each convention doc is paid once per
session per area. Keep them obligations-only, never instruct the model to Read one, and prefer
`disable-model-invocation: true` for user-only skills since agents have no equivalent switch.

## Directory Structure

```
.claude/
├── settings.json               # Shared project config (permissions, hook wiring, statusline)
├── settings.local.json.example # Template for personal overrides (real file gitignored)
├── project.env                 # Project profile: stack commands, generated paths, trunk, branch prefix
├── spot-checks.tsv             # Grep convention checks run by convention-spot-check.sh
├── statusline.sh               # dir · branch · model · effort · context bar · 5h/7d limits · cost
│
├── rules/                      # Path-scoped convention rules (auto-load)
│   ├── universal-conventions.md   **/*.ts(x)                        → docs/conventions/general.md
│   ├── frontend-conventions.md    app/ components/ hooks/ styles/   → docs/conventions/frontend.md
│   └── content-conventions.md     public/assets/data/ img/ llms.txt → docs/conventions/content.md
│
├── skills/                     # Project skills (each is <name>/SKILL.md)
│   ├── pr-description/  pr-ci-review/  address-review-comments/          # PR & review
│   ├── resolving-merge-conflicts/  find-dead-code/  improve-codebase-architecture/  implement/   # engineering
│   ├── to-spec/  to-tickets/  wayfinder/  to-questionnaire/              # planning & tickets
│   └── grilling/  grill-with-docs/  codebase-design/  domain-modeling/  research/  wait-what/   # thinking / design
│
├── agents/                     # Subagents
│   ├── convention-checker.md  security-reviewer.md  architecture-explainer.md   # proactive
│   ├── review-context.md  review-conventions.md  review-correctness.md         # dispatched by pr-ci-review
│   ├── review-docs.md  review-maintainability.md  review-security.md  review-validator.md
│   └── comment-pruner.md       # dispatched by the comment-pruner Stop hook
│
└── hooks/                      # Deterministic shell scripts (zero LLM cost)
    ├── quality-checks.sh          # Stop: ESLint (+ Prettier) on dirty TS, tsc on the repo
    ├── convention-spot-check.sh   # Stop: content-JSON + TSX checks, llms.txt sync (blocks once)
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
makes a skill manual-only. Supporting files (`HTML-REPORT.md`, `DESIGN-IT-TWICE.md`) sit next to it.

### `agents/`: subagents

Markdown with `name`, `description` (say "Use PROACTIVELY" + the trigger), `tools` (minimum
needed), `model` (haiku fast, sonnet balanced, opus deep).

### `hooks/`: deterministic gates

Bash scripts wired in `settings.json`. Read the tool input from stdin (`jq -r '.tool_input…'`),
exit `2` to block with a message on stderr, `0` to allow. Commands and paths come from
`project.env`; hooks that need the toolchain source nvm and call `node_modules/.bin` directly.

### `project.env`: project profile

The one place stack-specific values live, sourced by the hooks, `scripts/worktree-*.sh`,
`scripts/pre-commit`, and referenced by skills (`TYPECHECK_CMD`, `GIT_TRUNK`, ...). An empty key
turns its check off. Unlike the generic template, this repo keeps its naming, generated-file,
and content-JSON logic in the hook scripts themselves: per-folder naming rules, per-path block
messages, and jq checks don't fit a single regex.

## Adding new extensions

- **New rule**: create `rules/<area>-conventions.md` with `paths:` + `@docs/conventions/<area>.md`; write the doc; add a row to `rules/README.md`.
- **New skill**: `skills/<name>/SKILL.md`; keep the description to one line that names the trigger; add to `skills/README.md`. See the template's `writing-for-agents` skill for the mechanics.
- **New agent**: `agents/<name>.md`; add to `agents/README.md` and, if proactive, to the Subagents list in `CLAUDE.md`.
- **New hook**: `hooks/<name>.sh`, `chmod +x`, wire it under the right event in `settings.json` with a timeout; add to `hooks/README.md`.

## Setup

```sh
nvm use && yarn install
cp .claude/settings.local.json.example .claude/settings.local.json   # optional
cp .env.example .env                                                  # optional: tracker IDs
cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
npx -y @colbymchenry/codegraph@1.6.0 init --yes                        # optional: CodeGraph index for the .mcp.json server
```

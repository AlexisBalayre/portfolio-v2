# How I work: the worktree-first loop

This config is built around one habit: **never work on `main`, one git worktree per unit of
work.** Everything else (the safety hook, the statusline, the compaction hook, the way agents
are dispatched) exists to support that habit.

## Why worktrees

A [git worktree](https://git-scm.com/docs/git-worktree) is a second checkout of the same repo
on its own branch, in its own directory. Instead of stashing and switching branches in one
working copy, each task gets an isolated directory under `.worktrees/`.

- **No accidental commits to `main`.** Plain `git commit` from a worktree lands on that
  worktree's branch.
- **Parallel work is real.** A content update can sit in one worktree while a layout fix runs
  in another. Subagents can be dispatched with `isolation: worktree`.
- **Clean blast radius.** A throwaway experiment is deleted wholesale.

## The loop

```
yarn worktree:create my-change        # .worktrees/my-change on branch feature/my-change, deps installed
  └─ cd .worktrees/my-change
       ├─ explore + plan (read 2-3 neighbours; match patterns)
       ├─ edit (content JSON, components, docs)
       ├─ Stop hook gates every response   (ESLint + Prettier on dirty files · tsc)
       ├─ spot-check flags content shape, llms.txt drift, <img>, unsafe links (once)
       ├─ convention-checker before commit  (>= 3 files touched)
       ├─ commit (pre-commit runs lint + typecheck; lands on feature/, never main)
       └─ open PR  →  /pr-description  →  /pr-ci-review
yarn worktree:clean                   # remove worktrees whose remote branch is gone
```

## What enforces it

| Mechanism | File | What it guarantees |
| :-------- | :--- | :----------------- |
| Branch protection | `.claude/hooks/git-safety.sh` | Blocks creating a branch while on `main`, pushing to `main`, hard resets, force pushes, and recursive force-deletes. |
| Worktree creation | `scripts/worktree-create.sh` + `package.json` | `yarn worktree:create <name>` makes `.worktrees/<name>` on `feature/<name>`, runs `INSTALL_CMD`, and builds a worktree-local CodeGraph index when the main checkout has one. |
| Worktree cleanup | `scripts/worktree-clean.sh` | `yarn worktree:clean` removes worktrees whose remote branch is gone. |
| Quality gate | `.claude/hooks/quality-checks.sh` | On every `Stop`, formats + lints the dirty TS files and typechecks the repo; blocks on failure. |
| Content gate | `.claude/hooks/convention-spot-check.sh` + `.claude/spot-checks.tsv` | JSON validity/shape, logo files exist, image hosts allowed, `llms.txt` sync; reported once per Stop cycle. |
| Generated-file protection | `.claude/hooks/protect-generated.sh` | Blocks edits to the sitemap, robots, `next-env.d.ts`, build output, `yarn.lock`. |
| Context survival | `.claude/hooks/pre-compact-preserve.sh` | Preserves the current branch, worktree path, modified files, and check results across compaction. |
| Visibility | `.claude/statusline.sh` | Shows the active branch (red on `main`), model and effort, context usage, 5h/7d rate limits, and cost. |
| `CLAUDE.md` | repo root | States the rule in always-on context: PRs only, worktrees only, never `main`. |

## Setup on a new machine

```sh
nvm use                              # Node 20 from .nvmrc
yarn install
cp .env.example .env                 # optional: issue-tracker IDs for to-spec / to-tickets
cp .claude/settings.local.json.example .claude/settings.local.json   # optional personal permissions
cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

Optional: CodeGraph (the `codegraph` MCP server in `.mcp.json`) answers symbol and call-graph
questions from a local index. Build it once with `npx -y @colbymchenry/codegraph@1.6.0 init --yes`
(writes the gitignored `.codegraph/`) and opt in via `enabledMcpjsonServers` in
`.claude/settings.local.json`; new worktrees then get their own index automatically.

The hooks load nvm themselves, so the Stop hook works even when the shell's default Node is
older than 20.

## Adapting it

The scripts assume `feature/<name>` branches and an `origin` remote. Commands, generated
paths, the branch prefix and the trunk all live in the committed profile
`.claude/project.env`; the hooks, the worktree scripts, the pre-commit hook, and the skills
read the same file so they stay in agreement.

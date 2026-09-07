# Skill catalog

Each skill is a `<name>/SKILL.md`. Claude sees only the one-line description at session start
and loads the full skill when it is relevant. This catalog says **when** each fires and **how**
to invoke it.

Generic personal skills (`tdd`, `diagnose`, `prototype`, `grill-me`, `zoom-out`, `handoff`,
`caveman`, `write-a-skill`, `obsidian-vault`) live at user level in `~/.claude/skills/` and are
deliberately not duplicated here.

**Invoke legend**
- **Auto or `/name`**: Claude triggers on the cue described; you can also run `/name` yourself.
- **Manual only**: you invoke it; Claude never auto-triggers (`disable-model-invocation: true`).

## Engineering

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `resolve-merge-conflicts` | A merge, rebase, or cherry-pick stopped on conflicts. Resolves by intent; keeps both sides of content JSON; regenerates `yarn.lock` and the sitemap rather than hand-merging. | Auto or `/resolve-merge-conflicts` |
| `find-dead-code` | "find dead code" / "unused components" / "orphan images". Returns a ranked candidate list (components, hooks, logos, images, CSS, JSON fields, deps) with a verification checklist. Never deletes. | Manual only (`/find-dead-code`) |
| `improve-codebase-architecture` | "improve architecture" / "find refactors". Scans for deepening opportunities, presents a visual HTML report, then grills through whichever one you pick. | Manual only (`/improve-codebase-architecture`) |

## Thinking & design

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `grilling` | The shared grilling core: a one-question-at-a-time interview until shared understanding. Fires when you want a plan stress-tested; other skills run it too. | Auto or `/grilling` |
| `grill-with-docs` | Run a `/grilling` session with `/domain-modeling` active, so the glossary and conventions are updated as decisions crystallise. | Manual only (`/grill-with-docs`) |
| `codebase-design` | Shared vocabulary and principles for designing deep modules: interfaces, seams, testability. Other skills import it. | Auto or `/codebase-design` |
| `domain-modeling` | Keeps the repo's documented language (glossary in `docs/README.md`, conventions, ADRs) current as design decisions land. | Auto or `/domain-modeling` |

## PR & review

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `pr-description` | Draft or rewrite a PR title/body in the repo's house style (types include `content` and `security`), then create or update the PR via `gh`. | Auto or `/pr-description` |
| `pr-ci-review` | Cost-optimal multi-agent code review of local changes or a PR: relevance-gated `review-*` subagents, a validation pass, and inline posting. Pre-flight is `yarn lint && yarn typecheck`. | Manual only (`/pr-ci-review`) |
| `address-review-comments` | Triage, decide, challenge, and implement a PR's open review threads end to end, replying as you go. | Auto or `/address-review-comments` |

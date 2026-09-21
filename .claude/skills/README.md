# Skill catalog

Each skill is a `<name>/SKILL.md`. Claude sees only the one-line description at session start
and loads the full skill when it is relevant. This catalog says **when** each fires and **how**
to invoke it.

Generic personal skills (`tdd`, `diagnosing-bugs`, `prototype`, `grill-me`, `zoom-out`,
`handoff`, `caveman`, `obsidian-vault`) live at user level in `~/.claude/skills/` and are
deliberately not duplicated here. The engineering, thinking and workflow skills track
[mattpocock/skills](https://github.com/mattpocock/skills) through the
[claude-code-power-config](https://github.com/AlexisBalayre/claude-code-power-config) template.

**Invoke legend**
- **Auto or `/name`**: Claude triggers on the cue described; you can also run `/name` yourself.
- **Manual only**: you invoke it; Claude never auto-triggers (`disable-model-invocation: true`).

## Engineering

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `resolving-merge-conflicts` | A merge, rebase, or cherry-pick stopped on conflicts. Resolves by intent; keeps both sides of content JSON; regenerates `yarn.lock` and the sitemap rather than hand-merging. | Auto or `/resolving-merge-conflicts` |
| `find-dead-code` | "find dead code" / "unused components" / "orphan images". Returns a ranked candidate list (components, hooks, logos, images, CSS, JSON fields, deps) with a verification checklist. Never deletes. | Manual only (`/find-dead-code`) |
| `improve-codebase-architecture` | "improve architecture" / "find refactors". Scans for deepening opportunities, presents a visual HTML report, then grills through whichever one you pick. | Manual only (`/improve-codebase-architecture`) |
| `implement` | Build what a spec or set of tickets describes, then review the diff against its acceptance criteria and commit on the feature branch. | Manual only (`/implement`) |

## Planning & tickets

Without an issue-tracker MCP server (IDs in `.env`, see `.env.example`), these write local
Markdown under `docs/plans/`, which is gitignored and refused by `scripts/pre-commit`.

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `to-spec` | Turn the current conversation into a spec: synthesis of what was discussed, no interview. | Manual only (`/to-spec`) |
| `to-tickets` | Break a plan or spec into tracer-bullet tickets, each declaring what blocks it. | Manual only (`/to-tickets`) |
| `wayfinder` | Plan a chunk of work too big for one session as a map of decision tickets, resolved one at a time. | Manual only (`/wayfinder`) |
| `to-questionnaire` | Turn a decision you can't answer alone into a questionnaire for someone else to fill in. | Manual only (`/to-questionnaire`) |

## Thinking & design

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `grilling` | The shared grilling core: a one-question-at-a-time interview until shared understanding. Fires when you want a plan stress-tested; other skills run it too. | Auto or `/grilling` |
| `grill-with-docs` | Run a `/grilling` session with `/domain-modeling` active, so `docs/glossary.md` and ADRs are updated as decisions crystallise. | Manual only (`/grill-with-docs`) |
| `codebase-design` | Shared vocabulary and principles for designing deep modules: interfaces, seams, testability. Other skills import it. | Auto or `/codebase-design` |
| `domain-modeling` | Keeps the repo's documented language (`docs/glossary.md`, conventions, ADRs) current as design decisions land. | Auto or `/domain-modeling` |
| `research` | Research a question against primary sources in a background agent; findings land in `docs/research/<slug>.md`. | Auto or `/research` |
| `wait-what` | The last message didn't land: re-pitch it in plain, simplified English using the glossary terms. | Manual only (`/wait-what`) |

## PR & review

| Skill | When to use | Invoke |
| :---- | :---------- | :----- |
| `pr-description` | Draft or rewrite a PR title/body in the repo's house style (Summary visual, Evidence, Content sync, Merge Danger; types include `content` and `security`), then create or update the PR via `gh`. | Auto or `/pr-description` |
| `pr-ci-review` | Cost-optimal multi-agent code review of local changes or a PR: relevance-gated `review-*` subagents, a validation pass, and inline posting. Pre-flight is `yarn lint && yarn typecheck`. | Manual only (`/pr-ci-review`) |
| `address-review-comments` | Triage, decide, challenge, and implement a PR's open review threads end to end, replying as you go. | Auto or `/address-review-comments` |

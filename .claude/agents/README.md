# Agent catalog

Subagents run in their own context window and return only a summary, so deep analysis never
bloats the main conversation.

## Proactive agents

Claude dispatches these automatically when the trigger matches (each is described "Use
PROACTIVELY"); you can also force one, e.g. "run the security-reviewer on these changes."
They are read-only (no edits).

| Agent | When to use | Model · tools |
| :---- | :---------- | :------------ |
| `convention-checker` | Before a commit, or after editing ≥3 files. Fast audit against `docs/conventions/*`. | Haiku · Read/Glob/Grep |
| `security-reviewer` | After touching `dangerouslySetInnerHTML` content or the HTML strings in the data JSON, external links/scripts, `next.config.js`, dependencies, or any new API route. XSS, unsafe links, advisories, secrets. | Opus · Read/Glob/Grep/Bash |
| `architecture-explainer` | A why/how question about sections, content flow, navigation, SEO/JSON-LD, styling, or the build. Answers grounded in `docs/`, never invented. | Sonnet · Read/Glob/Grep |

## Dispatched agents

These are workers for a specific skill or hook, not proactive triggers. The `review-*` family
is spawned (relevance-gated, model-tiered) by the [`pr-ci-review` skill](../skills/pr-ci-review/SKILL.md);
`comment-pruner` is dispatched by the `comment-pruner.sh` Stop hook.

| Agent | What it does | Model · tools |
| :---- | :----------- | :------------ |
| `comment-pruner` | Prunes low-value comments added in the current session, delete-when-uncertain, with a hard floor for tooling directives (`@ts-expect-error`, `eslint-disable`, …). The one agent here that edits. Also usable manually for a repo-wide sweep. | Sonnet · Read/Edit/Grep/Glob/Bash |
| `review-context` | Spec/infra contradictions (Next config, SEO metadata, sitemap, CI), each finding grounded in the contract it breaks. | Sonnet · Read/Glob/Grep/Bash |
| `review-conventions` | Audits changed files against `docs/conventions/*` and `CLAUDE.md`, quoting the exact rule violated. | Sonnet · Read/Glob/Grep/Bash |
| `review-correctness` | Logic/behavior defects deterministic tooling can't catch (layout state, navigation, data mapping). | Opus · Read/Glob/Grep/Bash |
| `review-docs` | Accuracy and usefulness of prose a change introduces; strict on noise comments and stale docs. | Sonnet · Read/Glob/Grep/Bash |
| `review-maintainability` | Structural regressions: content leaking into components, duplication, needless indirection. | Sonnet · Read/Glob/Grep/Bash |
| `review-security` | Real, reachable security issues at the browser boundary (rendered HTML, links, config, deps). | Opus · Read/Glob/Grep/Bash |
| `review-validator` | Adversarial gate: tries to refute each finding against the actual code before it is posted or auto-fixed. | Opus · Read/Glob/Grep/Bash |

**Tuning:** `tools` is the minimum each needs; `model` is matched to the work (Haiku = fast/cheap,
Sonnet = balanced, Opus = deep reasoning). To add an agent, see [`.claude/README.md`](../README.md)
("New agent").

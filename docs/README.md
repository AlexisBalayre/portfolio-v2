# Docs

Documentation for the portfolio site. Organised loosely after [Diátaxis](https://diataxis.fr/):

| Folder / file       | Answers                 | Read when…                                            |
| :------------------ | :---------------------- | :---------------------------------------------------- |
| `conventions/`      | *How must I code this?* | You are editing files in an area (auto-loaded by `.claude/rules/`). |
| `reference/`        | *What is the shape?*    | You need to know how the page, content, SEO, or build fit together. |
| `adr/`              | *What did we decide?*   | You need the record of a past decision (empty until the first ADR lands). |
| `glossary.md`       | *What does this word mean?* | You name something, or a term in a task is fuzzy.  |
| `workflow.md`       | *How do I work here?*   | You are starting a task: worktrees, hooks, PR flow.    |

`conventions/` is the **single source of truth** for code and content rules. Everything else
explains or records.

---

## Index

- [General conventions](conventions/general.md): naming, imports, exports, client/server, content-stays-in-JSON, comments
- [Frontend conventions](conventions/frontend.md): components, sections + navigation, styling, images, links, SEO, accessibility
- [Content conventions](conventions/content.md): JSON shapes, HTML-in-strings, images, writing style, sync checklist
- [Glossary](glossary.md): the domain nouns (Section, Content JSON, Timeline item, Tier, ...)
- [Site architecture](reference/architecture.md): how layout, page, components, content, styling, SEO, and build connect
- [Workflow](workflow.md): the worktree-first loop and what enforces it
- [ADRs](adr/README.md)

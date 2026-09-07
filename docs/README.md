# Docs

Documentation for the portfolio site. Organised loosely after [Diátaxis](https://diataxis.fr/):

| Folder / file       | Answers                 | Read when…                                            |
| :------------------ | :---------------------- | :---------------------------------------------------- |
| `conventions/`      | *How must I code this?* | You are editing files in an area (auto-loaded by `.claude/rules/`). |
| `reference/`        | *What is the shape?*    | You need to know how the page, content, SEO, or build fit together. |
| `adr/`              | *What did we decide?*   | You need the record of a past decision (empty until the first ADR lands). |
| `workflow.md`       | *How do I work here?*   | You are starting a task: worktrees, hooks, PR flow.    |

`conventions/` is the **single source of truth** for code and content rules. Everything else
explains or records.

---

## Glossary

Names in code, docs, and conversation should match these exactly.

| Term | Meaning |
| :--- | :--- |
| **Section** | One block of the single page (`About Me`, `Experiences`, `Projects`, `Skills`, `Hackathons`, `Education`), a `<div id>` in `app/page.tsx` mirrored by a `menuLinks` entry in `Header.tsx`. |
| **Content JSON** | The five files in `public/assets/data/` that hold all portfolio copy: `experiences`, `hackathons`, `formation` (education), `projects`, `tech` (skills). |
| **Timeline item** | An entry of a chronological JSON file: `logo`, `title`, `period`, `description`, rendered by `Timeline.tsx`. |
| **Project** | An entry of `projects.json`: `name`, `description`, `url`, `technologies`, `image`, rendered as a card by `Projects.tsx`. |
| **Tier** | A skill's proficiency level in `tech.json`: `Core` (daily, production-grade), `Working` (solid, used in real projects), `Familiar` (some hands-on experience). |
| **llms.txt** | `public/llms.txt`, the hand-maintained plain-text summary of the portfolio for AI agents; kept in sync with the content JSON by hand. |
| **JSON-LD** | The `WebSite` and `Person` schema.org blocks injected by `app/layout.tsx`. |
| **Generated artefacts** | `public/sitemap*.xml` and `public/robots.txt`, written by `next-sitemap` on `postbuild`; never edited by hand. |

---

## Index

- [General conventions](conventions/general.md): naming, imports, exports, client/server, content-stays-in-JSON, comments
- [Frontend conventions](conventions/frontend.md): components, sections + navigation, styling, images, links, SEO, accessibility
- [Content conventions](conventions/content.md): JSON shapes, HTML-in-strings, images, writing style, sync checklist
- [Site architecture](reference/architecture.md): how layout, page, components, content, styling, SEO, and build connect
- [Workflow](workflow.md): the worktree-first loop and what enforces it
- [ADRs](adr/README.md)

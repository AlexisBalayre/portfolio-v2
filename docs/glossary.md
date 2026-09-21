# Glossary

The shared vocabulary. Names in code, docs, and conversation should match these exactly.
When a term is fuzzy, sharpen it here first (the `domain-modeling` skill does this as decisions land).

| Term | Meaning |
| :--- | :--- |
| **Section** | One block of the single page (`About Me`, `Experiences`, `Projects`, `Skills`, `Hackathons`, `Education`), a `<div id>` in `app/page.tsx` mirrored by a `menuLinks` entry in `Header.tsx`. |
| **Content JSON** | The five files in `public/assets/data/` that hold all portfolio copy: `experiences`, `hackathons`, `formation` (education), `projects`, `tech` (skills). |
| **Timeline item** | An entry of a chronological JSON file: `logo`, `title`, `period`, `description`, rendered by `Timeline.tsx`. |
| **Project** | An entry of `projects.json`: `name`, `description`, `url`, `technologies`, `image`, rendered as a card by `Projects.tsx`. |
| **Tier** | A skill's proficiency level in `tech.json`: `Core` (daily, production-grade), `Working` (solid, used in real projects), `Familiar` (some hands-on experience). |
| **llms.txt** | `public/llms.txt`, the hand-maintained plain-text summary of the portfolio for AI agents; kept in sync with the content JSON by hand. |
| **JSON-LD** | The schema.org `@graph` (WebSite, ProfilePage, Person, projects ItemList) built by `lib/structuredData.ts` from the content JSON and injected by `app/layout.tsx`. |
| **Generated artefacts** | `public/sitemap*.xml` and `public/robots.txt`, written by `next-sitemap` on `postbuild`; never edited by hand. |

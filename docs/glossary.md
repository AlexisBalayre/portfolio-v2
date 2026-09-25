# Glossary

The shared vocabulary. Names in code, docs, and conversation should match these exactly.
When a term is fuzzy, sharpen it here first (the `domain-modeling` skill does this as decisions land).

| Term | Meaning |
| :--- | :--- |
| **Locale** | One of the two languages the site is built in, `en` (default, unprefixed URLs) or `fr` (under `/fr`); the `[locale]` route param, typed `Locale` in `lib/i18n.ts`. Every page, image and feed is prerendered once per locale ([ADR 0002](adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)). |
| **Dictionary** | The per-locale UI strings, `public/assets/data/<locale>/ui.json`, read through `getDictionary(locale)`; typed from the English file so a missing French key fails typecheck. |
| **Fallback (post)** | The French route of a post that has no `<slug>.fr.mdx`: it renders the English body under `/fr/blog/<slug>` with a "not yet translated" notice, keeps the English canonical and no `fr` hreflang. |
| **Section** | One block of the single page (`About Me`, `Experiences`, `Projects`, `Skills`, `Hackathons`, `Education`), a `<section id>` in `app/[locale]/page.tsx` mirrored by a `menuLinks` entry in `Header.tsx`; headings come from the dictionary. |
| **Content JSON** | The files in `public/assets/data/<locale>/` that hold all portfolio copy, one set per locale: `experiences`, `hackathons`, `formation` (education), `projects`, `tech` (skills), `about` (the About Me block) and `ui` (the dictionary). The French set mirrors the English one entry for entry. |
| **Timeline item** | An entry of a chronological JSON file: `logo`, `title`, `period`, `description`, rendered by `Timeline.tsx`. |
| **Project** | An entry of `projects.json`: `id`, `name`, `description`, `url`, `technologies`, `image`, rendered as a card by `Projects.tsx`. The `id` is the stable handle posts use to point at it. |
| **Post** | A blog article: one `content/blog/<slug>.mdx` file with frontmatter (`title`, `description`, `date`, `tags`, `projects`), compiled by `lib/posts.ts` and rendered at `/blog/<slug>` and `/fr/blog/<slug>`. An optional `<slug>.fr.mdx` beside it is the French version. |
| **Tier** | A skill's proficiency level in `tech.json`: `Core` (daily, production-grade), `Working` (solid, used in real projects), `Familiar` (some hands-on experience). |
| **llms.txt** | `public/llms.txt` (English) and `public/llms.fr.txt` (French), the hand-maintained plain-text summaries of the portfolio for AI agents; kept in sync with the content JSON by hand. |
| **JSON-LD** | The schema.org `@graph` (WebSite, ProfilePage, Person, projects ItemList) built by `lib/structuredData.ts` from the content JSON and injected by `app/[locale]/layout.tsx`, with `inLanguage` per locale; the blog pages add a `Blog` or `BlogPosting` node from the same file. |
| **Generated artefacts** | `public/sitemap*.xml` and `public/robots.txt`, written by `next-sitemap` on `postbuild`; never edited by hand. |

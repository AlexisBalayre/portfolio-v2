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
| **Metadata routes** | `app/sitemap.ts` and `app/robots.ts`, the Next.js file conventions prerendered as `/sitemap.xml` and `/robots.txt` at build time from `lib/posts.ts` and `lib/site.ts` ([ADR 0003](adr/0003-sitemap-and-robots-as-next-metadata-routes.md)); nothing under `public/` may shadow them. |
| **Content date** | The only kind of `lastmod` the sitemap carries: a post's frontmatter `date`, the newest published post date for the blog list, and for the home page the later of that and `portfolioUpdatedOn` (`lib/site.ts`, bumped by hand with the content JSON). Never the build time. |
| **Breadcrumbs** | The `BreadcrumbList` JSON-LD on the blog pages (`buildBreadcrumbs` in `lib/structuredData.ts`): the author's name for the home page, `Blog`, then the post title, each with the reader's locale URL. |
| **Scheduled post** | A post whose frontmatter `date` is after today in `publishTimeZone` (`Europe/Paris`, `lib/site.ts`). The production build leaves it out of everything `getAllPosts` feeds (listing, feeds, sitemap, static params, project cards), so its URL is a 404 until the daily production rebuild of its date, triggered by `.github/workflows/scheduled-publish.yaml` through the Vercel Deploy Hook; previews and `yarn dev` show it ([ADR 0004](adr/0004-scheduled-posts-as-a-build-time-filter-with-a-daily-deploy-hook.md)). |
| **IndexNow key** | `public/<key>.txt`, a 32-hex string that is both the file name and its content, fetched by Bing and the other IndexNow engines to accept the URL submissions that `.github/workflows/indexnow.yaml` sends after each push to `main`. Public by design; rotation in [architecture.md](reference/architecture.md#search-engines-and-indexnow). |

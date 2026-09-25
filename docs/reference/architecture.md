# Site Architecture (Reference)

How the portfolio at https://alexis.balayre.com is put together. For coding rules see
[../conventions/frontend.md](../conventions/frontend.md); for content rules see
[../conventions/content.md](../conventions/content.md).

## One page plus a blog, data-driven, in two languages

```
public/assets/data/<locale>/*.json ──lib/portfolio.ts──▶ app/[locale]/page.tsx ──props──▶ components/{AboutMe,Timeline,Projects,Skills}
public/assets/data/<locale>/ui.json ──lib/i18n.ts (getDictionary)──▶ every route file and component (labels, titles, SEO copy)
content/blog/<slug>.mdx (+ <slug>.fr.mdx) ──lib/posts.ts──▶ app/[locale]/page.tsx (related posts on the cards)
                          │                  app/[locale]/blog/page.tsx, app/[locale]/blog/[slug]/page.tsx
                          │                  app/[locale]/blog/**/opengraph-image/route.tsx, app/[locale]/blog/rss.xml/route.ts
app/not-found.tsx ── the one 404 page, prerendered as /_not-found (own <html lang="en">, Header, NotFound, Footer)
app/[locale]/layout.tsx (server, root) ── <html lang> <Header locale postLocales/> ──┤── sections with id="…" ◀── Header.menuLinks[].section
        │                                  <Footer locale/>                          │   language switch ◀── stripLocale(usePathname())
        ├── generateMetadata (title, description, canonical, hreflang, OG locale, Twitter, icons, robots, RSS alternate)
        └── JSON-LD graph (lib/structuredData.ts): WebSite, ProfilePage, Person, ItemList (+ Blog / BlogPosting per blog page)

next.config.js rewrites:  /  /opengraph-image  /blog  /blog/*   ──▶   /en/**      (French stays under /fr/**)
next.config.js redirects: /en  /en/*  ──308──▶  /  /*                            (the twins are never indexed)
```

- **Locales** ([ADR 0002](../adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)): every route lives once under `app/[locale]/`, prerendered for `en` and `fr` (`generateStaticParams`, `dynamicParams = false`). English is the default and is served unprefixed through four static rewrites, and a direct hit on `/en/**` is redirected back to the unprefixed URL; French keeps its `/fr` prefix. There is no middleware, no `Accept-Language` detection and no cookie: the header's language switch is the whole mechanism. Every URL the router refuses (unknown locale, unknown slug, anything else under `/fr`) is served the prerendered `app/not-found.tsx` with status 404: one styled English 404 page whose copy switches to French on the client under `/fr/*`. `lib/i18n.ts` holds the locale list, the URL rule (`localePath`, `stripLocale`) and the typed dictionary; `lib/portfolio.ts` loads the six content files per locale and fails the build when the French folder misses an entry.
- **`app/[locale]/layout.tsx`** (server component, the root layout) sets `<html lang>`, wraps the page with `Header` and `Footer`, exports `generateMetadata` (per locale, with `alternates.languages` for `en`, `fr` and `x-default`, `og:locale` and `og:locale:alternate`) and `viewport`, and injects one JSON-LD `@graph` built by `lib/structuredData.ts`: `WebSite` and `Person` are shared across locales by `@id` (employers, degrees and awards parsed from the English JSON), `ProfilePage` and the projects `ItemList` carry the locale's URL and `inLanguage`. It also hands the header a `slug -> locales` map read from `lib/posts.ts`. `app/[locale]/opengraph-image/route.tsx` renders the 1200×630 social card per locale at build time with `next/og`; the page lists it in `openGraph.images` and `twitter.images` with `socialImage()`.
- **`app/[locale]/page.tsx`** (async server component) renders six sections in order: About Me, Experiences, Projects, Skills, Hackathons, Education. Each is a `<section id aria-labelledby>` with an icon + `<h2>` header (a `nav` string of the dictionary) and one generic component fed by `getPortfolio(locale)`; `scroll-mt-24` keeps anchored headings clear of the fixed header. It reads the posts with `getAllPosts(locale)` and passes them to `Projects`, which lists the posts written about each card. **`components/AboutMe.tsx`** (client) is the About-Me section, fed by `about.json`: an `IntersectionObserver` fades its text in when 30% visible, the only browser dependency of the home page.
- **`components/Header.tsx`** (client) holds `menuLinks` (dictionary `nav` key, section id, Heroicon), the `blogLink`, a desktop nav and a mobile burger menu closed by `useOutsideClick`, the language switch and the Calendly CTA. Section links are `next/link` anchors: `#section` on the home page, `<home>#section` elsewhere (`/#section`, `/fr#section`; `stripLocale(usePathname())` decides, so the prerendered `/en` HTML and the browser's `/` agree), smooth via CSS `scroll-behavior`, disabled under `prefers-reduced-motion`. `aria-current` marks the visible section on the home page and the Blog link on the blog. The language switch links to the same path in the other locale, or to that locale's blog list for a post that has no file there.
- **`app/[locale]/blog/`**: `page.tsx` lists the posts (newest first) and `[slug]/page.tsx` renders one with `generateStaticParams` over every English slug in every locale and `dynamicParams = false`, so every post is static HTML and an unknown slug is a 404. A French route whose `<slug>.fr.mdx` is missing renders the English body with a "not yet translated" notice, keeps the English canonical and omits the `fr` hreflang; the listing shows the same notice. Both pages export full page metadata (canonical, hreflang, Open Graph, Twitter, RSS alternate) and inject their own JSON-LD with `inLanguage`. `opengraph-image/route.tsx` (list) and `[slug]/opengraph-image/route.tsx` render one 1200×630 card per locale with `next/og`, listed explicitly by each page's metadata; `rss.xml/route.ts` is a `force-static` route handler that writes one RSS 2.0 feed per locale (`<language>`, localised channel text, items under the locale's URLs). All of them read from **`lib/posts.ts`**, which compiles `content/blog/*.mdx` with `next-mdx-remote/rsc`, validates the frontmatter (title, description, date, tags, project ids; a French file must also match the English date, tags and projects) and maps the elements through `mdx-components.tsx` ([ADR 0001](../adr/0001-blog-posts-as-mdx-files-compiled-with-next-mdx-remote.md)).
- **`components/Timeline.tsx`** renders the three chronological JSON files. It has two markup branches: a desktop alternating left/right timeline driven by the hand-written CSS in `styles/globals.css`, and a stacked mobile list. Titles and descriptions are HTML strings injected with `dangerouslySetInnerHTML`; the logo alt is derived with the locale's organisation separators from the dictionary.
- **`components/Projects.tsx`** renders daisyUI cards (image, name, description, technology badges, link, related posts in the reader's locale). **`components/Skills.tsx`** renders categories of badges colour-coded by tier, with the tier labels and legend from the dictionary.

## Content pipeline

1. Edit `public/assets/data/en/<file>.json` and its twin `public/assets/data/fr/<file>.json` (shapes and the entry-for-entry rule in [content.md](../conventions/content.md)), or add `content/blog/<slug>.mdx` and, optionally, `<slug>.fr.mdx` ([guide](../guides/writing-a-post.md)).
2. `lib/portfolio.ts` and `lib/i18n.ts` import the JSON at build time (`resolveJsonModule`), checking that the French files mirror the English ones; `lib/posts.ts` reads the MDX from disk; no fetch, no CMS. Merging to `main` publishes.
3. Images referenced by the JSON come from `public/assets/img/` (logos) or from remote hosts allow-listed in `next.config.js` (`images.remotePatterns`); they are shared by both locales.
4. `public/llms.txt` and `public/llms.fr.txt` are parallel, hand-written summaries for AI agents; they are not generated from the JSON, so they are updated by hand alongside it.

## Styling system

- Tailwind CSS v4 and daisyUI v5 are configured in CSS, not JS: `styles/globals.css` starts with `@import "tailwindcss"; @plugin "daisyui" { themes: night --default }`. PostCSS runs `@tailwindcss/postcss` (`postcss.config.mjs`).
- The `night` theme is the only theme and the page background is forced black.
- The rest of `globals.css` is base resets and the timeline's positioned layout (`.timeline::after` centre line, `.containerBis.left/.right` halves, `.content` cards).

## SEO artefacts

| Artefact | Source | Generated? |
| :--- | :--- | :--- |
| `<html lang>`, `<title>`, description, keywords, canonical, hreflang alternates (`en`, `fr`, `x-default`), Open Graph (`og:locale`, `og:locale:alternate`), Twitter card, robots, icons, manifest link, RSS `<link rel="alternate">` | `generateMetadata` in `app/[locale]/layout.tsx`, strings from `ui.json`, URL helpers in `lib/site.ts` | At build, per locale |
| Blog page metadata (canonical, hreflang restricted to the locales a post exists in, `og:type=article`, `article:*`, Twitter card) | `generateMetadata` in `app/[locale]/blog/**/page.tsx`, from the post frontmatter | At build, from the MDX |
| `Blog` and `BlogPosting` JSON-LD (`inLanguage` per locale) | `buildBlog` / `buildBlogPosting` in `lib/structuredData.ts` | At build, from the MDX |
| `/blog/<slug>/opengraph-image`, `/fr/blog/<slug>/opengraph-image` (1200×630 PNG per post and locale) | `app/[locale]/blog/[slug]/opengraph-image/route.tsx` (`next/og`) | **Yes** (at build) |
| `/blog/rss.xml`, `/fr/blog/rss.xml` (RSS 2.0, `<language>` per locale) | `app/[locale]/blog/rss.xml/route.ts` | **Yes** (at build) |
| JSON-LD `@graph` (`WebSite` and `Person` shared by `@id`, with employers, degrees, awards, skills; `ProfilePage` and `ItemList` of projects per locale) | `buildStructuredData` in `lib/structuredData.ts`, fed by the `profile` strings of `ui.json`, the constants in `app/[locale]/layout.tsx` and the content JSON | At render, from the JSON |
| `/opengraph-image`, `/fr/opengraph-image` (1200×630 PNG) | `app/[locale]/opengraph-image/route.tsx` (`next/og`, embeds `alexis.jpg`, localised labels) | **Yes** (at build) |
| `/_not-found` (the 404 page for every refused URL) | `app/not-found.tsx` | **Yes** (at build) |
| `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` | `next-sitemap` on `postbuild`, config in `next-sitemap.config.js` (`siteUrl`, weekly changefreq, explicit allow rules for AI crawlers, `llms.txt` / `llms.fr.txt` pointer; a `transform` strips the `/en` prefix, skips untranslated French post routes and adds `alternateRefs` for `en`, `fr` and `x-default`; the feeds and the social images are excluded in both locales) | **Yes** (committed output; never edit by hand) |
| Favicons, `site.webmanifest`, `llms.txt`, `llms.fr.txt` | static files | No |

## Toolchain and build

- **Node >= 20** (`.nvmrc` = 20, `engines.node`), **Yarn 1** (`yarn.lock` v1, `packageManager: yarn@1.22.22` so `corepack yarn` resolves to Yarn 1 on a Node 20 install that has no global yarn). The `.pnp.cjs` / `.pnp.loader.mjs` files at the root are stale Yarn Berry leftovers and are gitignored.
- `yarn dev` and `yarn build` run Next.js with Turbopack. `postbuild` runs `next-sitemap`.
- `next.config.js`: `reactStrictMode`, `poweredByHeader: false`, `compress`, `images.remotePatterns`, the four locale `rewrites` (`/`, `/opengraph-image`, `/blog`, `/blog/*` to `/en/**`), the two `/en/**` `redirects`, and env-gated `ignoreBuildErrors` / `ignoreDuringBuilds` (`NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`, for emergencies only).
- Quality gate: `yarn lint` (`next lint`, ESLint legacy config), `yarn typecheck` (`tsc --noEmit`), `yarn format` (Prettier). The Claude Code Stop hook runs all three on touched files; `scripts/pre-commit` runs lint + typecheck for human commits. There is no test suite.
- CI (`.github/workflows/lint.yaml`) runs `yarn lint`, `yarn typecheck`, and `yarn build` on pushes and PRs to `main`, on the Node version from `.nvmrc`.
- `@vercel/analytics` is a dependency but is not currently mounted in `layout.tsx`.

## Extension points

- **New section**: JSON file in `en/` and `fr/` (if new content type) → generic component in `components/` taking `locale` → `<section id aria-labelledby>` block in `page.tsx` → `menuLinks` entry in `Header.tsx` and its `nav` string in both `ui.json` → mention in `llms.txt` and `llms.fr.txt`.
- **New project / experience**: one JSON entry per locale, plus the sync list in [content.md](../conventions/content.md#keep-in-sync).
- **New blog post**: `content/blog/<slug>.mdx` with the five frontmatter fields, optionally `<slug>.fr.mdx`, plus a line in `llms.txt` and `llms.fr.txt` ([guide](../guides/writing-a-post.md)). Everything else is generated.
- **New page / route**: the blog was the first (`app/[locale]/blog/`). Reconsider whether a section does the job; if not, add `app/[locale]/<route>/page.tsx`, add the unprefixed rewrite for it in `next.config.js` (`/<route>` to `/en/<route>`), give it full page metadata with `languageAlternates` (see [frontend.md](../conventions/frontend.md#seo-and-metadata)) and a `Header` entry next to `blogLink`; `next-sitemap` picks the prerendered paths up automatically and its `transform` strips the prefix.
- **New locale**: add it to `locales` in `lib/i18n.ts` (typecheck then lists every `Record<Locale, ...>` to fill), a `public/assets/data/<locale>/` folder with the seven files, the tags in `languageTags` / `ogLocales`, the locale list in `next-sitemap.config.js`, and `<slug>.<locale>.mdx` posts as they are translated.

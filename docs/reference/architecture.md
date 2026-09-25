# Site Architecture (Reference)

How the portfolio at https://alexis.balayre.com is put together. For coding rules see
[../conventions/frontend.md](../conventions/frontend.md); for content rules see
[../conventions/content.md](../conventions/content.md).

## One page plus a blog, data-driven

```
public/assets/data/*.json ──import──▶ app/page.tsx ──props──▶ components/{AboutMe,Timeline,Projects,Skills}
content/blog/*.mdx ──lib/posts.ts──▶ app/page.tsx (related posts on the cards)
                          │           app/blog/page.tsx, app/blog/[slug]/page.tsx
                          │           app/blog/[slug]/opengraph-image.tsx, app/blog/rss.xml/route.ts
app/layout.tsx (server) ── <Header/> ─────┤── sections with id="…" ◀── Header.menuLinks[].section, /blog ◀── blogLink
        │                  <Footer/>      │
        ├── metadata (title, OG, Twitter, icons, robots, RSS alternate)
        └── JSON-LD graph (lib/structuredData.ts): WebSite, ProfilePage, Person, ItemList (+ Blog / BlogPosting per blog page)
```

- **`app/layout.tsx`** (server component) wraps the page with `Header` and `Footer`, exports `metadata` and `viewport`, and injects one JSON-LD `@graph` built by `lib/structuredData.ts` from the content JSON. It is the single home of SEO. `app/opengraph-image.tsx` renders the 1200×630 social card at build time with `next/og`.
- **`app/page.tsx`** (async server component) renders six sections in order: About Me, Experiences, Projects, Skills, Hackathons, Education. Each is a `<section id aria-labelledby>` with an icon + `<h2>` header and one generic component; `scroll-mt-24` keeps anchored headings clear of the fixed header. It reads the posts with `getAllPosts()` and passes them to `Projects`, which lists the posts written about each card. **`components/AboutMe.tsx`** (client) is the About-Me section: an `IntersectionObserver` fades its text in when 30% visible, the only browser dependency of the home page.
- **`components/Header.tsx`** (client) holds `menuLinks` (label, section id, Heroicon), the `blogLink` (`/blog`), a desktop nav and a mobile burger menu closed by `useOutsideClick`, and the Calendly CTA. Section links are `next/link` anchors: `#section` on the home page, `/#section` from the blog (`usePathname()` decides), smooth via CSS `scroll-behavior`, disabled under `prefers-reduced-motion`. `aria-current` marks the visible section on `/` and the Blog link on `/blog*`.
- **`app/blog/`**: `page.tsx` lists the posts (newest first) and `[slug]/page.tsx` renders one with `generateStaticParams` and `dynamicParams = false`, so every post is static HTML and an unknown slug is a 404. Both export full page metadata (canonical, Open Graph, Twitter, RSS alternate) and inject their own JSON-LD. `[slug]/opengraph-image.tsx` renders one 1200×630 card per post with `next/og`; `rss.xml/route.ts` is a `force-static` route handler that writes the RSS 2.0 feed. All four read from **`lib/posts.ts`**, which compiles `content/blog/*.mdx` with `next-mdx-remote/rsc`, validates the frontmatter (title, description, date, tags, project ids) and maps the elements through `mdx-components.tsx` ([ADR 0001](../adr/0001-blog-posts-as-mdx-files-compiled-with-next-mdx-remote.md)).
- **`components/Timeline.tsx`** renders the three chronological JSON files. It has two markup branches: a desktop alternating left/right timeline driven by the hand-written CSS in `styles/globals.css`, and a stacked mobile list. Titles and descriptions are HTML strings injected with `dangerouslySetInnerHTML`.
- **`components/Projects.tsx`** renders daisyUI cards (image, name, description, technology badges, link). **`components/Skills.tsx`** renders categories of badges colour-coded by tier with a legend.

## Content pipeline

1. Edit `public/assets/data/<file>.json` (shapes in [content.md](../conventions/content.md)) or add `content/blog/<slug>.mdx` ([guide](../guides/writing-a-post.md)).
2. `page.tsx` imports the JSON at build time (`resolveJsonModule`) and `lib/posts.ts` reads the MDX from disk; no fetch, no CMS. Merging to `main` publishes.
3. Images referenced by the JSON come from `public/assets/img/` (logos) or from remote hosts allow-listed in `next.config.js` (`images.remotePatterns`).
4. `public/llms.txt` is a parallel, hand-written summary for AI agents; it is not generated from the JSON, so it is updated by hand alongside it.

## Styling system

- Tailwind CSS v4 and daisyUI v5 are configured in CSS, not JS: `styles/globals.css` starts with `@import "tailwindcss"; @plugin "daisyui" { themes: night --default }`. PostCSS runs `@tailwindcss/postcss` (`postcss.config.mjs`).
- The `night` theme is the only theme and the page background is forced black.
- The rest of `globals.css` is base resets and the timeline's positioned layout (`.timeline::after` centre line, `.containerBis.left/.right` halves, `.content` cards).

## SEO artefacts

| Artefact | Source | Generated? |
| :--- | :--- | :--- |
| `<title>`, description, keywords, Open Graph, Twitter card, robots, icons, manifest link, RSS `<link rel="alternate">` | `metadata` in `app/layout.tsx`, constants in `lib/site.ts` | No |
| Blog page metadata (canonical, `og:type=article`, `article:*`, Twitter card) | `metadata` / `generateMetadata` in `app/blog/**/page.tsx`, from the post frontmatter | At build, from the MDX |
| `Blog` and `BlogPosting` JSON-LD | `buildBlog` / `buildBlogPosting` in `lib/structuredData.ts` | At build, from the MDX |
| `/blog/<slug>/opengraph-image` (1200×630 PNG per post) | `app/blog/[slug]/opengraph-image.tsx` (`next/og`) | **Yes** (at build) |
| `/blog/rss.xml` (RSS 2.0) | `app/blog/rss.xml/route.ts` | **Yes** (at build) |
| JSON-LD `@graph` (`WebSite`, `ProfilePage`, `Person` with employers, degrees, awards, skills; `ItemList` of projects) | `buildStructuredData` in `lib/structuredData.ts`, fed by the `profile` constants in `app/layout.tsx` and the content JSON | At render, from the JSON |
| `opengraph-image` (1200×630 PNG) | `app/opengraph-image.tsx` (`next/og`, embeds `alexis.jpg`) | **Yes** (at build) |
| `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` | `next-sitemap` on `postbuild`, config in `next-sitemap.config.js` (`siteUrl`, weekly changefreq, explicit allow rules for AI crawlers, `llms.txt` pointer; the feed and the per-post social images are excluded, the prerendered blog pages are included automatically) | **Yes** (committed output; never edit by hand) |
| Favicons, `site.webmanifest`, `llms.txt` | static files | No |

## Toolchain and build

- **Node >= 20** (`.nvmrc` = 20, `engines.node`), **Yarn 1** (`yarn.lock` v1, `packageManager: yarn@1.22.22` so `corepack yarn` resolves to Yarn 1 on a Node 20 install that has no global yarn). The `.pnp.cjs` / `.pnp.loader.mjs` files at the root are stale Yarn Berry leftovers and are gitignored.
- `yarn dev` and `yarn build` run Next.js with Turbopack. `postbuild` runs `next-sitemap`.
- `next.config.js`: `reactStrictMode`, `poweredByHeader: false`, `compress`, `images.remotePatterns`, and env-gated `ignoreBuildErrors` / `ignoreDuringBuilds` (`NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`, for emergencies only).
- Quality gate: `yarn lint` (`next lint`, ESLint legacy config), `yarn typecheck` (`tsc --noEmit`), `yarn format` (Prettier). The Claude Code Stop hook runs all three on touched files; `scripts/pre-commit` runs lint + typecheck for human commits. There is no test suite.
- CI (`.github/workflows/lint.yaml`) runs `yarn lint`, `yarn typecheck`, and `yarn build` on pushes and PRs to `main`, on the Node version from `.nvmrc`.
- `@vercel/analytics` is a dependency but is not currently mounted in `layout.tsx`.

## Extension points

- **New section**: JSON file (if new content type) → generic component in `components/` → `<section id aria-labelledby>` block in `page.tsx` → `menuLinks` entry in `Header.tsx` → mention in `llms.txt`.
- **New project / experience**: JSON entry only, plus the sync list in [content.md](../conventions/content.md#keep-in-sync).
- **New blog post**: `content/blog/<slug>.mdx` with the five frontmatter fields, plus a line in `llms.txt` ([guide](../guides/writing-a-post.md)). Everything else is generated.
- **New page / route**: the blog was the first (`app/blog/`). Reconsider whether a section does the job; if not, add `app/<route>/page.tsx` (`next-sitemap` picks it up automatically), give it full page metadata (see [frontend.md](../conventions/frontend.md#seo-and-metadata)) and a `Header` entry next to `blogLink`.

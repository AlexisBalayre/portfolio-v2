# Frontend Conventions

Rules for `app/`, `components/`, `hooks/`, `styles/`, `lib/` and `mdx-components.tsx`. Builds on [general.md](general.md).
Auto-loaded by `.claude/rules/frontend-conventions.md`. For how the pieces fit together, read
[../reference/architecture.md](../reference/architecture.md).

## Stack

Next.js 15 App Router (Turbopack), React 19, TypeScript strict, Tailwind CSS v4, daisyUI v5.
Two route families, the home page (`/`) and the blog (`/blog`, `/blog/<slug>`, `/blog/rss.xml`), in two locales: English
unprefixed, French under `/fr`. One route tree, `app/[locale]/`, prerendered per locale; `next.config.js` rewrites the
unprefixed paths to `/en/**` ([ADR 0002](../adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)). All
static; no middleware, no locale detection, no cookie, no state library, no data fetching, no tests.

## Locales

- `lib/i18n.ts` owns the locale list (`locales`, `Locale`, `defaultLocale`), the URL rule (`localePath(locale, path)`
  gives `/fr/blog` or `/blog`; `stripLocale(pathname)` gives the unprefixed form back) and the dictionary
  (`getDictionary(locale)`, `fill(template, values)` for `{placeholder}` strings). `lib/site.ts` adds the absolute
  forms (`localeUrl`, `blogUrl`, `postUrl`, `feedUrl`, `feedTitle`, `languageAlternates`).
- Every route file reads the locale from `params` and narrows it with `toLocale()`; `dynamicParams = false` on the
  layout makes any other value a 404.
- **Components receive `locale` as a prop** and read their strings with `getDictionary(locale)`; they never import a
  locale's JSON directly and never contain a sentence. Links inside components go through `localePath(locale, ...)`.
- **`usePathname()` is compared through `stripLocale()`.** The prerendered English page sees `/en` on the server and
  `/` in the browser; comparing the stripped form keeps both renders identical, so hydration stays clean.
- Dates go through `Intl` with `languageTags[locale]` (`formatPostDate` in `lib/posts.ts`); never format a date by hand.

## Components

- **Generic, data-driven.** `Timeline`, `Projects`, `Skills` take an `items` prop (and `locale`) and render whatever the JSON provides. A new content type gets a new generic component plus a JSON file per locale; it does not get copy in the component.
- **Props**: an `interface XProps` at the top of the file, destructured in the signature. Match the neighbour's component style (`React.FC<Props>` in `Timeline.tsx`, plain arrow function in `Projects.tsx`); do not introduce a third.
- **Keys**: stable content keys (`project.name`), not array indices, except in `Timeline.tsx` where items have no id (legacy; add an `id` to the JSON if you need stable keys).
- **`"use client"`** only when needed (hooks, browser APIs, handlers). `Header.tsx` and `AboutMe.tsx` are client; `Footer`, `Projects`, `Skills`, `Timeline` are server-renderable and must stay free of hooks. `app/[locale]/page.tsx` is an async server component: it reads the posts through `lib/posts.ts` (Node `fs`), so nothing client-side may import it, the loader or `lib/portfolio.ts`. `lib/i18n.ts` is client-safe (JSON only) and is the one content module a client component may import.
- **MDX elements** are styled once in `mdx-components.tsx` (root), the map passed to `compileMDX` by `lib/posts.ts`. Add an element there, with daisyUI tokens, rather than wrapping post content in ad-hoc classes; list it in [content.md](content.md#allowed-mdx).

## Sections and navigation

`app/[locale]/page.tsx` renders every section in order. Each section is:

```tsx
<section className="md:py-12 mx-auto container scroll-mt-24" id="projects" aria-labelledby="projects-heading">
  <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
    <TrophyIcon className="h-8 w-8 mr-2 flex" />
    <h2 id="projects-heading" className="text-4xl font-bold text-center md:text-left">
      {t.nav.projects}
    </h2>
  </span>
  <Projects items={projects} posts={posts} locale={locale} />
</section>
```

- The `id` **must** match a `section` value in `menuLinks` in `components/Header.tsx`; the header scroll-navigates by id. Adding a section = add the `<section id>` in `page.tsx`, a `menuLinks` entry (`label` is a `nav` key of the dictionary, section, Heroicon) **and** the `nav.<label>` string in both `ui.json` files.
- Section order in `page.tsx` and `menuLinks` order stay identical. The `Blog` entry (`blogLink`) is the one route link and is rendered after the sections; `Header` reads `stripLocale(usePathname())` so section links are `#id` on the home page and `<home>#id` everywhere else (`/#id`, `/fr#id`).
- The **language switch** lives in the `Header`, next to the contact icons: a `next/link` with `hrefLang` and `lang` to the same path in the other locale (`localePath(other, stripLocale(pathname))`), or to that locale's blog list for a post it has no file for. The layout passes `postLocales` (`slug -> locales`) so the header can tell. No detection, no cookie: the link is the whole mechanism.
- One `<h1>` per page (the name on `/`, `Blog` on `/blog`, the post title on `/blog/<slug>`). Sections use `<h2>`; timeline item titles use `<h3>`.
- Blog pages (`app/[locale]/blog/`) reuse the home page wrapper (`pt-10 mx-auto w-full mt-20` then `px-5`) and a `container max-w-3xl` column so they sit under the fixed header like the sections do. A French post route without a French file renders the English body inside `<article lang="en">` with the `blog.notTranslated` notice above it.

## Styling

- **Tailwind v4 + daisyUI are configured only in `styles/globals.css`** (`@import "tailwindcss"; @plugin "daisyui" { themes: night --default }`). There is no `tailwind.config.*`; do not create one.
- **Use daisyUI semantic tokens**, not raw palette colours: `text-primary`, `text-primary-content`, `text-neutral-content`, `bg-base-100`, `btn btn-primary`, `card`, `badge-primary|secondary|ghost`, `divider`. Raw `text-gray-600` exists only for the About-Me "inactive" fade; do not spread it.
- **Theme is forced to `night`** with a black page background (`:root, [data-theme] { background: black }`). Do not add a theme switcher without also revisiting the hardcoded `ring-white/20`, `bg-black` values.
- **Mobile-first**: base classes are mobile, `md:` overrides for desktop. Every section centres on mobile (`text-center`, `justify-center`) and left-aligns on `md:`.
- **Hand-written CSS is the exception.** The desktop timeline (`.timeline`, `.containerBis`, `.left`, `.right`, `.content` and their pseudo-elements) lives at the bottom of `globals.css` because it needs `::after` connectors. Anything else goes in utilities. If you add CSS there, prefix a comment block naming the component it serves.
- Cards and tiles share the "ring" treatment: `bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1`. Reuse it verbatim for visual consistency.

## Images

- **Always `next/image`**, never `<img>`. Set `width` and `height`.
- Local assets live in `public/assets/img/` and are referenced as `/assets/img/<file>`. Timeline logos are built as `"/assets/img/" + item.logo` and are not all square: they render in a `w-14 h-14 object-contain` box so the intrinsic ratio is kept (Lighthouse `image-aspect-ratio`).
- Remote images (project previews) are allowed only from hosts listed in `images.remotePatterns` in `next.config.js` (GitHub asset hosts + `balayre.com` domains). Adding a host is a deliberate config change.
- The profile picture is `public/assets/img/alexis.jpg`; the social cards are generated by the `opengraph-image/route.tsx` handlers from that photo.

## Links

- External links: `target="_blank" rel="noopener noreferrer"`. Icon-only links carry an `aria-label` naming the destination ("GitHub of Alexis Balayre").
- In-page navigation uses the section ids (see above). `next/link` is used for every header link (the section anchors resolve to `<home>#id` off the home page), for the blog list and posts, and for `<home>#project-<id>` from a post to its project cards; every one of them is built with `localePath(locale, ...)` so it stays in the reader's locale.
- The resume link (`https://alexis-resume.balayre.com/`) and Calendly link are the only external CTAs; keep them in `AboutMe.tsx` / `Header.tsx` respectively (their labels come from the dictionary).

## Hooks

- Custom hooks live in `hooks/`, one per file, re-exported from `hooks/index.ts`, imported as `import { useOutsideClick } from "~~/hooks"`.
- `useEffect` cleanups must snapshot the ref (`const el = ref.current`) before subscribing, as `page.tsx` does with `IntersectionObserver`.

## SEO and metadata

- **Site-wide SEO lives in `app/[locale]/layout.tsx`**: `generateMetadata` (per locale: title template, description, keywords, canonical, hreflang `alternates.languages`, Open Graph with `locale` and `alternateLocale`, Twitter, robots, icons, manifest, the RSS `alternates.types` link), the `viewport` export and the JSON-LD `<script type="application/ld+json">` block. The block is a schema.org `@graph` (WebSite, ProfilePage, Person, ItemList of projects) returned by `buildStructuredData` in `lib/structuredData.ts`, which derives employers, degrees, awards and skills from the **English** JSON and the projects list from the locale's JSON; the `Person` copy (`jobTitle`, `description`, `knowsAbout`) comes from the `profile` group of the dictionary, the contact and names are constants in the layout. Site constants shared with the blog (`siteUrl`, `siteName`, `authorName`, `twitterHandle`) and the per-locale URL helpers live in `lib/site.ts`; the blog title and description are dictionary strings.
- **Every page emits the locale set**: `<html lang>`, a canonical, `alternates.languages` for `en`, `fr` and `x-default` (= English) through `languageAlternates(path, available)`, `og:locale` (`en_GB` / `fr_FR`) with `og:locale:alternate`. A post without a French file passes `post.locales` so the `fr` alternate is omitted, and its French route uses the English canonical.
- **Blog pages own their page-level metadata**: `app/[locale]/blog/page.tsx` and `app/[locale]/blog/[slug]/page.tsx` export `generateMetadata`. Next replaces nested objects (`alternates`, `openGraph`, `twitter`) rather than merging them, so a blog page sets each of them in full: canonical, languages, the RSS alternate, `openGraph` (`type: "article"` with `publishedTime`, `authors`, `tags` on a post), `twitter` (`summary_large_image`). Each blog page also injects its own JSON-LD (`buildBlog` or `buildBlogPosting`, `inLanguage` per locale, referencing the layout's `Person` by `@id`). Do not scatter `<Head>`/meta elsewhere.
- The social cards are route handlers, `app/[locale]/opengraph-image/route.tsx` (home), `app/[locale]/blog/opengraph-image/route.tsx` (list) and `app/[locale]/blog/[slug]/opengraph-image/route.tsx` (one per post, same gradient, accent and photo), `force-static` with `generateStaticParams` for the full locale (and slug) set because route handlers do not inherit the layout's params; each renders the dictionary strings of its locale. They are not the `opengraph-image.tsx` file convention, which would advertise the `/en/...` URL on English pages: every page sets `openGraph.images` and `twitter.images` itself with `socialImage(locale, path, alt)` from `lib/site.ts` (unprefixed for English, localised alt). `app/sitemap.ts` never lists them and `next.config.js` sends `X-Robots-Tag: noindex` on `*/opengraph-image` and `*/rss.xml`; the HTML pages carry no such header.
- **404**: `app/not-found.tsx` is the one not-found page, prerendered as `/_not-found` with its own `<html lang="en">`, `Header`, `NotFound` and `Footer`, and served with status 404 for every URL the router refuses: an unknown locale, an unknown slug (`dynamicParams = false` on the layout and the post route) or anything else under `/fr`. There is no catch-all route and no request-time `notFound()`: in this Next version those are streamed as a bare document ([ADR 0002](../adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)). `components/NotFound.tsx` (client) reads the locale from the address after mount and switches its copy and `document.documentElement.lang` to French under `/fr/*`; the strings are the `notFound` group of the dictionary.
- Update the `site` and `profile` groups of both `ui.json` files whenever the About-Me copy or the current role changes; employers, degrees and awards follow the English JSON automatically. Same for `public/llms.txt` and `public/llms.fr.txt` (see [content.md](content.md)).
- **`/sitemap.xml` and `/robots.txt` are metadata routes**, `app/sitemap.ts` and `app/robots.ts` ([ADR 0003](../adr/0003-sitemap-and-robots-as-next-metadata-routes.md)), the only two files at the root of `app/` beside the pass-through layout and the 404. The sitemap builds its entries from `lib/posts.ts` and the URL helpers of `lib/site.ts`: every page in every locale it exists in, `alternates.languages` from `languageAlternates`, and a `lastModified` that is always a content date (`post.date`, the newest post date, `portfolioUpdatedOn`), never `new Date()`. A new route gets an entry there. Nothing under `public/` may shadow either path. `public/site.webmanifest`, the favicons and the IndexNow key file are static.
- **Blog pages also emit a `BreadcrumbList`** (`buildBreadcrumbs` in `lib/structuredData.ts`: `authorName` for the home page, `t.blog.title`, then the post title, each with the locale's URL) in a second `<script type="application/ld+json">` beside the `Blog` / `BlogPosting` one.
- **Security and crawl headers live in `headers()` of `next.config.js`**: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options` on `/:path*`, `X-Robots-Tag: noindex` on the social images and the feeds. Sources match the request path before the rewrites, so an unprefixed English path is matched as typed.

## Accessibility

- Meaningful `alt` on every image, from the dictionary (`home.portraitAlt`, `projects.previewAlt` with `{name}`); timeline logos derive `timeline.logoAlt` (`{organisation}`) from the entry title.
- A control with visible text keeps that text as its accessible name: an `aria-label` that does not contain the visible words fails Lighthouse `label-content-name-mismatch`. Put the longer wording in `title` (the description), as the project cards' "View Project" and the blog's RSS link do; `aria-label` is for icon-only controls.
- Interactive elements are `<a>` or `<button>`, never a `<div onClick>`. Section navigation is `<a href="#id">` with `aria-current="location"` on the active item; landmarks are `<header>`, `<nav aria-label>`, `<main>`, `<section aria-labelledby>`, `<footer>`.
- Heading order: one `<h1>` per page, `<h2>` per section (and per post section in MDX), `<h3>` for items inside a section (timeline cards, project cards, skill categories).
- Keep the `transition-colors duration-500` fade for section activation; do not add motion that ignores `prefers-reduced-motion` without a media query.

## Build and tooling

- `yarn dev` / `yarn build` use Turbopack. `yarn build` fails on lint or type errors unless `NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`; never set that in CI or committed config.
- ESLint is `next/core-web-vitals` + `@typescript-eslint/recommended` + Prettier (`.eslintrc.json`, legacy format run through `next lint`). Prettier: `printWidth` 120, `arrowParens: avoid`, `trailingComma: all`.
- The Stop hook runs Prettier, ESLint, and `tsc --noEmit` on what you touched; you do not need to run them by hand.

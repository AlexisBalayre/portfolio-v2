# Frontend Conventions

Rules for `app/`, `components/`, `hooks/`, `styles/`, `lib/` and `mdx-components.tsx`. Builds on [general.md](general.md).
Auto-loaded by `.claude/rules/frontend-conventions.md`. For how the pieces fit together, read
[../reference/architecture.md](../reference/architecture.md).

## Stack

Next.js 15 App Router (Turbopack), React 19, TypeScript strict, Tailwind CSS v4, daisyUI v5.
Two route families: the home page (`/`) and the blog (`/blog`, `/blog/<slug>`, `/blog/rss.xml`), all static. No state library, no data fetching, no tests.

## Components

- **Generic, data-driven.** `Timeline`, `Projects`, `Skills` take an `items` prop and render whatever the JSON provides. A new content type gets a new generic component plus a JSON file; it does not get copy in the component.
- **Props**: an `interface XProps` at the top of the file, destructured in the signature. Match the neighbour's component style (`React.FC<Props>` in `Timeline.tsx`, plain arrow function in `Projects.tsx`); do not introduce a third.
- **Keys**: stable content keys (`project.name`), not array indices, except in `Timeline.tsx` where items have no id (legacy; add an `id` to the JSON if you need stable keys).
- **`"use client"`** only when needed (hooks, browser APIs, handlers). `Header.tsx` and `AboutMe.tsx` are client; `Footer`, `Projects`, `Skills`, `Timeline` are server-renderable and must stay free of hooks. `app/page.tsx` is an async server component: it reads the posts through `lib/posts.ts` (Node `fs`), so nothing client-side may import it or the loader.
- **MDX elements** are styled once in `mdx-components.tsx` (root), the map passed to `compileMDX` by `lib/posts.ts`. Add an element there, with daisyUI tokens, rather than wrapping post content in ad-hoc classes; list it in [content.md](content.md#allowed-mdx).

## Sections and navigation

`app/page.tsx` renders every section in order. Each section is:

```tsx
<div className="md:py-12 mx-auto container" id="projects">
  <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
    <TrophyIcon className="h-8 w-8 mr-2 flex" />
    <h2 className="text-4xl font-bold text-center md:text-left">Projects</h2>
  </span>
  <Projects items={projects} />
</div>
```

- The `id` **must** match a `section` value in `menuLinks` in `components/Header.tsx`; the header scroll-navigates by id. Adding a section = add the `<div id>` in `page.tsx` **and** a `menuLinks` entry (label, section, Heroicon).
- Section order in `page.tsx` and `menuLinks` order stay identical. The `Blog` entry (`blogLink`) is the one route link and is rendered after the sections; `Header` reads `usePathname()` so section links are `#id` on the home page and `/#id` everywhere else.
- One `<h1>` per page (the name on `/`, `Blog` on `/blog`, the post title on `/blog/<slug>`). Sections use `<h2>`; timeline item titles use `<h4>`.
- Blog pages (`app/blog/`) reuse the home page wrapper (`pt-10 mx-auto w-full mt-20` then `px-5`) and a `container max-w-3xl` column so they sit under the fixed header like the sections do.

## Styling

- **Tailwind v4 + daisyUI are configured only in `styles/globals.css`** (`@import "tailwindcss"; @plugin "daisyui" { themes: night --default }`). There is no `tailwind.config.*`; do not create one.
- **Use daisyUI semantic tokens**, not raw palette colours: `text-primary`, `text-primary-content`, `text-neutral-content`, `bg-base-100`, `btn btn-primary`, `card`, `badge-primary|secondary|ghost`, `divider`. Raw `text-gray-600` exists only for the About-Me "inactive" fade; do not spread it.
- **Theme is forced to `night`** with a black page background (`:root, [data-theme] { background: black }`). Do not add a theme switcher without also revisiting the hardcoded `ring-white/20`, `bg-black` values.
- **Mobile-first**: base classes are mobile, `md:` overrides for desktop. Every section centres on mobile (`text-center`, `justify-center`) and left-aligns on `md:`.
- **Hand-written CSS is the exception.** The desktop timeline (`.timeline`, `.containerBis`, `.left`, `.right`, `.content` and their pseudo-elements) lives at the bottom of `globals.css` because it needs `::after` connectors. Anything else goes in utilities. If you add CSS there, prefix a comment block naming the component it serves.
- Cards and tiles share the "ring" treatment: `bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1`. Reuse it verbatim for visual consistency.

## Images

- **Always `next/image`**, never `<img>`. Set `width` and `height`.
- Local assets live in `public/assets/img/` and are referenced as `/assets/img/<file>`. Timeline logos are built as `"/assets/img/" + item.logo`.
- Remote images (project previews) are allowed only from hosts listed in `images.remotePatterns` in `next.config.js` (GitHub asset hosts + `balayre.com` domains). Adding a host is a deliberate config change.
- The profile picture is `public/assets/img/alexis.jpg`; the Open Graph image is generated by `app/opengraph-image.tsx` from that photo.

## Links

- External links: `target="_blank" rel="noopener noreferrer"`. Icon-only links carry an `aria-label` naming the destination ("GitHub of Alexis Balayre").
- In-page navigation uses the section ids (see above). `next/link` is used for every header link (the section anchors resolve to `/#id` off the home page), for `/blog` and `/blog/<slug>`, and for `/#project-<id>` from a post to its project cards.
- The resume link (`https://alexis-resume.balayre.com/`) and Calendly link are the only external CTAs; keep them in `page.tsx` / `Header.tsx` respectively.

## Hooks

- Custom hooks live in `hooks/`, one per file, re-exported from `hooks/index.ts`, imported as `import { useOutsideClick } from "~~/hooks"`.
- `useEffect` cleanups must snapshot the ref (`const el = ref.current`) before subscribing, as `page.tsx` does with `IntersectionObserver`.

## SEO and metadata

- **Site-wide SEO lives in `app/layout.tsx`**: the `metadata` and `viewport` exports (title template, description, keywords, Open Graph, Twitter, robots, icons, manifest, the RSS `alternates.types` link) and the JSON-LD `<script type="application/ld+json">` block. The block is a schema.org `@graph` (WebSite, ProfilePage, Person, ItemList of projects) returned by `buildStructuredData` in `lib/structuredData.ts`, which derives employers, degrees, awards, skills and projects from the content JSON; only the `profile` constants (name, role, description, contact, `knowsAbout` concepts) are hand-written. Site constants shared with the blog (`siteUrl`, `siteName`, `authorName`, `twitterHandle`, the blog title and description, `feedUrl`) live in `lib/site.ts`.
- **Blog pages own their page-level metadata**: `app/blog/page.tsx` exports `metadata`, `app/blog/[slug]/page.tsx` exports `generateMetadata`. Next replaces nested objects (`alternates`, `openGraph`, `twitter`) rather than merging them, so a blog page sets each of them in full: canonical, the RSS alternate, `openGraph` (`type: "article"` with `publishedTime`, `authors`, `tags` on a post), `twitter` (`summary_large_image`). Each blog page also injects its own JSON-LD (`buildBlog` or `buildBlogPosting`, referencing the layout's `Person` by `@id`). Do not scatter `<Head>`/meta elsewhere.
- The social cards are `app/opengraph-image.tsx` (home) and `app/blog/[slug]/opengraph-image.tsx` (one per post, same gradient, accent and photo, generated at build via `generateStaticParams`); Next injects `og:image` automatically, so `metadata.openGraph.images` stays unset.
- Update the `profile` constants in `layout.tsx` (`jobTitle`, `description`, `knowsAbout`) and the metadata description/keywords whenever the About-Me copy or the current role changes; employers, degrees and awards follow the JSON automatically. Same for `public/llms.txt` (see [content.md](content.md)).
- `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` are **generated** by `next-sitemap` on `postbuild` from `next-sitemap.config.js`. Never edit them; the `protect-generated` hook blocks it. `public/site.webmanifest` and the favicons are static.

## Accessibility

- Meaningful `alt` on every image (`"Portrait of Alexis Balayre, AI Engineer"`, `` `${project.name} project preview` ``); timeline logos derive `"<organisation> logo"` from the entry title.
- Interactive elements are `<a>` or `<button>`, never a `<div onClick>`. Section navigation is `<a href="#id">` with `aria-current="location"` on the active item; landmarks are `<header>`, `<nav aria-label>`, `<main>`, `<section aria-labelledby>`, `<footer>`.
- Heading order: one `<h1>` per page, `<h2>` per section (and per post section in MDX), `<h3>` for items inside a section (timeline cards, project cards, skill categories).
- Keep the `transition-colors duration-500` fade for section activation; do not add motion that ignores `prefers-reduced-motion` without a media query.

## Build and tooling

- `yarn dev` / `yarn build` use Turbopack. `yarn build` fails on lint or type errors unless `NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`; never set that in CI or committed config.
- ESLint is `next/core-web-vitals` + `@typescript-eslint/recommended` + Prettier (`.eslintrc.json`, legacy format run through `next lint`). Prettier: `printWidth` 120, `arrowParens: avoid`, `trailingComma: all`.
- The Stop hook runs Prettier, ESLint, and `tsc --noEmit` on what you touched; you do not need to run them by hand.

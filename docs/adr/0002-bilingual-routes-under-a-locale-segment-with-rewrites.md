---
status: accepted
---

# Bilingual routes live under one `app/[locale]/` tree, English served unprefixed through rewrites

Decided on 2026-09-25.

The site became bilingual (English default, French) with two hard constraints: every existing English URL keeps
rendering the same English page at the same path, and the output stays fully static, with no middleware, no
`Accept-Language` detection and no cookie. We keep one route tree, `app/[locale]/`, whose layout is the root layout
(`<html lang>`), prerendered for `en` and `fr` by `generateStaticParams` with `dynamicParams = false`. Four
`rewrites` in `next.config.js` map `/`, `/opengraph-image`, `/blog` and `/blog/*` to their `/en/**` twin, so
English stays unprefixed and French lives under `/fr`. The reader switches language with a link in the header;
nothing is detected or remembered.

## Considered options

- **`app/[locale]/` plus rewrites** (chosen): one implementation of every page, image and feed; the locale is a
  route param read by `generateMetadata`, the JSON-LD builders and the components. The rewrite is a static routing
  rule, so the pages remain SSG and the deploy target needs nothing beyond `next.config.js`. Two permanent
  redirects send a direct hit on `/en` or `/en/**` back to the unprefixed URL, so the twins are never indexable
  duplicates (redirects run before rewrites and are not re-applied to a rewrite destination).
- **Two route trees** (`app/` for English, `app/fr/` for French, thin files re-exporting shared page components):
  no rewrite, but twice the route files, page components moved out of `app/` and two places to keep in step for
  every new route. Rejected as duplication that the rewrite removes.
- **Middleware or proxy redirecting by `Accept-Language`**: breaks the "one URL, one page" rule, adds a runtime
  step on every request and a cookie to remember the choice. Excluded by the constraints.
- **Next.js built-in `i18n` config**: Pages Router only; it does not apply to the App Router.
- **An i18n library** (`next-intl`, `next-i18next`): message formatting, plural rules and a middleware this site
  does not need for a few dozen strings. A hand-rolled dictionary typed from the English JSON (`Dictionary = typeof en`) fails typecheck on a missing French key, which is the guarantee we wanted. No dependency was added.

## Content layout

- Portfolio JSON is per locale: `public/assets/data/en/*.json` and `public/assets/data/fr/*.json`, loaded by
  `lib/portfolio.ts`, which throws at import time when a French file lacks an entry the English one has, so the
  build fails instead of rendering a hole.
- UI strings, SEO titles and descriptions, the blog title and the social-card labels are in `ui.json` in the same
  folders, read through `getDictionary(locale)` in `lib/i18n.ts`.
- Posts stay `content/blog/<slug>.mdx`; an optional `<slug>.fr.mdx` next to it is the French version. A missing
  French file makes the French route render the English body with a visible notice, keep the English canonical and
  omit the `fr` hreflang, so search engines never see the fallback as a French page.

## Consequences

- The prerendered English pages see the `/en` pathname on the server and the unprefixed one in the browser.
  `usePathname()` consumers compare the locale-stripped form (`stripLocale` in `lib/i18n.ts`) so both renders agree
  and hydration stays clean.
- The `Header` (in the layout, so unaware of the page) receives a `slug -> locales` map from the layout to send the
  language switch to the blog list rather than to the fallback page of an untranslated post.
- `next-sitemap` reads the prerendered `/en/**` and `/fr/**` paths; its `transform` strips the English prefix, drops
  the fallback post pages and writes `alternateRefs` for `en`, `fr` and `x-default` from the files on disk.
- The JSON-LD `WebSite` and `Person` nodes are shared across locales through their `@id`; `ProfilePage`, the
  projects `ItemList`, `Blog` and `BlogPosting` carry `inLanguage` and a per-locale URL. The `Person` facts are
  parsed from the English titles (`<role> at <organisation>`), so the French timeline titles need no parseable shape.
- The social cards are route handlers (`opengraph-image/route.tsx`) rather than the `opengraph-image.tsx` file
  convention: the convention advertises the route's own `/en/...` URL on English pages, even with explicit
  `openGraph.images`. Each page lists its card explicitly with `socialImage()` (unprefixed for English, a
  localised alt), and each handler exports `generateStaticParams` for the full locale (and slug) set because the
  layout's params are not handed down to it at build time.
- There is one 404 page, `app/not-found.tsx`, prerendered as `/_not-found` with its own `<html lang="en">` and the
  site shell, served for every URL the router refuses (`dynamicParams = false` on the layout and the post route,
  no catch-all). A localised `app/[locale]/not-found.tsx` reached through `notFound()` at request time was tried
  and rejected: in Next 15.5 a request-time not-found is streamed as the bare `__next_error__` document and the
  styled page only appears after client rendering, and a Suspense boundary around it returns status 200. The
  prerendered page switches its copy and `lang` to French on the client for `/fr/*` addresses.

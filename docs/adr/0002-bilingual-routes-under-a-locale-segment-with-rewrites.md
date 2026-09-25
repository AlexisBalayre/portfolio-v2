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
  rule, so the pages remain SSG and the deploy target needs nothing beyond `next.config.js`. The cost is that the
  `/en/**` twins are reachable too (they carry the unprefixed canonical and are left out of the sitemap) and that the
  auto-injected `og:image` URL of an English page points at its `/en/...` image.
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
- Every metadata image file exports `generateStaticParams` for the full locale (and slug) set: the layout's
  params are not handed down to image routes at build time.

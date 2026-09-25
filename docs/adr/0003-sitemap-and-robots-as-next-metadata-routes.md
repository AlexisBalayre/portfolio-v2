---
status: accepted
---

# The sitemap and robots.txt are Next metadata routes with content-derived lastmod

Decided on 2026-09-25.

Production served the committed `public/sitemap.xml`, `public/sitemap-0.xml` and `public/robots.txt`. They were
written by `next-sitemap` in the `postbuild` script, which the Vercel build never ran, so every content change
merged with a sitemap that still described the previous state, and its `lastmod` was the time of whichever local
build last touched the file. We replace the package with two files Next.js renders at build time from the same
loaders as the pages: `app/sitemap.ts` (served at `/sitemap.xml`) and `app/robots.ts` (served at `/robots.txt`).
Nothing is committed, nothing can go stale, and the crawl policy for the social images and the feeds moves to an
`X-Robots-Tag` header in `next.config.js`.

## Considered options

- **Next metadata routes** (chosen): `app/sitemap.ts` and `app/robots.ts` are the framework's file conventions for
  these two files. They import `lib/posts.ts` and `lib/site.ts` directly, so the locale list, the URL rule and the
  post loader exist once (the old CommonJS config had to repeat `siteUrl`, the locales and the prefix rule). Next
  writes hreflang alternates from `alternates.languages`, including `x-default`, and serialises a `YYYY-MM-DD`
  `lastModified` string as given. The output is prerendered (`○ /sitemap.xml`, `○ /robots.txt` in the build log),
  so the deploy target needs nothing beyond `next build`.
- **Keep `next-sitemap` and run it in the Vercel build**: a `vercel-build` script or a Build Command override would
  make the step run, but the package would still crawl the `.next` output after the fact and rebuild the locale
  logic from the route names, and `lastmod` would stay the build time. Rejected: the duplication is the bug.
- **A route handler** (`app/sitemap.xml/route.ts`): the same result with hand-written XML. Rejected in favour of the
  typed convention, which also feeds `next build`'s route table.

## lastmod

Google uses `lastmod` only when it is consistently truthful, so a value that moves on every deploy is worse than
none. Every entry therefore carries a content date, never the build time:

- a post uses its frontmatter `date`, in every locale it has a file for;
- the blog list uses the newest post date, since the list changes when a post is added;
- the home page uses the later of the newest post date (the project cards list posts) and `portfolioUpdatedOn`, a
  dated constant in `lib/site.ts` bumped by hand when the JSON under `public/assets/data/` changes. The JSON has no
  date of its own and the Vercel build has no git history to derive one from, so a constant is the only honest
  source; forgetting to bump it delays a recrawl of one page rather than lying about eight.

`changefreq` and `priority` are dropped: Google ignores both, and `priority: 1.0` on every page carried no signal.

## Consequences

- `next-sitemap` is gone from `package.json`, `yarn.lock` and the `postbuild` script; `next-sitemap.config.js` and
  the three committed files are deleted. Next refuses a `public/` file that shadows a metadata route, so they
  cannot come back by accident. `GENERATED_PATHS_REGEX` and `protect-generated.sh` no longer list them.
- A French route that falls back to the English body is still left out, now by construction: `app/sitemap.ts`
  lists a post under the locales in `post.locales`, the same field that restricts the page's hreflang.
- The social images (`/opengraph-image`, `/blog/opengraph-image`, `/blog/<slug>/opengraph-image`, and their `/fr`
  twins) and the feeds (`/blog/rss.xml`, `/fr/blog/rss.xml`) are not listed, and `next.config.js` sends
  `X-Robots-Tag: noindex` on those paths. `robots.txt` keeps allowing them: a disallowed image cannot be fetched
  for the social preview, and `noindex` is what keeps a fetched file out of the results.
- `robots.txt` keeps the `*` rule, the explicit group of AI crawler user agents and the `Sitemap:` line. The
  Yandex-only `Host:` line and the two comment lines pointing at `llms.txt` are gone: the metadata route has no
  comment field, and `llms.txt` is linked from the site and from the `WebSite` node instead.
- `next.config.js` also sends the security headers (`X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `X-Frame-Options`) on every response; the `headers()` sources match the request path
  before the locale rewrites, so the unprefixed English routes are covered.
- Bing and the other IndexNow engines are told about changes by `.github/workflows/indexnow.yaml`, which submits
  the live sitemap's URLs after each push to `main`; the key file lives in `public/` (see
  [architecture.md](../reference/architecture.md#search-engines-and-indexnow)).
- The `next-sitemap` consequence of [ADR 0002](0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)
  is superseded by this record; ADR 0002 is left as written.

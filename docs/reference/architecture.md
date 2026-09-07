# Site Architecture (Reference)

How the portfolio at https://alexis.balayre.com is put together. For coding rules see
[../conventions/frontend.md](../conventions/frontend.md); for content rules see
[../conventions/content.md](../conventions/content.md).

## One page, data-driven

```
public/assets/data/*.json ──import──▶ app/page.tsx ──props──▶ components/{Timeline,Projects,Skills}
                                          │
app/layout.tsx (server) ── <Header/> ─────┤── sections with id="…" ◀── Header.menuLinks[].section
        │                  <Footer/>      │
        ├── metadata (title, OG, Twitter, icons, robots)
        └── JSON-LD: WebSite + Person
```

- **`app/layout.tsx`** (server component) wraps the page with `Header` and `Footer`, exports the `metadata` object, and injects two JSON-LD blocks. It is the single home of SEO.
- **`app/page.tsx`** (client component) renders six sections in order: About Me, Experiences, Projects, Skills, Hackathons, Education. Each is a `<div id>` with an icon + `<h2>` header and one generic component. The About-Me section uses an `IntersectionObserver` to fade its text in when 30% visible; that observer is why the page is a client component.
- **`components/Header.tsx`** (client) holds `menuLinks` (label, section id, Heroicon), a desktop nav and a mobile burger menu closed by `useOutsideClick`, and the Calendly CTA. Navigation is scroll-to-id, not routing: there is exactly one route.
- **`components/Timeline.tsx`** renders the three chronological JSON files. It has two markup branches: a desktop alternating left/right timeline driven by the hand-written CSS in `styles/globals.css`, and a stacked mobile list. Titles and descriptions are HTML strings injected with `dangerouslySetInnerHTML`.
- **`components/Projects.tsx`** renders daisyUI cards (image, name, description, technology badges, link). **`components/Skills.tsx`** renders categories of badges colour-coded by tier with a legend.

## Content pipeline

1. Edit `public/assets/data/<file>.json` (shapes in [content.md](../conventions/content.md)).
2. `page.tsx` imports the JSON at build time (`resolveJsonModule`); no fetch, no CMS.
3. Images referenced by the JSON come from `public/assets/img/` (logos) or from remote hosts allow-listed in `next.config.js` (`images.remotePatterns`).
4. `public/llms.txt` is a parallel, hand-written summary for AI agents; it is not generated from the JSON, so it is updated by hand alongside it.

## Styling system

- Tailwind CSS v4 and daisyUI v5 are configured in CSS, not JS: `styles/globals.css` starts with `@import "tailwindcss"; @plugin "daisyui" { themes: night --default }`. PostCSS runs `@tailwindcss/postcss` (`postcss.config.mjs`).
- The `night` theme is the only theme and the page background is forced black.
- The rest of `globals.css` is base resets and the timeline's positioned layout (`.timeline::after` centre line, `.containerBis.left/.right` halves, `.content` cards).

## SEO artefacts

| Artefact | Source | Generated? |
| :--- | :--- | :--- |
| `<title>`, description, keywords, Open Graph, Twitter card, robots, icons, manifest link | `metadata` in `app/layout.tsx` | No |
| JSON-LD `WebSite` and `Person` | constants in `app/layout.tsx` | No |
| `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` | `next-sitemap` on `postbuild`, config in `next-sitemap.config.js` (`siteUrl`, weekly changefreq) | **Yes** (committed output; never edit by hand) |
| `public/preview.png` (1200×630 OG image), favicons, `site.webmanifest`, `llms.txt` | static files | No |

## Toolchain and build

- **Node >= 20** (`.nvmrc` = 20, `engines.node`), **Yarn 1** (`yarn.lock` v1, `packageManager: yarn@1.22.22` so `corepack yarn` resolves to Yarn 1 on a Node 20 install that has no global yarn). The `.pnp.cjs` / `.pnp.loader.mjs` files at the root are stale Yarn Berry leftovers and are gitignored.
- `yarn dev` and `yarn build` run Next.js with Turbopack. `postbuild` runs `next-sitemap`.
- `next.config.js`: `reactStrictMode`, `poweredByHeader: false`, `compress`, `images.remotePatterns`, and env-gated `ignoreBuildErrors` / `ignoreDuringBuilds` (`NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`, for emergencies only).
- Quality gate: `yarn lint` (`next lint`, ESLint legacy config), `yarn typecheck` (`tsc --noEmit`), `yarn format` (Prettier). The Claude Code Stop hook runs all three on touched files; `scripts/pre-commit` runs lint + typecheck for human commits. There is no test suite.
- CI (`.github/workflows/lint.yaml`) runs `yarn lint`, `yarn typecheck`, and `yarn build` on pushes and PRs to `main`, on the Node version from `.nvmrc`.
- `@vercel/analytics` is a dependency but is not currently mounted in `layout.tsx`.

## Extension points

- **New section**: JSON file (if new content type) → generic component in `components/` → `<div id>` block in `page.tsx` → `menuLinks` entry in `Header.tsx` → mention in `llms.txt`.
- **New project / experience**: JSON entry only, plus the sync list in [content.md](../conventions/content.md#keep-in-sync).
- **New page / route**: would be the first. Reconsider whether a section does the job; if not, add `app/<route>/page.tsx` (`next-sitemap` picks it up automatically) and switch `Header` navigation to `next/link`.

---
status: accepted
---

# Blog posts are MDX files in the repo, compiled at build time with next-mdx-remote

Decided on 2026-09-24.

The site needed a blog for technical articles about the open-source projects, published by merging a pull request
and rendered statically like the rest of the portfolio. We keep each post as `content/blog/<slug>.mdx` with YAML
frontmatter (`title`, `description`, `date`, `tags`, `projects`) and compile it in a server component with
`next-mdx-remote/rsc` (`compileMDX`, `parseFrontmatter: true`) through one loader, `lib/posts.ts`, that also
validates the frontmatter and fails the build on a bad field. The post page, the listing, the RSS route, the
per-post `next/og` image and the project cards all read from that loader.

## Considered options

- **`@next/mdx`**: official, but it treats posts as importable modules, so listing them means dynamic
  `import()` by slug, frontmatter needs two more remark plugins (`remark-frontmatter`,
  `remark-mdx-frontmatter`) configured as string names for Turbopack, and the types come from a module
  declaration rather than validation. It also needs a `withMDX` wrapper in `next.config.js`.
- **`next-mdx-remote`** (chosen): one dependency, no bundler configuration, frontmatter parsing built in, and a
  post is data read from disk, which is how the JSON content already works here. The `content` folder stays a
  plain directory of files.
- **Content frameworks** (Contentlayer, Velite, Content Collections): a generated types layer and a build
  step for a site with one content type and a handful of posts. Rejected as weight without a use.
- **Git-backed CMS or headless CMS**: a runtime dependency and an account for a site that is otherwise a static
  build from the repo. Rejected.

## Consequences

- `app/page.tsx` became a server component so the project cards can list related posts; the About Me
  fade-in, the only browser-dependent block, moved to `components/AboutMe.tsx`.
- `siteUrl` and the other site constants moved from `app/layout.tsx` to `lib/site.ts` so the blog routes and the
  feed share them (`next-sitemap.config.js` keeps its own copy because it is CommonJS).
- The MDX dialect is CommonMark plus JSX components. `remark-gfm` was added on 2026-09-25 when the first long-form
  post needed a table; heading anchors or syntax highlighting would still be a deliberate plugin addition.
- Every consumer compiles the posts it needs at build time; with a small number of posts this costs nothing,
  and `react`'s `cache` dedupes the work within one request.

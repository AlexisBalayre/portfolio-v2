---
status: accepted
---

# Scheduled posts are a build-time date filter plus a daily production deploy hook

Decided on 2026-09-25.

A post is merged when it is finished, which is not always the day it should go out: the first long-form post was
dated a week ahead and went live on merge. We wanted a post to appear on its frontmatter `date` and not before, on a
site that stays fully static (no middleware, no request-time code, see
[ADR 0002](0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)). We keep the decision in the loader:
`getAllPosts` in `lib/posts.ts` returns the posts whose `date` is on or before today in `Europe/Paris`
(`publishTimeZone` in `lib/site.ts`, today computed with `Intl` as a `YYYY-MM-DD` string), when `VERCEL_ENV` is
`production`. Every consumer already reads from it, so a scheduled post is absent from the listing, the feeds, the
sitemap, the project cards and the static params of the post page and its social image, which makes its URL a 404
(`dynamicParams = false`). Since a static build only changes when it is rebuilt, a GitHub Actions cron
(`.github/workflows/scheduled-publish.yaml`, 04:00 UTC daily) POSTs to a Vercel Deploy Hook, so production is
rebuilt every morning and the post whose day has come is prerendered. Preview deployments and `yarn dev` skip the
filter so the author can proofread at the final URL.

## Considered options

- **Build-time filter and a daily deploy hook** (chosen): the loader is the one place that decides what exists, the
  output stays static, and the rebuild reuses the Production path (same build, same IndexNow submission). The
  cost is one rebuild per day of unchanged content, which is invisible: every `lastmod` is a content date.
- **Runtime checks**: a `Date` comparison in the page, the listing and the feed at request time. Those routes are
  prerendered, so the comparison would run once at build and then freeze; making them dynamic (`force-dynamic`,
  ISR, or a middleware) would give up the static output and the CDN-only serving of the site for a feature that
  needs one decision per day. Rejected.
- **A GitHub Action that merges or commits on the date**: keep scheduled posts on a branch or in a folder and have a
  cron move them into `main`. It needs `contents: write`, a bot commit in the history and a convention for where
  unpublished posts live, and the preview of a pull request could not show the post at its final URL. Rejected.
- **Vercel Cron Jobs**: they call a route handler on a schedule, but a rebuild still needs the Deploy Hook, so the
  cron would only add a serverless function to a site that has none. Rejected.

## Consequences

- Publication happens at the first production build on or after the date: the daily one at 06:00 Paris in summer
  and 05:00 in winter (GitHub cron is UTC only), or any merge to `main` that day. A merge the evening before does
  not publish early.
- The secret `VERCEL_DEPLOY_HOOK_URL` is the only credential the repository holds; the workflow skips with a notice
  when it is empty and never prints it (setup and rotation in
  [architecture.md](../reference/architecture.md#scheduled-posts)).
- The home and blog list `lastmod` in `app/sitemap.ts` follow the newest published post, unchanged in code
  because they already read `getAllPosts`.
- `content/blog/claude-code-fast-and-reliable.mdx`, dated 2026-10-02 and already live, becomes the first
  scheduled post: the next production build hides it until that morning.

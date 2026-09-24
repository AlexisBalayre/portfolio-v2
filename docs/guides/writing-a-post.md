# Writing a blog post

How to add an article to https://alexis.balayre.com/blog, end to end. A post is one MDX file; merging the pull
request publishes it. The rules behind each step are in [../conventions/content.md](../conventions/content.md#blog-posts).

## 1. Start a worktree

```sh
nvm use
yarn worktree:create post-<slug>
cd .worktrees/post-<slug>
```

## 2. Create the file

Create `content/blog/<slug>.mdx`. The slug is the URL (`/blog/<slug>`): lowercase words joined by hyphens, no
dates, no stop words that add nothing (`merge-gate-debt-ratchet`, not `2026-10-a-post-about-the-merge-gate`).
Once published, a slug never changes.

Paste this skeleton and fill it in:

```mdx
---
title: "Plain sentence, no trailing full stop"
description: "One sentence, 120 to 160 characters: the listing, the social card, the feed and the meta description."
date: "2026-10-01"
tags: ["pupitre", "claude-code"]
projects: ["pupitre"]
---

Opening paragraph: what the reader gets, in two or three sentences.

## First section

Body text.
```

Every frontmatter field is required. `projects` lists the `id` of one or more entries in
`public/assets/data/projects.json` (it may be empty: `[]`); an unknown id fails the build. `date` is the publication
day in `YYYY-MM-DD`; posts are listed newest first.

## 3. Write the body

Start headings at `##` (the title is the `h1`). Use Markdown paragraphs, `**bold**`, `_italic_`, lists, block quotes,
fenced code blocks with a language tag, and links. Internal links are root-relative (`/blog/other-post`,
`/#project-pupitre`); external links open in a new tab automatically.

Images go through `next/image`: put the file under `public/assets/img/blog/` and write

```mdx
<Image src="/assets/img/blog/merge-gate.png" alt="The gate report for one session" width="1200" height="675" />
```

Write every attribute as a quoted string. JSX expressions in braces (`width={1200}`, `{variable}`) are stripped by
the compiler, so `next/image` would get no size and the page would fail. Markdown image syntax (`![]()`), raw HTML,
tables and footnotes are not supported; see the allowed MDX list in
[../conventions/content.md](../conventions/content.md#allowed-mdx).

Style: British English, first person, no em-dash, no emoji. Concrete over generic: name the tool, the command, the
number.

## 4. Preview

```sh
yarn dev
```

Open http://localhost:3000/blog for the listing and http://localhost:3000/blog/<slug> for the post. The social card is
at http://localhost:3000/blog/<slug>/opengraph-image and the feed at http://localhost:3000/blog/rss.xml. A frontmatter
mistake shows as a build error naming the file and the field.

## 5. Keep the rest in sync

- `public/llms.txt`: add the post to the **Blog** section (title, URL, one-line description).
- `public/assets/data/projects.json`: if the post is about a project that has no card yet, add the card first
  (shape in [../conventions/content.md](../conventions/content.md#projectsjson)); the post links to it by `id`.
- Nothing else: the sitemap, the feed, the social image, the JSON-LD and the "Read more on the blog" list on the
  project cards are generated from the file at build time.

## 6. Ship

```sh
yarn lint && yarn typecheck && yarn build
git add content/blog/<slug>.mdx public/llms.txt
git commit -m "content(blog): <title>"
```

Open a pull request; CI runs the same three commands. Merging to `main` deploys the post.

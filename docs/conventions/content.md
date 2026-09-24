# Content Conventions

Rules for the portfolio content: `public/assets/data/*.json`, `public/assets/img/`, `content/blog/*.mdx`
and `public/llms.txt`. Auto-loaded by `.claude/rules/content-conventions.md`. Structural checks
(valid JSON, required fields, logo files exist, image hosts allowed, tech tiers) run in the
`convention-spot-check` Stop hook; this doc is the spec behind them.

## Where content lives

| File | Rendered by | Section |
| :--- | :--- | :--- |
| `experiences.json` | `Timeline` | Experiences |
| `hackathons.json` | `Timeline` | Hackathons |
| `formation.json` | `Timeline` | Education |
| `projects.json` | `Projects` | Projects |
| `tech.json` | `Skills` | Skills |

All five are imported directly by `app/page.tsx`. Blog posts live in `content/blog/<slug>.mdx` and are
read by `lib/posts.ts` (see [Blog posts](#blog-posts)). The About-Me block and the SEO constants are
the only copy that lives in code (see [general.md](general.md)).

## Shapes

### Timeline files (`experiences`, `hackathons`, `formation`)

```json
{
  "logo": "acolad.png",
  "title": "AI Engineer at <a class=\"font-bold text-primary hover:text-primary-content\" href=\"https://www.acolad.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Acolad</a>",
  "period": "Sep 2024 - Present",
  "description": "One or two paragraphs. <strong>Inline emphasis</strong> and links allowed."
}
```

- `logo`: file name only, resolved to `public/assets/img/<logo>`. The file must exist.
- `title` / `description`: **HTML strings**, rendered with `dangerouslySetInnerHTML`. Allowed tags: `a`, `strong`, `em`, `br`. Nothing else (no `script`, `img`, `iframe`, `style`, inline event handlers). Links use the house classes `font-bold text-primary hover:text-primary-content`, `target="_blank"`, and `rel="noopener noreferrer"`.
- `period`: free text, `Mon YYYY - Mon YYYY` or `Mon YYYY - Present`.
- **Order: newest first.** The array order is the render order.

### `projects.json`

```json
{
  "id": "ragdocs",
  "name": "RagDocs",
  "description": "Plain text, two to four sentences. What it is, what stack, what it demonstrates.",
  "url": "https://github.com/AlexisBalayre/RagDocs",
  "technologies": ["Next.js", "FastAPI", "LlamaIndex", "Milvus", "Ollama", "Docker"],
  "image": "https://opengraph.githubassets.com/1/AlexisBalayre/RagDocs"
}
```

- `id`: a stable, lowercase, hyphenated handle, unique across the file. Blog posts reference projects by it (`projects` frontmatter) and the card gets `id="project-<id>"` so `/#project-<id>` scrolls to it. Never rename an id once a post uses it.
- `description` is plain text (no HTML): `Projects.tsx` renders it as a text node.
- `image`: a local path under `/assets/img/` or a remote URL whose host is in `images.remotePatterns` (`next.config.js`). Rendered at 400×200; prefer 2:1 assets.
- `technologies`: short display names, capitalised as the project brands them.
- Order: most representative first. Keep the list curated (six to nine entries), not exhaustive.

### `tech.json`

```json
{ "name": "Programming Languages", "skills": [ { "name": "TypeScript", "tier": "Core" } ] }
```

- `tier` is exactly `Core`, `Working`, or `Familiar` (`Skills.tsx` maps them to badge styles and legend text). Category order and skill order within a category are the render order; list `Core` skills first.

## Blog posts

One file per post, `content/blog/<slug>.mdx`, compiled at build time by `lib/posts.ts` (see
[ADR 0001](../adr/0001-blog-posts-as-mdx-files-compiled-with-next-mdx-remote.md)). The step-by-step guide is
[../guides/writing-a-post.md](../guides/writing-a-post.md).

### Slug

The file name without `.mdx` is the URL segment: lowercase letters, digits and single hyphens
(`introducing-the-blog`). It is permanent: it is the canonical URL, the RSS `guid` and the JSON-LD `@id`.

### Frontmatter

```yaml
---
title: "Why this site has a blog now, and how a Pupitre session built it"
description: "One sentence, 120 to 160 characters, used by the listing, the meta description, the social card and the feed."
date: "2026-09-24"
tags: ["blog", "pupitre", "claude-code", "next.js"]
projects: ["pupitre", "claude-code-config"]
---
```

| Field | Type | Rule |
| :--- | :--- | :--- |
| `title` | string | Plain sentence, no trailing full stop; becomes the `<h1>`, the `<title>` (with the site suffix), `og:title` and the feed item title. |
| `description` | string | One sentence; the meta description, `og:description`, the card and the feed item. |
| `date` | `YYYY-MM-DD` | Publication day; posts list newest first. Doubles as `dateModified` until a post is revised. |
| `tags` | string[] | One or more lowercase, hyphenated topics (`claude-code`, `merge-gate`). Rendered as badges, `article:tag` and feed `<category>`. |
| `projects` | string[] | Zero or more `id`s from `projects.json`. The post links to those cards; each card lists the post. |

All five fields are required. `lib/posts.ts` validates them and throws with the file and field name, so a bad post
fails `yarn build` rather than rendering empty.

### Allowed MDX

The body is CommonMark plus the components mapped in `mdx-components.tsx` (the only styling layer for posts; it
uses daisyUI tokens). Allowed:

- Paragraphs, `**strong**`, `_emphasis_`, inline `code`, `---` rules.
- Headings from `##` down to `####`. Never `#`: the title is the page's only `<h1>`.
- Ordered and unordered lists, block quotes.
- Fenced code blocks, with a language tag for the reader's benefit (there is no syntax highlighter).
- Links: root-relative for the site (`/blog/<slug>`, `/#project-<id>`, `/blog/rss.xml`), absolute for the rest. External links get `target="_blank" rel="noopener noreferrer"` from the component.
- `<Image src="/assets/img/blog/<file>" alt="…" width="1200" height="675" />` (`next/image`); files live in `public/assets/img/blog/`. Attributes are quoted strings: the compiler strips JSX expressions in braces (`width={1200}`), so a braced size leaves `next/image` without dimensions.

Not allowed: Markdown image syntax (`![]()` compiles to `<img>`), raw HTML, tables, task lists, footnotes,
`import`/`export` statements and JavaScript expressions in braces (`{...}`). GitHub-flavoured extras need a remark plugin; add one deliberately (ADR) rather than
writing the syntax and hoping.

### Writing style

Same as the rest of the site (below): British English, no em-dash, no emoji, concrete over generic. Posts are first
person. Keep the opening paragraph self-contained: it is what the listing card and the feed reader see.

## Images and logos

- `public/assets/img/` holds timeline logos, the profile photo (`alexis.jpg`), local project images, and blog images under `blog/`. Logos render at 56×56 in a `next/image`; supply square PNG/SVG with transparent background, ideally 112×112 or larger.
- File names: lowercase, hyphenated or a single word (`acolad.png`, `cranfield.png`). Referenced by name from the JSON only; nothing imports them.
- Remove an image when you remove its last JSON reference (the `find-dead-code` skill lists orphans).

## Writing style

- **British English** (`specialising`, `organisation`), matching the About-Me copy and `llms.txt`.
- Third person in `llms.txt` and the JSON-LD; first person in the About-Me paragraph. Timeline descriptions are written as the CV voice ("Led…", "Built…") or short first person; match the neighbouring entries.
- No em-dash. No emoji in content.
- Concrete over generic: name the product, the model, the metric.

## Keep in sync

A content change rarely stops at one file. When you edit the JSON:

1. **`public/llms.txt`**: the hand-maintained summary for AI agents (profile, current role, selected projects, blog posts, skills, education, links). Mirror any new role, project, degree or post. The spot-check hook reminds you when data changed and `llms.txt` did not.
2. **`app/layout.tsx`**: `metadata.description`, `keywords`, and the `profile` constants (`jobTitle`, `description`, `knowsAbout`) when the role or specialisations change. Employers, degrees, awards, Core skills and projects in the JSON-LD are derived from the JSON by `lib/structuredData.ts`, so keep titles in the parseable shapes: `<role> at <organisation>` for experiences, `<school> - <degree>` for formation.
3. **About Me** in `app/page.tsx`: the `Role`, `Specialisations`, and bio paragraph when they drift from the newest experience entry.
4. **Resume**: the site links to `https://alexis-resume.balayre.com/`; update it separately if the change belongs on the CV.
5. **Blog posts**: a new post needs an `llms.txt` line and, if it is about a project without a card, the card first. The sitemap, feed, social image, JSON-LD and the "Read more on the blog" list on the cards are generated.

# Content Conventions

Rules for the portfolio content: `public/assets/data/<locale>/*.json`, `public/assets/img/`, `content/blog/*.mdx`
and `public/llms*.txt`. Auto-loaded by `.claude/rules/content-conventions.md`. Structural checks
(valid JSON, required fields, logo files exist, image hosts allowed, tech tiers) run in the
`convention-spot-check` Stop hook; this doc is the spec behind them.

## Where content lives

The site is bilingual: English (`en`, the default, unprefixed URLs) and French (`fr`, under `/fr`). Every piece of
copy exists once per locale, in a folder named after it ([ADR 0002](../adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md)):

| File (`public/assets/data/<locale>/`) | Rendered by | What |
| :--- | :--- | :--- |
| `experiences.json` | `Timeline` | Experiences section |
| `hackathons.json` | `Timeline` | Hackathons section |
| `formation.json` | `Timeline` | Education section |
| `projects.json` | `Projects` | Projects section, project cards |
| `tech.json` | `Skills` | Skills section |
| `about.json` | `AboutMe`, `page.tsx` | The intro line under the `<h1>`, the About Me facts and bio |
| `ui.json` | everything | The **dictionary**: menu labels, section titles, button and aria labels, SEO titles and descriptions, blog and social-card strings |

`lib/portfolio.ts` loads the six content files per locale (`getPortfolio(locale)`) and `lib/i18n.ts` the dictionary
(`getDictionary(locale)`). Blog posts live in `content/blog/<slug>.mdx`, with an optional `<slug>.fr.mdx` beside
them, and are read by `lib/posts.ts` (see [Blog posts](#blog-posts)). No copy lives in code: a component that needs
a sentence reads it from the dictionary (see [general.md](general.md)).

### Both languages, entry for entry

The English folder is the source; the French folder mirrors it:

- **Same entries, same order.** `lib/portfolio.ts` compares the two folders at import time on a locale-independent key
  (`logo` for timeline files, `id` for projects, the skill names for `tech.json`, the number of facts for `about.json`)
  and throws when the French file lacks an entry, has one too many, or has them in another order, so `yarn build`
  fails with the file and index. Add an entry to both files in the same change.
- **Same keys in `ui.json`.** The dictionary type is `typeof en`; a key missing from `fr/ui.json` fails `yarn typecheck`.
- **Locale-independent fields stay identical**: `logo`, `id`, `url`, `image`, `technologies`, skill names and tiers.
  Translate `title`, `description`, `name`, `period`, category names and every dictionary string.
- Strings with a `{placeholder}` (`"Posts about {name}"`) keep the same placeholder names in both files; `fill()` in
  `lib/i18n.ts` substitutes them.

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
- `period`: free text, `Mon YYYY - Mon YYYY` or `Mon YYYY - Present` (`Sept. 2025 - Aujourd'hui` in French).
- **Order: newest first.** The array order is the render order.
- The English title of an experience reads `<role> at <organisation>` and of a degree `<school> - <degree>`:
  `lib/structuredData.ts` parses the **English** file for the JSON-LD employers, degrees and awards, whatever the
  locale rendered. The French title uses the natural preposition (`chez`, `à`, `de`); `Timeline.tsx` derives the logo
  alt from the separators listed under `timeline.organisationSeparators` in the dictionary.

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

- `id`: a stable, lowercase, hyphenated handle, unique across the file and identical in both locales. Blog posts reference projects by it (`projects` frontmatter) and the card gets `id="project-<id>"` so `/#project-<id>` (and `/fr#project-<id>`) scrolls to it. Never rename an id once a post uses it.
- `description` is plain text (no HTML): `Projects.tsx` renders it as a text node.
- `image`: a local path under `/assets/img/` or a remote URL whose host is in `images.remotePatterns` (`next.config.js`). Rendered at 400×200; prefer 2:1 assets.
- `technologies`: short display names, capitalised as the project brands them.
- Order: most representative first. Keep the list curated (six to nine entries), not exhaustive.

### `tech.json`

```json
{ "name": "Programming Languages", "skills": [ { "name": "TypeScript", "tier": "Core" } ] }
```

- `tier` is exactly `Core`, `Working`, or `Familiar` in both locales: they are keys, and `Skills.tsx` maps them to badge styles and to the `skills.<tier>` label and description of the dictionary. Category order and skill order within a category are the render order; list `Core` skills first. Only the category `name` is translated.

### `about.json`

```json
{
  "intro": "One or two sentences under the <h1> on the home page.",
  "facts": [{ "label": "Name:", "value": "Alexis Balayre" }],
  "bio": "The About Me paragraph, first person, plain text."
}
```

- `facts` render as `<strong>label</strong> value`, in order; the punctuation belongs to the label (`"Name:"`,
  `"Nom :"`) so each locale keeps its typography.
- Plain text, no HTML.

### `ui.json` (the dictionary)

Nested objects of strings (and a few string arrays), grouped by where they are used: `site` (title, descriptions,
keywords), `profile` (JSON-LD Person copy), `og` (social cards), `header`, `nav`, `home`, `timeline`, `projects`,
`skills`, `blog`, `footer`. The English file defines the shape. Add a key to `en/ui.json` first, then to `fr/ui.json`,
then read it with `getDictionary(locale).<group>.<key>`; never build a sentence in a component from fragments.

## Blog posts

One file per post, `content/blog/<slug>.mdx`, compiled at build time by `lib/posts.ts` (see
[ADR 0001](../adr/0001-blog-posts-as-mdx-files-compiled-with-next-mdx-remote.md)). The step-by-step guide is
[../guides/writing-a-post.md](../guides/writing-a-post.md).

### Slug

The file name without `.mdx` is the URL segment: lowercase letters, digits and single hyphens
(`introducing-the-blog`). It is permanent: it is the canonical URL, the RSS `guid` and the JSON-LD `@id`, and it is
the same in every locale (`/blog/<slug>`, `/fr/blog/<slug>`).

### French version (optional)

`content/blog/<slug>.fr.mdx` next to the English file is the French version: the same five frontmatter fields, nothing
more. `title` and `description` are translated; `date`, `tags` and `projects` must equal the English values (the
build fails otherwise, as it does for a `.fr.mdx` with no `.mdx`). Without a French file the French route still
exists: `/fr/blog/<slug>` renders the English body with a "not yet translated, read it in English" notice, keeps the
English canonical URL, omits the `fr` hreflang and is left out of the sitemap. The French listing and feed show the
same notice, so a post is never hidden from French readers.

### Frontmatter

```yaml
---
title: "Why this site has a blog now, and how a Pupitre session built it"
description: "One sentence, 120 to 160 characters, used by the listing, the meta description, the social card and the feed."
date: "2026-09-24"
tags: ["blog", "pupitre", "claude-code", "nextjs"]
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
person. Keep the opening paragraph self-contained: it is what the listing card and the feed reader see. The French
version follows the [French writing style](#writing-style-1) below.

## Images and logos

- `public/assets/img/` holds timeline logos, the profile photo (`alexis.jpg`), local project images, and blog images under `blog/`. Logos render at 56×56 in a `next/image`; supply square PNG/SVG with transparent background, ideally 112×112 or larger.
- File names: lowercase, hyphenated or a single word (`acolad.png`, `cranfield.png`). Referenced by name from the JSON only; nothing imports them.
- Remove an image when you remove its last JSON reference (the `find-dead-code` skill lists orphans).

## Writing style

- **British English** (`specialising`, `organisation`), matching the About-Me copy and `llms.txt`.
- Third person in `llms.txt` and the JSON-LD; first person in the About-Me paragraph. Timeline descriptions are written as the CV voice ("Led…", "Built…") or short first person; match the neighbouring entries.
- No em-dash. No emoji in content.
- Concrete over generic: name the product, the model, the metric.

**French** (`fr/` files, `.fr.mdx`, `llms.fr.txt`): a translation of the English text, not a rewrite, in the same
voice (first person where the English is, third person in `llms.fr.txt` and the JSON-LD). Neutral register, French
typography (« guillemets », accents on capitals: `Étudiant`, `À propos`; a space before `:` `;` `!` `?` is
allowed, not required), the same links as the English text. Product names, technology names, degree titles in
their official language, file paths and quoted commands stay untranslated (`Claude Code`, `merge gate` when it is the
product's term, `npx agentspine`).

## Keep in sync

A content change rarely stops at one file. When you edit the JSON:

1. **The other locale**: every change to `en/<file>.json` has its twin in `fr/<file>.json` (the build enforces the entries, not the translation).
2. **`public/llms.txt` and `public/llms.fr.txt`**: the hand-maintained summaries for AI agents (profile, current role, selected projects, blog posts, skills, education, links). Mirror any new role, project, degree or post in both. The spot-check hook reminds you when data changed and `llms.txt` did not.
3. **`site` and `profile` in `ui.json`**: the SEO description, `keywords`, `jobTitle`, `description` and `knowsAbout` when the role or specialisations change, in both locales. Employers, degrees, awards, Core skills and projects in the JSON-LD are derived from the **English** JSON by `lib/structuredData.ts`, so keep the English titles in the parseable shapes: `<role> at <organisation>` for experiences, `<school> - <degree>` for formation.
4. **`about.json`**: the `Role`, `Specialisations`, intro and bio when they drift from the newest experience entry, in both locales.
5. **Resume**: the site links to `https://alexis-resume.balayre.com/`; update it separately if the change belongs on the CV.
6. **Blog posts**: a new post needs an `llms.txt` line (and an `llms.fr.txt` one) and, if it is about a project without a card, the card first. The sitemap, feeds, social images, JSON-LD, hreflang alternates and the "Read more on the blog" list on the cards are generated.

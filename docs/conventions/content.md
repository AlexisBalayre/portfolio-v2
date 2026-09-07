# Content Conventions

Rules for the portfolio content: `public/assets/data/*.json`, `public/assets/img/`, and
`public/llms.txt`. Auto-loaded by `.claude/rules/content-conventions.md`. Structural checks
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

All five are imported directly by `app/page.tsx`. The About-Me block and the SEO constants are
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
  "name": "RagDocs",
  "description": "Plain text, two to four sentences. What it is, what stack, what it demonstrates.",
  "url": "https://github.com/AlexisBalayre/RagDocs",
  "technologies": ["Next.js", "FastAPI", "LlamaIndex", "Milvus", "Ollama", "Docker"],
  "image": "https://opengraph.githubassets.com/1/AlexisBalayre/RagDocs"
}
```

- `description` is plain text (no HTML): `Projects.tsx` renders it as a text node.
- `image`: a local path under `/assets/img/` or a remote URL whose host is in `images.remotePatterns` (`next.config.js`). Rendered at 400×200; prefer 2:1 assets.
- `technologies`: short display names, capitalised as the project brands them.
- Order: most representative first. Keep the list curated (six to nine entries), not exhaustive.

### `tech.json`

```json
{ "name": "Programming Languages", "skills": [ { "name": "TypeScript", "tier": "Core" } ] }
```

- `tier` is exactly `Core`, `Working`, or `Familiar` (`Skills.tsx` maps them to badge styles and legend text). Category order and skill order within a category are the render order; list `Core` skills first.

## Images and logos

- `public/assets/img/` holds timeline logos, the profile photo (`alexis.jpg`), and any local project image. Logos render at 56×56 in a `next/image`; supply square PNG/SVG with transparent background, ideally 112×112 or larger.
- File names: lowercase, hyphenated or a single word (`acolad.png`, `cranfield.png`). Referenced by name from the JSON only; nothing imports them.
- Remove an image when you remove its last JSON reference (the `find-dead-code` skill lists orphans).

## Writing style

- **British English** (`specialising`, `organisation`), matching the About-Me copy and `llms.txt`.
- Third person in `llms.txt` and the JSON-LD; first person in the About-Me paragraph. Timeline descriptions are written as the CV voice ("Led…", "Built…") or short first person; match the neighbouring entries.
- No em-dash. No emoji in content.
- Concrete over generic: name the product, the model, the metric.

## Keep in sync

A content change rarely stops at one file. When you edit the JSON:

1. **`public/llms.txt`**: the hand-maintained summary for AI agents (profile, current role, selected projects, skills, education, links). Mirror any new role, project, or degree. The spot-check hook reminds you when data changed and `llms.txt` did not.
2. **`app/layout.tsx`**: `metadata.description`, `keywords`, and the Person JSON-LD (`jobTitle`, `worksFor`, `alumniOf`, `knowsAbout`) when the role, employer, or specialisations change.
3. **About Me** in `app/page.tsx`: the `Role`, `Specialisations`, and bio paragraph when they drift from the newest experience entry.
4. **Resume**: the site links to `https://alexis-resume.balayre.com/`; update it separately if the change belongs on the CV.

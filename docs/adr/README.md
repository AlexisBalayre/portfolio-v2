# Architecture Decision Records

One file per decision, `NNNN-short-title.md`, following the format in
`.claude/skills/domain-modeling/ADR-FORMAT.md`. The `domain-modeling` and `grill-with-docs`
skills append here when a design decision crystallises.

| ADR | Status | Title |
| :-- | :----- | :---- |
| [0001](0001-blog-posts-as-mdx-files-compiled-with-next-mdx-remote.md) | accepted | Blog posts are MDX files in the repo, compiled at build time with next-mdx-remote |
| [0002](0002-bilingual-routes-under-a-locale-segment-with-rewrites.md) | accepted | Bilingual routes live under one `app/[locale]/` tree, English served unprefixed through rewrites |

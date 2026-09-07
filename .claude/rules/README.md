# Rule catalog

Path-scoped convention rules. Each auto-loads when you open or edit a file matching its `paths:`
frontmatter; you never invoke them. A rule is a thin trigger that imports the full convention
doc (the "split pattern"), so always-on context stays small while full detail loads on demand.

| Rule | Auto-loads for | Enforces (full doc) |
| :--- | :------------- | :------------------ |
| `universal-conventions` | every `**/*.ts`, `**/*.tsx` | Naming, `~~/` imports, exports, client/server split, content-stays-in-JSON, comment discipline → `general.md` |
| `frontend-conventions` | `app/**`, `components/**`, `hooks/**`, `styles/**` | Next.js App Router, Tailwind v4 + daisyUI tokens, `next/image`, external links, sections + header menu, SEO in `layout.tsx` → `frontend.md` |
| `content-conventions` | `public/assets/data/**`, `public/assets/img/**`, `public/llms.txt` | JSON shapes per file, allowed HTML in strings, logo/image requirements, `llms.txt` + metadata sync → `content.md` |

**How to use:** just edit files in a matching path; the rule and its `docs/conventions/*.md`
import load automatically. To add a rule, see [`.claude/README.md`](../README.md) ("New rule").

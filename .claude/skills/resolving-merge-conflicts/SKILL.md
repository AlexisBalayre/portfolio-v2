---
name: resolving-merge-conflicts
description: Resolve an in-progress git merge or rebase conflict. Use when a merge, rebase, or cherry-pick stops on conflicts.
---

1. **See the current state** of the merge/rebase. Check `git status`, the git history of both sides, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs (`gh pr view`), check the original issues (PR bodies carry `Closes #NN`; read them with `gh issue view`).

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

   - **Content JSON** (`public/assets/data/*.json`): both sides usually add entries. Keep both, preserve the ordering rule (timelines newest first), and re-validate the file with `jq empty`. Then reconcile `public/llms.txt` by hand so it reflects the merged content.

4. **Regenerate, don't hand-merge.** Conflict markers in generated files are never resolved by hand:
   - `yarn.lock`: merge `package.json` first, take either side of the lockfile wholesale, then re-run `yarn install` to regenerate it.
   - `public/sitemap*.xml`, `public/robots.txt`: take either side, then re-run `yarn build` (the `postbuild` step regenerates them from `next-sitemap.config.js`). The other generated paths in `GENERATED_PATHS_REGEX` (`.claude/project.env`), `next-env.d.ts` and `tsconfig.tsbuildinfo`, are rewritten by the next build or typecheck: take either side.

5. **Run the automated checks** and fix anything the merge broke. Formatting, lint, and typechecking run automatically via the Stop hook; run `yarn build` when the conflict touched `app/`, `lib/`, `next.config.js`, or `styles/` (the site has no test suite). The pre-commit hook (`scripts/pre-commit`) runs lint and typecheck; failures that already exist on the base branch are not the merge's fault, and `--no-verify` is acceptable only for those.

6. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process (`git rebase --continue`) until all commits are rebased.

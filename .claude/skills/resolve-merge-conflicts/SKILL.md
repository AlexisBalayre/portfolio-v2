---
name: resolve-merge-conflicts
description: Resolve an in-progress git merge or rebase conflict. Use when a merge, rebase, or cherry-pick stops on conflicts.
---

# Resolve Merge Conflicts

1. **See the current state** of the merge/rebase: `git status`, the history of both sides, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made and what the original intent was. Read the commit messages and the PRs (`gh pr view`); PR bodies carry `Closes #NN`, so read the issue (`gh issue view`) when the intent is still unclear.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

   - **Content JSON** (`public/assets/data/*.json`): both sides usually add entries. Keep both, preserve the ordering rule (timelines newest first), and re-validate the file with `jq empty`. Then reconcile `public/llms.txt` by hand so it reflects the merged content.

4. **Regenerate, don't hand-merge.** Conflict markers in generated files are never resolved by hand:
   - `yarn.lock`: take either side wholesale, then re-run `yarn install` to regenerate.
   - `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt`: take either side, then re-run `yarn build` (the `postbuild` step regenerates them from `next-sitemap.config.js`).

5. **Verify.** Formatting, linting, and typechecking run automatically via the Stop hook; run `yarn build` when the conflict touched `app/`, `next.config.js`, or `styles/`. Failures that already exist on the base branch are not the merge's fault.

6. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue (`git rebase --continue`) until all commits are rebased.

#!/usr/bin/env bash
# Stop hook: Prettier + ESLint auto-fix on the session's dirty .ts/.tsx files, then a
# whole-repo typecheck. Blocks (exit 2) on any remaining failure. No-ops when no TS changed.
# Calls node_modules/.bin directly so it works without a global yarn on the active Node.
set -o pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" || exit 1

# The project requires Node >=20 (.nvmrc). Switch via nvm when the shell default is older.
if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" >/dev/null 2>&1
  nvm use >/dev/null 2>&1 || true
fi

BIN=node_modules/.bin

# Includes untracked files (Write-created files are not staged yet).
DIRTY_TS=$(
  {
    git diff --name-only 2>/dev/null
    git diff --cached --name-only 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | grep -E '\.(ts|tsx)$' | sort -u | while read -r f; do [ -f "$f" ] && echo "$f"; done
)

[ -z "$DIRTY_TS" ] && exit 0

if [ ! -x "$BIN/next" ] || [ ! -x "$BIN/tsc" ] || [ ! -x "$BIN/prettier" ]; then
  echo "Quality checks skipped: node_modules is missing. Run 'yarn install' (Node >=20) and re-run." >&2
  exit 2
fi

FILE_ARGS=()
while IFS= read -r f; do FILE_ARGS+=(--file "$f"); done <<< "$DIRTY_TS"

# next lint prints a deprecation banner on every run; strip it from the output we forward.
lint() {
  "$BIN/next" lint --max-warnings=0 "$@" 2>&1 \
    | grep -vE '^(`next lint` is deprecated|For new projects|For existing projects|npx @next/codemod|[[:space:]]*$)' >&2
  return "${PIPESTATUS[0]}"
}

echo "Running quality checks..." >&2

echo "-> Prettier + ESLint auto-fix on dirty files..." >&2
echo "$DIRTY_TS" | xargs "$BIN/prettier" --log-level error --write 1>&2
lint --fix "${FILE_ARGS[@]}" || true

echo "-> Verifying format..." >&2
if ! echo "$DIRTY_TS" | xargs "$BIN/prettier" --log-level error --check 1>&2; then
  echo "Prettier check failed on the files this session touched. Run 'yarn format' and fix what remains." >&2
  exit 2
fi

echo "-> Verifying lint..." >&2
if ! lint "${FILE_ARGS[@]}"; then
  echo "ESLint failed on the files this session touched. Fix the issues above." >&2
  exit 2
fi

echo "-> Typecheck (whole repo)..." >&2
if ! "$BIN/tsc" --noEmit 1>&2; then
  echo "Typecheck failed. Fix the type errors above." >&2
  exit 2
fi

echo "All quality checks passed!" >&2
exit 0

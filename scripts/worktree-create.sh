#!/bin/bash
# Create an isolated worktree for a feature, on its own branch, with deps installed.
#   yarn worktree:create <name>   ->  .worktrees/<name> on branch <prefix>/<name>
# Branch prefix is configurable via WORKTREE_BRANCH_PREFIX in .env (default: feature).
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

# Node >=20 (.nvmrc). Switch via nvm when the shell default is older; fall back to corepack
# for yarn when the active Node has no global yarn (package.json pins yarn@1.22.22).
if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" >/dev/null 2>&1
  nvm use >/dev/null 2>&1 || true
fi
if command -v yarn >/dev/null 2>&1; then YARN="yarn"; else YARN="corepack yarn"; fi

# Load personalization (.env) if present.
[ -f .env ] && { set -a; . ./.env; set +a; }
PREFIX="${WORKTREE_BRANCH_PREFIX:-feature}"

NAME="${1:?Usage: yarn worktree:create <name>}"
WORKTREE_DIR=".worktrees/$NAME"
BRANCH="$PREFIX/$NAME"

if [ -d "$WORKTREE_DIR" ]; then
  echo "Error: Worktree '$WORKTREE_DIR' already exists." >&2
  exit 1
fi

mkdir -p .worktrees
git worktree add "$WORKTREE_DIR" -b "$BRANCH"

# Install dependencies in the new worktree (fresh worktrees start without node_modules)
(cd "$WORKTREE_DIR" && $YARN install --frozen-lockfile)

echo ""
echo "Worktree created:"
echo "  Directory: $WORKTREE_DIR"
echo "  Branch:    $BRANCH"
echo ""
echo "cd $WORKTREE_DIR"

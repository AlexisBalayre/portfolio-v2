#!/usr/bin/env bash
# Create an isolated worktree for a feature, on its own branch, with deps installed.
#   yarn worktree:create <name>   ->  .worktrees/<name> on branch <prefix>/<name>
# Branch prefix and install command come from .claude/project.env.
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
command -v yarn >/dev/null 2>&1 || yarn() { corepack yarn "$@"; }
export -f yarn 2>/dev/null || true

[ -f .claude/project.env ] && . .claude/project.env
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

# Fresh worktrees start without installed dependencies.
if [ -n "${INSTALL_CMD:-}" ]; then
  (cd "$WORKTREE_DIR" && bash -c "$INSTALL_CMD")
fi

# Worktree-local CodeGraph index: without one, codegraph answers from the main
# tree's index, missing symbols changed on this branch. Only when the main
# checkout opted in, and non-fatal so an indexer hiccup never blocks creation.
# Same env as .mcp.json: --yes skips the consent prompt, and telemetry defaults on.
if [ -d .codegraph ]; then
  (cd "$WORKTREE_DIR" && DO_NOT_TRACK=1 CODEGRAPH_TELEMETRY=0 CODEGRAPH_NO_UPDATE_CHECK=1 CODEGRAPH_NO_DOWNLOAD=1 \
    npx -y @colbymchenry/codegraph@1.6.0 init --yes) ||
    echo "Warning: codegraph init failed; run it manually in $WORKTREE_DIR" >&2
fi

echo ""
echo "Worktree created:"
echo "  Directory: $WORKTREE_DIR"
echo "  Branch:    $BRANCH"
echo ""
echo "cd $WORKTREE_DIR"

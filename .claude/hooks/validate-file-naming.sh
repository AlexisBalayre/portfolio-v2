#!/usr/bin/env bash
# PreToolUse(Write) hook: blocks new .ts/.tsx files that break this repo's naming conventions.
# Exit 0 = allow, Exit 2 = block with message. Full rules: docs/conventions/frontend.md.
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE_PATH" ] && exit 0
[[ "$FILE_PATH" =~ \.(ts|tsx)$ ]] || exit 0

# Hooks are per-session, keyed on the directory the session started in, so a session launched here
# and working in a sibling repo would otherwise hold that repo to this convention. Only paths under
# this checkout are ours.
[ -z "${CLAUDE_PROJECT_DIR:-}" ] && exit 0
[[ "$FILE_PATH" != "$CLAUDE_PROJECT_DIR"/* ]] && exit 0

# Overwriting an existing file doesn't choose a name, so legacy names stay writable.
[ -e "$FILE_PATH" ] && exit 0

REL="${FILE_PATH#"$CLAUDE_PROJECT_DIR"/}"
FILENAME=$(basename "$REL")

block() {
  echo "BLOCKED: '$REL' does not follow the file naming convention." >&2
  echo "  $1" >&2
  echo "  See docs/conventions/frontend.md (File naming)." >&2
  exit 2
}

case "$REL" in
  app/*)
    # Next.js App Router: only the framework's reserved file names live under app/.
    RESERVED='page|layout|loading|error|global-error|not-found|template|default|route|sitemap|robots|manifest|opengraph-image|twitter-image|icon|apple-icon'
    [[ "$FILENAME" =~ ^($RESERVED)\.(ts|tsx)$ ]] && exit 0
    block "Files under app/ must be Next.js reserved names (page.tsx, layout.tsx, route.ts, ...). Put shared UI in components/ and logic in hooks/ or lib/." ;;
  components/*|public/assets/logos/*)
    [[ "$FILENAME" =~ ^[A-Z][A-Za-z0-9]*\.tsx$ ]] && exit 0
    block "React components are PascalCase .tsx files (e.g. Header.tsx, ProjectCard.tsx)." ;;
  hooks/*)
    [[ "$FILENAME" == "index.ts" || "$FILENAME" =~ ^use[A-Z][A-Za-z0-9]*\.tsx?$ ]] && exit 0
    block "Hooks are camelCase files prefixed with 'use' (e.g. useOutsideClick.ts), re-exported from hooks/index.ts." ;;
  lib/*)
    [[ "$FILENAME" =~ ^[a-z][a-zA-Z0-9]*\.ts$ ]] && exit 0
    block "Utilities under lib/ are camelCase .ts files (e.g. formatDate.ts)." ;;
esac

exit 0

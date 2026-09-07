#!/usr/bin/env bash
# Stop hook: lightweight structural convention spot-check on changed files.
# Advisory only (exit 0). Comment-quality findings are owned by comment-pruner.sh.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || exit 0

ALL_FILES=$(
  {
    git diff --name-only HEAD 2>/dev/null
    git diff --cached --name-only 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)
[ -z "$ALL_FILES" ] && exit 0

WARNINGS=""
DATA_CHANGED=false
LLMS_CHANGED=false

while IFS= read -r file; do
  [ -f "$file" ] || continue

  case "$file" in
    public/llms.txt) LLMS_CHANGED=true ;;

    public/assets/data/*.json)
      DATA_CHANGED=true
      if ! jq empty "$file" 2>/dev/null; then
        WARNINGS+="  ⚠ $file: invalid JSON\n"
        continue
      fi
      case "$file" in
        public/assets/data/experiences.json|public/assets/data/hackathons.json|public/assets/data/formation.json)
          MISSING=$(jq -r 'to_entries[] | select((.value | has("logo") and has("title") and has("period") and has("description")) | not) | .key' "$file")
          [ -n "$MISSING" ] && WARNINGS+="  ⚠ $file: item(s) $(echo "$MISSING" | tr '\n' ' ')missing logo/title/period/description\n"
          while IFS= read -r logo; do
            [ -n "$logo" ] && [ ! -f "public/assets/img/$logo" ] && WARNINGS+="  ⚠ $file: logo '$logo' not found in public/assets/img/\n"
          done < <(jq -r '.[].logo // empty' "$file")
          ;;
        public/assets/data/projects.json)
          MISSING=$(jq -r 'to_entries[] | select((.value | has("name") and has("description") and has("url") and has("technologies") and has("image")) | not) | .key' "$file")
          [ -n "$MISSING" ] && WARNINGS+="  ⚠ $file: item(s) $(echo "$MISSING" | tr '\n' ' ')missing name/description/url/technologies/image\n"
          while IFS= read -r host; do
            [ -n "$host" ] && ! grep -q "hostname: \"$host\"" next.config.js && WARNINGS+="  ⚠ $file: remote image host '$host' is not in images.remotePatterns (next.config.js)\n"
          done < <(jq -r '.[].image | select(startswith("http")) | sub("^https?://"; "") | split("/")[0]' "$file" | sort -u)
          ;;
        public/assets/data/tech.json)
          BAD=$(jq -r '.[].skills[] | select(.tier | IN("Core","Working","Familiar") | not) | .name' "$file")
          [ -n "$BAD" ] && WARNINGS+="  ⚠ $file: tier must be Core|Working|Familiar for: $(echo "$BAD" | tr '\n' ' ')\n"
          ;;
      esac
      ;;

    *.tsx)
      if grep -qE '<img[[:space:]>]' "$file"; then
        WARNINGS+="  ⚠ $file: uses <img>; use next/image (docs/conventions/frontend.md)\n"
      fi
      if grep -q 'dangerouslySetInnerHTML' "$file" && [ "$file" != "components/Timeline.tsx" ] && [ "$file" != "app/layout.tsx" ]; then
        WARNINGS+="  ⚠ $file: new dangerouslySetInnerHTML usage; keep raw HTML rendering confined to Timeline.tsx and the layout.tsx JSON-LD\n"
      fi
      BLANK=$(grep -c 'target="_blank"' "$file" 2>/dev/null || true)
      RELS=$(grep -cE 'rel="[^"]*(noopener|noreferrer)' "$file" 2>/dev/null || true)
      if [ "${BLANK:-0}" -gt "${RELS:-0}" ]; then
        WARNINGS+="  ⚠ $file: target=\"_blank\" link(s) without rel=\"noopener noreferrer\"\n"
      fi
      if grep -qE 'console\.(log|debug)\(' "$file"; then
        WARNINGS+="  ⚠ $file: leftover console.log/debug\n"
      fi
      if [[ "$file" == components/* ]] && grep -qE 'https://alexis\.balayre\.com' "$file"; then
        WARNINGS+="  ⚠ $file: hardcoded site URL; the canonical siteUrl lives in app/layout.tsx\n"
      fi
      ;;
  esac
done <<< "$ALL_FILES"

if [ "$DATA_CHANGED" = true ] && [ "$LLMS_CHANGED" = false ]; then
  WARNINGS+="  ⚠ public/assets/data/*.json changed but public/llms.txt did not; keep the AI-agent summary in sync (docs/conventions/content.md)\n"
fi

if [ -n "$WARNINGS" ]; then
  echo "" >&2
  echo "Convention spot-check warnings:" >&2
  echo -e "$WARNINGS" >&2
  echo "These are advisory; fix before committing if possible." >&2
fi

exit 0

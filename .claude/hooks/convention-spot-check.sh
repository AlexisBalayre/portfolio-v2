#!/usr/bin/env bash
# Stop hook: structural convention spot-check on the files this session changed,
# driven by the checks in .claude/spot-checks.tsv plus the content-JSON checks below.
# Findings reach the model once per Stop cycle (exit 2); on the stop_hook_active
# re-run the hook is silent so a heuristic the model judged a false positive cannot
# loop. Exit-0 output never reaches the model, so "advisory" here means "shown once,
# then dropped". Comment quality is comment-pruner.sh's.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || exit 0

CHECKS=.claude/spot-checks.tsv

if [ ! -t 0 ]; then
  INPUT=$(cat 2>/dev/null || true)
  printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0
fi

# Untracked files included: a freshly written file is where a violation most often lands.
ALL_FILES=$(
  {
    git diff --name-only HEAD 2>/dev/null
    git diff --cached --name-only 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)
[ -z "$ALL_FILES" ] && exit 0

WARNINGS=""

if [ -f "$CHECKS" ]; then
  while IFS= read -r file; do
    [ -f "$file" ] || continue
    while IFS=$'\t' read -r path_re content_re message; do
      case "$path_re" in ''|'#'*) continue ;; esac
      [[ "$file" =~ $path_re ]] || continue
      if grep -qE -- "$content_re" "$file" 2>/dev/null; then
        WARNINGS+="  $file: $message\n"
      fi
    done < "$CHECKS"
  done <<< "$ALL_FILES"
fi

# --- Project-specific checks (need jq or cross-file logic) --------------------

DATA_CHANGED=false
LLMS_CHANGED=false

while IFS= read -r file; do
  [ -f "$file" ] || continue

  case "$file" in
    public/llms.txt|public/llms.fr.txt) LLMS_CHANGED=true ;;

    public/assets/data/*/*.json)
      DATA_CHANGED=true
      if ! jq empty "$file" 2>/dev/null; then
        WARNINGS+="  $file: invalid JSON\n"
        continue
      fi
      case "${file##*/}" in
        experiences.json|hackathons.json|formation.json)
          MISSING=$(jq -r 'to_entries[] | select((.value | has("logo") and has("title") and has("period") and has("description")) | not) | .key' "$file")
          [ -n "$MISSING" ] && WARNINGS+="  $file: item(s) $(echo "$MISSING" | tr '\n' ' ')missing logo/title/period/description (content.md §Shapes)\n"
          while IFS= read -r logo; do
            [ -n "$logo" ] && [ ! -f "public/assets/img/$logo" ] && WARNINGS+="  $file: logo '$logo' not found in public/assets/img/ (content.md §Images and logos)\n"
          done < <(jq -r '.[].logo // empty' "$file")
          ;;
        projects.json)
          MISSING=$(jq -r 'to_entries[] | select((.value | has("name") and has("description") and has("url") and has("technologies") and has("image")) | not) | .key' "$file")
          [ -n "$MISSING" ] && WARNINGS+="  $file: item(s) $(echo "$MISSING" | tr '\n' ' ')missing name/description/url/technologies/image (content.md §Shapes)\n"
          while IFS= read -r host; do
            [ -n "$host" ] && ! grep -q "hostname: \"$host\"" next.config.js && WARNINGS+="  $file: remote image host '$host' is not in images.remotePatterns in next.config.js (content.md §Images and logos)\n"
          done < <(jq -r '.[].image | select(startswith("http")) | sub("^https?://"; "") | split("/")[0]' "$file" | sort -u)
          ;;
        tech.json)
          BAD=$(jq -r '.[].skills[] | select(.tier | IN("Core","Working","Familiar") | not) | .name' "$file")
          [ -n "$BAD" ] && WARNINGS+="  $file: tier must be Core|Working|Familiar for: $(echo "$BAD" | tr '\n' ' ')(content.md §Shapes)\n"
          ;;
      esac
      ;;

    *.tsx)
      case "$file" in
        components/Timeline.tsx|app/\[locale\]/layout.tsx|app/\[locale\]/blog/page.tsx|app/\[locale\]/blog/\[slug\]/page.tsx) ;;
        *)
          if grep -q 'dangerouslySetInnerHTML' "$file"; then
            WARNINGS+="  $file: new dangerouslySetInnerHTML usage; keep raw HTML rendering confined to Timeline.tsx and the JSON-LD in the layout and blog pages (content.md §Shapes)\n"
          fi
          ;;
      esac
      BLANK=$(grep -c 'target="_blank"' "$file" 2>/dev/null || true)
      RELS=$(grep -cE 'rel="[^"]*(noopener|noreferrer)' "$file" 2>/dev/null || true)
      if [ "${BLANK:-0}" -gt "${RELS:-0}" ]; then
        WARNINGS+="  $file: target=\"_blank\" link(s) without rel=\"noopener noreferrer\" (frontend.md §Links)\n"
      fi
      ;;
  esac
done <<< "$ALL_FILES"

if [ "$DATA_CHANGED" = true ] && [ "$LLMS_CHANGED" = false ]; then
  WARNINGS+="  public/assets/data/<locale>/*.json changed but neither public/llms.txt nor public/llms.fr.txt did; keep the AI-agent summaries in sync (content.md §Keep in sync)\n"
fi

[ -z "$WARNINGS" ] && exit 0

{
  echo
  echo "Convention spot-check on files changed this session:"
  echo -e "$WARNINGS"
  echo "Fix each real finding; if one is a heuristic misfire, say so and stop again (this check stays silent on the re-run)."
} >&2
exit 2

#!/usr/bin/env bash
set -euo pipefail

# Enforces the implementer boundary: branches named agent/* may only change
# files under apps/game/. This gate must stay mandatory in CI.
#
# Usage: check-agent-paths.sh [base-ref] [branch-name]

base_ref="${1:-origin/main}"
branch="${2:-$(git rev-parse --abbrev-ref HEAD)}"

if [[ "$branch" != agent/* ]]; then
  echo "Branch '$branch' is not an agent branch; path gate not applicable."
  exit 0
fi

mapfile -t changed < <(git diff --name-only "$base_ref"...HEAD)

violations=()
for file in "${changed[@]}"; do
  [[ -z "$file" ]] && continue
  if [[ "$file" != apps/game/* ]]; then
    violations+=("$file")
  fi
done

if ((${#violations[@]} > 0)); then
  echo "error: agent branch changes files outside apps/game/:" >&2
  printf '  %s\n' "${violations[@]}" >&2
  exit 1
fi

echo "Agent path gate passed (${#changed[@]} changed file(s) inside apps/game/)."

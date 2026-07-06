#!/usr/bin/env bash
set -euo pipefail

if ! command -v rg >/dev/null 2>&1; then
  echo "error: ripgrep (rg) is required for public safety checks" >&2
  exit 2
fi

mapfile -d '' files < <(git ls-files -z --cached --others --exclude-standard)

if ((${#files[@]} == 0)); then
  echo "No public candidate files found."
  exit 0
fi

blocked_paths=(
  ".claude/"
  ".jarvis/"
  ".mcp.json"
  "CLAUDE.md"
  "brief.md"
  "image.png"
  "design/pasted-image-"
  "specs/"
  ".infisical.json"
)

failed=0

for file in "${files[@]}"; do
  for blocked in "${blocked_paths[@]}"; do
    if [[ "$file" == "$blocked"* ]]; then
      echo "error: internal/local file would be public: $file" >&2
      failed=1
    fi
  done

  if [[ "$file" == .env || ( "$file" == .env.* && "$file" != ".env.example" ) ]]; then
    echo "error: environment file would be public: $file" >&2
    failed=1
  fi
done

scan_files=()
for file in "${files[@]}"; do
  [[ "$file" == ".gitignore" ]] && continue
  [[ "$file" == "scripts/check-public-safety.sh" ]] && continue
  # Lockfiles are machine-generated; integrity hashes trip the long-token scan.
  [[ "$file" == "pnpm-lock.yaml" ]] && continue
  [[ -f "$file" ]] && scan_files+=("$file")
done

internal_pattern='nodecodex|jarvis|claude|paperclip|open-design|opendesign|/home/daniel|\.mcp\.json|\.jarvis|\.claude|pencilToken|boardApiToken|local-owner-auth|STITCH_API_KEY|JARVIS_|PAPERCLIP_'
secret_pattern='BEGIN (RSA|OPENSSH|EC|DSA)? ?PRIVATE KEY|github_pat_|ghp_|gho_|ghu_|ghs_|ghr_|sk_live_|sk_test_|whsec_|xox[baprs]-|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|sb_secret_|dop_v1_|sntryu_|-----BEGIN'
long_token_pattern='[A-Za-z0-9_\/=+.-]{48,}'

if ((${#scan_files[@]} > 0)); then
  if rg -nI -i -- "$internal_pattern" "${scan_files[@]}"; then
    echo "error: possible internal system reference found in public candidate files" >&2
    failed=1
  fi

  if rg -nI -i -- "$secret_pattern" "${scan_files[@]}"; then
    echo "error: possible real secret pattern found in public candidate files" >&2
    failed=1
  fi

  if rg -nI -- "$long_token_pattern" "${scan_files[@]}"; then
    echo "error: long token-like string found in public candidate files" >&2
    failed=1
  fi
fi

if ((failed)); then
  exit 1
fi

echo "Public safety check passed."

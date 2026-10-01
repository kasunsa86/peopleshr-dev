#!/bin/bash
# Deploys this repo as the live site, adding IT's CloudFront origin lock
# block to .htaccess on the way. That block holds a secret, so it is never
# in git: the repo's .htaccess only has a placeholder where it goes, and
# the real block is kept in a file outside the repo (lock file below).
#
#   ./deploy.sh TARGET LOCKFILE
#       Used by cPanel (.cpanel.yml) on "Deploy HEAD Commit": copies the
#       site into the live folder, then installs the built .htaccess.
#
#   ./deploy.sh
#       Local fallback for a manual upload: builds a clean copy of the site
#       in "../PHR Website Deploy/site/" (block from
#       "../PHR Website Deploy/origin-lock.txt"). Upload that folder's CONTENTS.
#
# Nothing is copied unless the lock file holds IT's full block and the
# placeholder is found, so pages never go live without their .htaccess.
set -euo pipefail

repo="$(cd "$(dirname "$0")" && pwd)"

if [ $# -eq 0 ]; then
  deploy_dir="$(cd "$repo/.." && pwd)/PHR Website Deploy"
  target="$deploy_dir/site"
  lock="$deploy_dir/origin-lock.txt"
  mirror=1   # local build folder: also drop files deleted from the repo
  if [ -n "$(git -C "$repo" status --porcelain 2>/dev/null)" ]; then
    echo "Note: there are uncommitted changes; they are included in this build." >&2
  fi
elif [ $# -eq 2 ]; then
  target="${1%/}"
  lock="$2"
  mirror=0   # live folder: never delete files that exist only on the server
else
  echo "Usage: ./deploy.sh [TARGET LOCKFILE]" >&2
  exit 2
fi

fail() { echo "DEPLOY STOPPED, nothing was changed: $*" >&2; exit 1; }

[ -f "$lock" ] && grep -q '^RewriteCond %{HTTP:X-Origin-Verify}' "$lock" \
  && ! grep -q 'SECRET' "$lock" && grep -q 'end CloudFront origin lock' "$lock" \
  || fail "$lock is missing or isn't IT's full origin lock block."
if [ "$mirror" -eq 1 ]; then mkdir -p "$target"; fi
[ -d "$target" ] || fail "target folder $target does not exist."
[ "$(cd "$repo" && pwd -P)" != "$(cd "$target" && pwd -P)" ] \
  || fail "the target is the repository itself; the repo must be cloned outside the live folder."
command -v rsync >/dev/null || fail "rsync is not available."

# Build .htaccess: swap the placeholder (its start line through its end line) for the block.
built="$(mktemp "${TMPDIR:-/tmp}/htaccess.XXXXXX")"
trap 'rm -f "$built"' EXIT
awk -v lock="$lock" '
  /^# ===== CloudFront origin lock goes HERE/ { while ((getline line < lock) > 0) print line; skip = 1; next }
  skip && /^# ===== end origin lock placeholder =====/ { skip = 0; next }
  !skip
' "$repo/.htaccess" > "$built"
grep -q '^RewriteCond %{HTTP:X-Origin-Verify}' "$built" && ! grep -q 'origin lock goes HERE' "$built" \
  || fail "placeholder not found in the repo's .htaccess."

# .htaccess first: it also works with the previous pages, so there is no
# moment where new pages run without the rules they need.
cp "$built" "$target/.htaccess.new"
chmod 644 "$target/.htaccess.new"
mv -f "$target/.htaccess.new" "$target/.htaccess"

delete=()
[ "$mirror" -eq 1 ] && delete=(--delete)
rsync -rlt ${delete[@]+"${delete[@]}"} \
  --exclude '.git' --exclude '.gitignore' --exclude '.cpanel.yml' --exclude '.claude' --exclude '.vscode' \
  --exclude '.DS_Store' --exclude '*.zip' \
  --exclude 'dev-server-router.php' --exclude 'deploy.sh' \
  --exclude '/.htaccess' --exclude '/.htaccess.new' \
  "$repo/" "$target/"

echo "Deployed to: $target"
if [ "$mirror" -eq 1 ]; then
  echo "Upload the contents of that folder to origin.peopleshr.com (includes the hidden .htaccess;"
  echo "Cmd+Shift+. shows hidden files)."
fi
echo "Check: https://peopleshr.com loads, and https://origin.peopleshr.com opened directly gives 403."

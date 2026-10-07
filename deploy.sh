#!/bin/bash
# Deploys this repo's site files, leaving the live server's own files alone.
#
# .htaccess is NEVER deployed. The live one in origin.peopleshr.com starts
# with IT's CloudFront origin lock block (it holds a secret, so it is never
# in git) and is maintained by hand on the server. The repo's .htaccess is
# the reference copy: when it changes, apply the same edit to the live file
# by hand, below the origin lock block.
#
#   ./deploy.sh TARGET
#       Used by cPanel (.cpanel.yml) on "Deploy HEAD Commit": copies the
#       site into the live folder. Files that exist only on the server are
#       kept (no --delete).
#
#   ./deploy.sh
#       Local fallback for a manual upload: builds a clean copy of the site
#       in "../PHR Website Deploy/site/". Upload that folder's CONTENTS. It
#       has no .htaccess, so the upload can't replace the live one.
set -euo pipefail

repo="$(cd "$(dirname "$0")" && pwd)"

if [ $# -eq 0 ]; then
  target="$(cd "$repo/.." && pwd)/PHR Website Deploy/site"
  mirror=1   # local build folder: also drop files deleted from the repo
  mkdir -p "$target"
  if [ -n "$(git -C "$repo" status --porcelain 2>/dev/null)" ]; then
    echo "Note: there are uncommitted changes; they are included in this build." >&2
  fi
elif [ $# -eq 1 ]; then
  target="${1%/}"
  mirror=0   # live folder: never delete files that exist only on the server
else
  echo "Usage: ./deploy.sh [TARGET]" >&2
  exit 2
fi

fail() { echo "DEPLOY STOPPED, nothing was changed: $*" >&2; exit 1; }

[ -d "$target" ] || fail "target folder $target does not exist."
[ "$(cd "$repo" && pwd -P)" != "$(cd "$target" && pwd -P)" ] \
  || fail "the target is the repository itself; the repo must be cloned outside the live folder."
command -v rsync >/dev/null || fail "rsync is not available."

delete=()
[ "$mirror" -eq 1 ] && delete=(--delete)
# Excluded files are never copied, and --delete leaves them alone too.
# Repo-only files (git, editor, deploy and dev-server files) stay out of
# the live folder.
rsync -rlt ${delete[@]+"${delete[@]}"} \
  --exclude '/.htaccess' --exclude '.htaccess*' --exclude 'origin-lock.txt' \
  --exclude '.git' --exclude '.gitignore' --exclude '.cpanel.yml' --exclude 'deploy.sh' \
  --exclude '.claude' --exclude '.vscode' --exclude '.DS_Store' --exclude '*.zip' \
  --exclude 'dev-server-router.php' --exclude '/tools' \
  "$repo/" "$target/"

echo "Deployed to: $target (.htaccess not touched)"
if [ "$mirror" -eq 1 ]; then
  echo "Upload the contents of that folder to origin.peopleshr.com."
fi
echo "Check: https://peopleshr.com loads, and https://origin.peopleshr.com opened directly gives 403."

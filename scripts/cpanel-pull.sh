#!/bin/bash
# Runs on the campus cPanel server every 15 minutes (cPanel > Cron Jobs).
# Fetches the latest finished site from GitHub's "deploy" branch and copies it
# into the web folder. The connection goes out from campus to GitHub, so the
# campus VPN is not involved.
#
# One-time setup on cPanel (Terminal in cPanel, or SSH on campus/VPN):
#   git clone --branch deploy --single-branch https://github.com/OWNER/REPO.git ~/site-deploy
#   Save this file as ~/cpanel-pull.sh (paste it in with cPanel's File Manager), then:
#   chmod +x ~/cpanel-pull.sh
# Cron job (cPanel > Cron Jobs, "Once per 15 minutes"):
#   */15 * * * * $HOME/cpanel-pull.sh >/dev/null 2>&1

set -e
SRC="$HOME/site-deploy"
WEB="$HOME/public_html"   # change if the site's web folder is different

cd "$SRC"
git fetch -q origin deploy
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/deploy)" ]; then
  exit 0   # nothing new
fi
git reset -q --hard origin/deploy

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude '.git' "$SRC"/ "$WEB"/
else
  find "$WEB" -mindepth 1 -maxdepth 1 ! -name '.well-known' -exec rm -rf {} +
  cp -a "$SRC"/. "$WEB"/ && rm -rf "$WEB/.git"
fi

# One-time setup (for whoever sets up the site)

When this is done, Amy edits content at app.pagescms.org, and every save updates the live site on campus hosting within about 15–20 minutes. Nobody needs a terminal after setup.

**How it works:**
1. Pages CMS (browser editor- app.pagescms.org) saves changes to the GitHub repository `ajwj-illinois/lab-website`.
2. A GitHub Action (`.github/workflows/deploy.yml`) builds the site with Astro and puts the finished pages on a branch called `deploy`.
3. A cron job on the campus cPanel server (`scripts/cpanel-pull.sh`) checks that branch every 15 minutes and copies anything new into the web folder.

Why this direction: campus cPanel only accepts SSH/SFTP uploads from on campus or through the VPN, so GitHub can't push files to it. Instead the cPanel server pulls from GitHub (an outgoing connection from campus). See https://answers.illinois.edu/illinois/84992 and https://answers.illinois.edu/illinois/85001 (cron runs at most every 15 minutes).

## 1. GitHub (done)

The repository is `ajwj-illinois/lab-website` (public). After the files are uploaded, open **Actions** and confirm "Build site" ran and a `deploy` branch exists.

## 2. Campus cPanel hosting

Free for anyone with an @illinois.edu address; guide at https://answers.illinois.edu/illinois/84955. Lyle Reggenwetter (MechSE) hosts his Astro site this way.

1. Amy creates the account at go.illinois.edu/cPanelCreate (NetID login).
2. In cPanel, open **Terminal** (or SSH in from campus/VPN) and run:
   ```
   git clone --branch deploy --single-branch https://github.com/ajwj-illinois/lab-website.git ~/site-deploy
   ```
3. With cPanel's **File Manager**, create `~/cpanel-pull.sh` containing `scripts/cpanel-pull.sh` from this project. Check that `WEB=` points at the site's web folder (usually `public_html`). Then in Terminal: `chmod +x ~/cpanel-pull.sh && ~/cpanel-pull.sh`
4. Visit the cPanel site's temporary address and check the site appears.
5. In cPanel → **Cron Jobs**, add a job that runs once per 15 minutes with the command:
   ```
   $HOME/cpanel-pull.sh >/dev/null 2>&1
   ```

## 3. Point the web address at the new site (do this last)

Per https://answers.uillinois.edu/illinois/84987, two steps:
1. MechSE IT creates a CNAME record in IPAM so `wagonerjohnson.mechse.illinois.edu` points at the cPanel service instead of Wix.
2. A ticket to cPanel support asks them to associate that domain with Amy's cPanel account (include the domain, the cPanel account name, and a preferred date/time).

Do this only after the new site has been checked on its temporary address. Cancel the Wix subscription afterward.

## 4. Browser editor (Pages CMS)

1. Go to https://app.pagescms.org and sign in with GitHub (Amy's account, ajwj-illinois).
2. The Pages CMS GitHub app is installed with access to `lab-website` only.
3. Open the repository. The menu (News, People, Research areas, Publications, Join page, Homepage & site settings) comes from `.pages.yml`.
4. Make a small test edit and confirm the GitHub Action runs and the live site updates (within about 20 minutes).

## 5. Before going live

- Replace placeholder people, news, and the BibTeX file (see EDITING.md).
- Add a portrait and at least one research image (an SHG image works well for the flagship card).
- Review the draft research text on each research page.
- Check the site with the official campus header/footer loaded (they come from `cdn.toolkit.illinois.edu` and only appear on a real build, not in preview mode).
- Confirm accessibility: images have alt text/captions; campus requires WCAG compliance.

## Working locally (optional, for developers)

```
npm install
npm run dev                      # http://localhost:4321
PUBLIC_PREVIEW=1 npm run build   # build with stand-in header/footer (no campus CDN)
npm run build                    # production build into dist/
```

Key files:
- `src/content/` — people, news, research areas, join page (Markdown with front matter)
- `src/data/site.json` — homepage text and site settings
- `src/data/publications.bib` — publications (parsed by `src/lib/bibtex.ts`)
- `src/styles/global.css` — all styling; Illinois brand colors are defined at the top
- `src/components/CampusHeader.astro`, `CampusFooter.astro` — official `ilw-header`/`ilw-footer` from the Illinois Web Toolkit v3
- `.pages.yml` — browser editor forms (keep in sync with `src/content.config.ts`)

# Static release build

## Search and AI discovery

The canonical public collection is **https://sky-playground.com/games/**. Every game has a unique title and description, an absolute canonical URL, Open Graph/Twitter metadata, inline Schema.org VideoGame and breadcrumb data, and a readable English/Traditional Chinese guide. The collection lists only its visible game cards in structured data; temporarily hiding a card does not remove the standalone game URL from the sitemap.

Edit `tools/game-catalog.mjs` to update game facts, then run `npm run seo --prefix tools` to regenerate source HTML, `sitemap.xml` and `llms.txt`. The production builder applies the same catalog, preserves JSON-LD as a data script and maps the share image to its published hashed asset. No ratings, reviews, publication dates or unsupported online multiplayer claims are invented. `llms.txt` is an optional readable inventory, not a requirement for AI search inclusion. There are no hreflang alternates because language selection uses shared URLs rather than separately published language pages.

Validate source with `npm run check:seo --prefix tools`. After a `/games/` build, run `node tools/check-seo.mjs _site /games/`. The Pages workflow runs both checks.

Deployment to sky-playground.com:

1. Publish the built output into the domain's `/games/` folder, including `sitemap.xml` and `llms.txt`.
2. Merge `tools/robots-root.txt` into the **domain-root** `/robots.txt` (preserve any existing rules). A `/games/robots.txt` has no crawler authority. A missing robots.txt does not itself block indexing.
3. In Google Search Console, submit `https://sky-playground.com/games/sitemap.xml` and inspect the collection plus a game URL. Check Bing Webmaster Tools too if available.
4. Check that origin/CDN rules allow search crawlers to fetch the pages and their JavaScript/CSS. This folder cannot override an origin-level bot block.

The implementation follows [Google's SEO guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features), and [Schema.org VideoGame](https://schema.org/VideoGame). Clear visible facts and crawlability support discovery; rankings and AI citations are not guaranteed. Search Console submission and domain-root configuration require access outside this repository.

## Build and caching

Run `npm ci --prefix tools` then `PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs _site`. Node 22 is used in Pages CI. Set the base to `/` when serving at an origin root. Only tracked source files are published, so unrelated untracked games stay private to the workspace. JS modules (including inline module programs) share one splitting graph to preserve singleton language/state modules. All application JS, CSS, images and fonts use content-hashed names. HTML and release.json retain stable URLs for navigation/update detection.

HTML includes no-cache metadata. The local server and generated `_headers` supply `Cache-Control: no-cache, no-store, must-revalidate`; hashed assets receive immutable caching. **GitHub Pages does not support custom origin response headers or `_headers`.** Its first HTML origin response therefore remains under GitHub's header policy. The installed worker uses network-first HTML and returns the requested cache headers; hashed assets and a no-store release manifest prevent old asset reuse. A stable `sw.js` migration bridge is deliberately retained for older installed cache-first releases.

## GoDaddy Linux / cPanel cache policy

Apache honors the included `.htaccess` when `mod_headers` and the account's overrides are enabled. The build copies it into `_site/` automatically. It sets HTML, stable JS/CSS, manifests and JSON (including `release.json`) to `no-cache, no-store, must-revalidate`. Only content-hashed assets receive `public, max-age=31536000, immutable`. It clears older `Pragma` / `Expires` headers on immutable assets and replaces inherited cache headers on stable files. This config works in either the domain root or a subfolder without rewrite rules.

The service-worker update prompt and saved progress continue working. Moving to a different domain changes the browser storage origin: export/import the existing game backup to transfer progress to the new domain. HTTPS is required for installed/offline play.

The shared update checker checks the release manifest on visibility and every five minutes. A new release opens a native Update / Later prompt when gameplay and dialogs allow. Update explicitly activates the new hashed worker and calls `window.location.reload()` in the accepting tab; Later snoozes for 30 minutes. Other tabs keep their current ritual and records. No forced automatic reload occurs.

`tools/check-updates.mjs` is a local integration fixture requiring two generated releases and the `/tmp/ritual-live` server on port 5182. It tests snoozing, explicit activation, one-tab reload, preserved saves and offline opening. Do not run it against a production host.

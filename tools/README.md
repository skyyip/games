# Static release build

Run `npm ci --prefix tools` then `PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs _site`. Node 22 is used in Pages CI. Set the base to `/` when serving at an origin root. Only tracked source files are published, so unrelated untracked games stay private to the workspace. JS modules (including inline module programs) share one splitting graph to preserve singleton language/state modules. All application JS, CSS, images and fonts use content-hashed names. HTML and release.json retain stable URLs for navigation/update detection.

HTML includes no-cache metadata. The local server and generated `_headers` supply `Cache-Control: no-cache, no-store, must-revalidate`; hashed assets receive immutable caching. **GitHub Pages does not support custom origin response headers or `_headers`.** Its first HTML origin response therefore remains under GitHub's header policy. The installed worker uses network-first HTML and returns the requested cache headers; hashed assets and a no-store release manifest prevent old asset reuse. A stable `sw.js` migration bridge is deliberately retained for older installed cache-first releases.

## GoDaddy Linux / cPanel cache policy

Apache honors the included `.htaccess` when `mod_headers` and the account's overrides are enabled. The build copies it into `_site/` automatically. It sets HTML, stable JS/CSS, manifests and JSON (including `release.json`) to `no-cache, no-store, must-revalidate`. Only content-hashed assets receive `public, max-age=31536000, immutable`. It clears older `Pragma` / `Expires` headers on immutable assets and replaces inherited cache headers on stable files. This config works in either the domain root or a subfolder without rewrite rules.

The service-worker update prompt and saved progress continue working. Moving to a different domain changes the browser storage origin: export/import the existing game backup to transfer progress to the new domain. HTTPS is required for installed/offline play.

The shared update checker checks the release manifest on visibility and every five minutes. A new release opens a native Update / Later prompt when gameplay and dialogs allow. Update explicitly activates the new hashed worker and calls `window.location.reload()` in the accepting tab; Later snoozes for 30 minutes. Other tabs keep their current ritual and records. No forced automatic reload occurs.

`tools/check-updates.mjs` is a local integration fixture requiring two generated releases and the `/tmp/ritual-live` server on port 5182. It tests snoozing, explicit activation, one-tab reload, preserved saves and offline opening. Do not run it against a production host.

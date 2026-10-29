# Performance improvements across the playground

All twenty games benefit from the shared translation, loading and offline-cache changes. Changes do not alter scoring, collision rules, gesture thresholds, sensor calibration, records or purchases.

## Loading and repeat visits

- DM Sans, Fredoka and Space Grotesk load as WOFF2, reducing their combined font payload from 536,024 to 223,964 bytes (about 58%). The font families and weight ranges are unchanged; original TTF sources and font licenses remain available. Iansui remains unchanged.
- CSS and inline styles resolve a font to the **same content-hashed URL** across games. This removes the duplicate font URLs formerly produced by separate CSS / inline build paths.
- Production HTML preloads eager JavaScript imports. Dynamic imports remain lazy, and all scripts still share the existing module graph / singleton language state.
- Below-the-fold landing covers load lazily; the first cover has high fetch priority. Existing fixed artwork heights preserve the layout.
- GoDaddy Apache configuration enables text / SVG compression when `mod_deflate` is available, preserving stable-URL revalidation and immutable hashed-asset caching.
- Offline installers fetch one fresh HTML shell, copy unchanged hashed assets from existing caches, reuse HTTP cache entries, and limit network prefetching to four concurrent requests. They do not broadly cache unused TTF/font files. Old game assets and other routes’ caches remain available for running tabs.
- The release checker starts after load during an idle period and does not poll or show prompts in hidden tabs. Update remains an explicit player action; accepting it reloads only that tab.

## Runtime and idle work

- Translation caches up to 2,048 resolved messages, coalesces duplicate mutation work, skips authored bilingual branches and decorative SVG geometry, and preserves reversible English / Traditional Chinese presentation. Numeric updates avoid dictionary processing.
- Tap & Spill, Little Balance, Float & Balance, Marble & Mist and Pot Luck stop perpetual setup-screen rendering. Gameplay, input and resize still schedule the required frames. Tap & Spill caps backing-store density at 2× and stops rendering behind its settled result panel.
- The maze caches its static floor / raised walls; the pot court caches its static scenery. Level / size changes rebuild those layers. Marbles, hazards, fog, arrows, expressions and moving targets remain live.
- Roach Rush batches hitbox reads before transform writes rather than forcing layout separately for each critter. Unchanged timer / mode / score labels are not rewritten.
- Pikmax skips fed units, avoids unused/repeated pose writes and unnecessary flight-target measurements, and refreshes expensive articulated SVG poses at 30 Hz while position updates remain frame-driven. Controls, 0.6-second flower charges and timed rounds retain their original clocks.
- The new café canvas uses ResizeObserver rather than measuring its bounds every rendered frame, caches its dirt layer and clears only newly cleaned patches. Memory Trace changes its countdown text only when the displayed second changes.
- Hidden tabs pause decorative CSS / shared spring feedback. Roach Rush and Pikmax stop their background rendering and resume against their existing wall-clock rules. No global requestAnimationFrame monkey patch or physics frame limiter is shipped.

## Local measurements

Captured using `tools/audit-performance.mjs`: Chromium, 390 × 844 touch viewport, 4× CPU throttling, fresh contexts and service workers blocked for cold-load isolation. The loopback static server serves uncompressed responses, so these byte counts do not include the additional benefit of the Apache compression setting. CPU/render counts are individual local samples rather than real-phone battery measurements; browser scheduling and run-to-run load vary.

The three Latin font payloads are about 58% smaller overall. Runtime measurements below describe the retained rendering changes.

Setup-screen work in a one-second observation:

| Game | RAF callbacks before | RAF callbacks after | Browser task time before → after |
| --- | ---: | ---: | ---: |
| tap-and-spill | 58 | 0 | 633 → 4 ms |
| balance-bridge | 59 | 0 | 517 → 3 ms |
| pot-toss | 62 | 0 | 908 → 2 ms |
| marble-maze | 31 | 0 | 1056 → 3 ms |
| floating-balance | 47 | 0 | 1044 → 2 ms |

The measured maze play sample increased from 28 to 61 rendering callbacks per second after static-wall caching; Pot Luck increased from 39 to 58. Roach Rush layout operations dropped from 246 to 51 in its play sample. Memory Trace’s countdown dropped from 62 to 3 DOM mutations and from 368 to 29 ms of task work in the measured second. These samples describe the local test conditions, not a guaranteed frame rate on every device.

## Verification and reproduction

- **472 existing unit tests** across the games pass; **3 additional worker tests** cover immutable reuse, four-request concurrency, one HTML fetch, failed installs, offline navigation and safe version cleanup.
- All 20 production game routes are checked for compressed Latin WOFF2 loading, module preloads, offline startup, preserved unrelated local storage and no uncaught errors. Shared translation checks cover dynamic text, numeric labels, opt-out branches, accessible SVG text and switching 中 / EN back and forth.
- Native browser suites exercise pouring / overflow / replay, real touch roach / mouse / tool actions, all five mazes, sensor fallbacks, both balance games, physical arrow hits and records, café controls, and the ritual’s preparation / collection / altar flows.
- Source Beat the Bad Luck cache migration from v97 to v98 preserves inventory, balance, altar selections and unrelated games.
- A real two-release browser fixture verifies Later, one-tab Update/reload, retained gear/records, offline reopening and **zero repeat network downloads of the shared Latin font** when entering another game. Its local compressed-response fixture also executes compressed JavaScript successfully.
- Old browser assertions for pre-SEO titles / a 30-character roster were updated to the current titles / 35-character roster. Short-view dialog checks now scroll the existing inner panel before checking action visibility.

Commands (set `GRID_RUSH_PLAYWRIGHT_MODULE` to an installed Playwright module):

```sh
node --test */tests/*.test.js tools/tests/*.test.mjs
PLAYGROUND_BASE_PATH=/ node tools/build-site.mjs /tmp/perf-after
PERF_ORIGIN=http://localhost:5271 PERF_OUT=/tmp/performance.json node tools/audit-performance.mjs
PERF_ORIGIN=http://localhost:5271 PERF_SITE=/tmp/perf-after node tools/check-performance.mjs
PERF_BEFORE=/tmp/perf-before PERF_AFTER=/tmp/perf-after node tools/check-release-cache.mjs
node tools/check-seo.mjs /tmp/perf-after /
node tools/check-brand-icons.mjs /tmp/perf-after
```

The before/after audit JSON and browser screenshots are kept under `/tmp/` in this workspace. Serve the two build directories on local HTTP servers for the audit; the release-cache check starts its own isolated server. The source and built-cache checks never send game data to external services.

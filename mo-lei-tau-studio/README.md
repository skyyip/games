# 星爺宇宙：無厘頭片場 · Mo Lei Tau Studio

A playable, local-first, cute comic film-studio game. Its direct route is `mo-lei-tau-studio/`, and it is deliberately hidden on the playground landing page (`listed: false`). The three film worlds are 少林足球、唐伯虎點秋香 and 功夫. Artwork is original inline SVG chibi interpretation; audio uses short original Web Audio tones, not recordings from films.

## Run and build

Node 22+. `npm ci --prefix mo-lei-tau-studio`, then `npm run dev --prefix mo-lei-tau-studio` (port 5282). Vite compiles JSX; direct unbuilt JSX cannot run through a generic static server. `npm run build --prefix mo-lei-tau-studio` produces the standalone `dist/`. `npm test --prefix mo-lei-tau-studio` runs domain and cloud-interface checks.

The shared playground builder also supports the game: install both `tools/` and this folder's dependencies, then `node tools/build-site.mjs _site`. All production JS, CSS, images and fonts receive content hashes. The shared build supplies its versioned worker/update flow and Apache cache rules. Source/Vite preview workers deliberately do not cache unhashed development modules.

The logical routes are `#/setup`, `#/home`, `#/studio`, `#/rankings`, and `#/movie-result/:id`. Hash routing makes refresh work on both cPanel and GitHub Pages, without a root SPA rewrite that would intercept other games.

## Complete local game loop

- Choose a film, open exactly three **free, unique contracts from that movie**, then pick one active actor. All three contracts remain owned. Further auditions cost **120 personal wages**, only draw unowned characters, and can target any film.
- Eighteen actors each have ten personality attributes, acting, potential, luck, gender, MBTI, zodiac, blood type and three distinct representative props. Free switching preserves each actor's progression.
- Two currencies: **personal wages** buy props and auditions; **film funds** fund movies and optional guests. Start with 320 wages and 650 film funds.
- Jobs last **5, 15 or 30 minutes**. Potential scales the reward at job start; changing actors does not change the promised reward. Timers persist across closing the page. Claim once, manually; there is no automatic restart or polling.
- Emotion training: twelve commands, one every **1.5s**, **0.8s** response window, 18 seconds total. Rhythm: twelve arrows, 600ms spacing, 1600ms fall, ±220ms hit window, about 9 seconds. Keyboard arrows and touch buttons work. Training pays 7 wages/10 funds per hit, plus potential-scaled attribute growth. Closing or backgrounding the minigame cancels that take without rewards.
- Buy and equip three character props (80/140/200 wages). Ownership unlocks an awakened portrait and +4% participating box office. A filming snapshot records the equipped props.
- Join only your active actor's movie. Six role slots must all be filled and budget reached (900/1200/1600 funds) to automatically film. **Local extras are NPCs**, explicitly labelled, and are recruited one at a time without spending funds. They do not pretend to be remote players.
- Before filming, invite one random cross-movie guest for **20% extra budget**. This changes the ending and adds a box-office bonus. Members fund the crew; contributions cannot exceed their balance or remaining budget. Leaving a crew does not refund contributions.
- Filming samples **three distinct crises**, uses the better of two team personality scores for each roll, then calculates box office from acting, outcomes, chemistry, awakenings, cameo and randomness. Three wind signs give +10%, ENTP + ISFJ add +6%, and Tat's skill can trigger a timid-based ×1.5 critical. Failure is a funny alternative scene, not a lost save.
- Luck affects local casting-call invitations after work or training (8% + luck/400), only for an available role. Accepting reserves it and activates that actor. These are explicitly local scripted opportunities.
- Three-percent mentor encounter chance after a claimed job or completed training. One quiz upgrades acting cap to 130 (+3 acting) or unlocks the timid-to-critical skill. Pending encounters can be reopened on the actor panel.
- Premiere rewards are awarded **once when filming resolves**, not on result-page visits. Keep up to 30 film results, replay reports, export a PNG movie poster, and view local box-office, contract popularity and crew anticipation lists. Local applause is once per actor per UTC day.

## Storage, performance and access

Local key: `mo-lei-tau-studio.save.v1`. There is no network account or cross-device sync in this version. Storage failure shows a persistent warning and retains the current visit's state. Reload cancels incomplete training. Local clocks and saves are not authoritative or cheat-proof; never import these balances into a future competitive cloud economy without migration validation.

No canvas/game engine, microphone, motion permissions, real-money purchases or high-frequency cloud reads. A one-second timer exists only for an active job, and stops at completion/backgrounding. Only active training uses a 40ms timer; results count up briefly, then stop. Poster capture is dynamically imported on demand. Sound is opt-in and audio contexts suspend after feedback. Reduced-motion mode removes decorative transitions/confetti. Native dialogs trap focus, restore focus, support Escape and scroll internally. Inputs stay 16px on mobile to avoid iOS focus zoom.

## Cloud and deployment

As requested, **this delivery implements local mode and the cloud interface, not a deployed multiplayer backend**. See [CLOUD-INTERFACE.md](CLOUD-INTERFACE.md) for API/schema and free-plan constraints. `src/cloud.js` lazy-loads Firebase Auth/Firestore/Functions only after explicit configuration; there is no background auth, polling, fake online player or global leaderboard. Rules default-deny client writes to sensitive balances and results.

The existing Pages workflow installs this game's dependencies before building the collection. `studio-godaddy.yml` builds/tests the standalone game, with an **optional, disabled-by-default** FTPS deployment job gated by `STUDIO_DEPLOY_ENABLED=true`. It only accepts a destination ending `/mo-lei-tau-studio/`, uses repository secrets, and never clears the whole hosting root. No deployment credentials are included.

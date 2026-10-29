# 茶記大作戰：縮腳啦笨！ / Mop Mayhem: Feet Up!

A Hong Kong café cartoon game with three fully local modes. No account, backend, network matchmaking or motion permission is required. Traditional Chinese is the default; the playground’s 中 / EN choice carries over. All illustrations, music-like café sounds and impact effects are local SVG / Canvas / Web Audio; optional spoken lines use the device’s speech voices (Cantonese availability varies).

## Play

Open `/cha-chaan-mop/` from a local HTTP server, or choose the new card on the playground. Pick a 60- or 90-second round. Café surprises can be disabled for practice.

- **姐姐 / Mop master:** drag anywhere inside the room to move the mop. Each dirty patch earns 2. Clean the whole floor before time runs out, or finish with a timed score. Normal shouts make customers lift their feet after a delay; poke in the final 0.24s before the lift for double points. Both shout buttons share a cooldown. Phone users react slowly (1.1s), sneakerheads quickly (0.44s); office heels require a MEGA shout (0.78s), while the uncle ignores shouting and takes three pokes. Surprise pokes lower the tip rating.
- **顧客 / Feet-up survival:** hold left and right independently to raise feet, release to lower. A sweep requires both; a splash requires the menu shield. Holding both for about 3.8s causes a three-second cramp. Dodge without a wet hit, then eat or drink with a foot lifted within 1.8s for double meal progress and 32 points of cramp relief. Eating/drinking share a 2.8s cooldown. Finish both food and drink to win; three wet hits or an unfinished meal at timeout loses.
- **同機對戰 / Couch clash:** 1 mop master versus 1–3 diners simultaneously on one screen. Mop master drags, diners use their colour-coded foot buttons. Three wet hits eliminates a diner. Eliminate all diners to win; otherwise surviving diners win at timeout. No food or clean-floor victory in this mode. Multi-touch phones work; tablets provide more space. The shared score and tips track the mop master’s cleaning and pokes.

Desktop: arrows move the mop; E shouts, Q MEGA-shouts, F cyclones, G uses soap. Solo diner: A/D feet, S menu, Space eats, Enter drinks (or use the visible buttons). Versus diner pairs: A/D, J/L, N/M; the mop master uses mouse drag. Esc pauses. Foot controls also support Space/Enter while focused.

## Scoring, events and cosmetics

Base poke scores: phone 25; sneakers 80; office heels 55; uncle 8 / 8 / 45. Chain hits within 1.5s for +5% per link, capped at +50%. Clean patches and pokes charge rage; a full gauge offers a 1.8s mop cyclone or four-second soap slide. Cyclones clean a large circle and catch NPC feet; humans can dodge with both feet up. Soap makes nearby NPCs wobble and drop their guard, allowing repeated pokes; in versus it splashes unraised nearby feet once and throws them briefly into the air. A 1.3s wet-hit grace period prevents one contact from instantly soaking a human player.

Optional ten-second rain: mop speed +20%, cramp load ×2. Optional lunch rush: six extra NPCs for the mop master, shorter gaps between AI attacks for a solo diner. Events first appear after 16s, with at least 22s between starts. Café warnings occupy fixed space so buttons never jump.

Each completed round pays whole-number tips from score, adjusted by the mop master’s tip rating, plus a successful solo-meal bonus. Ten cosmetic items across mops, aprons and footwear have distinct visible designs; buying automatically equips and owned gear can be re-equipped free. Cosmetics never change game physics or points.

## Persistence and install

Only `playground.cha-chaan-mop.v1` is written. Stores tips, unlocked/equipped cosmetics and top three scores separated by mode, duration and versus diner count. Names remain in memory, never in the records. Blocked/quota-limited storage falls back to session play and shows a warning on save. Other games’ data is untouched.

The manifest uses the site’s Beat the Bad Luck mascot icons. The source service worker precaches the entire game and uses network-first responses with offline fallback. Updates wait rather than replacing a live round. The common production builder generates hashed scripts, CSS, images, fonts and workers, release detection, and the existing GoDaddy Apache cache policy. The shared site update prompt reloads after player confirmation.

## Implementation and verification

- `src/game.js`: pure, injected-RNG simulation with bounded 1/60s substeps.
- `src/renderer.js`: cached room backdrop, capped pixel ratio (1.75), bounded visual effects, correct letterbox hit coordinates.
- `src/app.js`: native dialogs, keyboard, independent multi-pointer holds, pause/resume, purchases and settlement.
- `src/progress.js`: isolated, validated local persistence and cosmetic transactions.
- `src/audio.js`: gesture-unlocked, bounded synthetic effects, optional OS speech.

Backgrounding or losing focus pauses the round, releases all held inputs and stops ambience; resume is explicit. Closing a page cancels rendering. Reduced-motion mode disables decorative animation and moving rain / character bobbing; essential attack movement stays legible. The game suppresses text selection, touch callouts and double-tap zoom on play controls, with 16px text fields to prevent iPhone focus zoom. Native modal content scrolls independently; winner names get the site’s gold trophy and confetti.

Run `npm test` here, or `node --test cha-chaan-mop/tests/*.test.js` from the repository. Browser acceptance: serve the repository and run `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright.mjs node cha-chaan-mop/scripts/browser-check.mjs`; override `MOP_URL` for a production build. Screenshots default to `/tmp/mop-qa`.

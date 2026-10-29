# 茶記縮腳大亂鬥 · Feet Up Café

An independent, bilingual Hong Kong café comic-action game at `/feet-up-cafe/`. It shares site infrastructure and uses the earlier mop game's simulation/rendering foundation, with a new cover, two solo modes, room arrangement, four-direction attacks, shift goals, tea shields and its own storage. Both this game and the existing `/cha-chaan-mop/` game are hidden on the landing page; their direct URLs remain available. The earlier game is unchanged.

## Pick a side

**姐姐模式 / Mop master.** Play Auntie Li, drag the mop and shout 「縮腳呀！」. Catch feet in the last 0.24s before they lift for a perfect poke. Chain within 1.5s for up to +50%. Phones react slowly; sneakerheads react fast; office heels need a MEGA shout; uncles take three pokes. From 7s, a gold-ring guest appears every 10s for 6s. Catch them for +75 once. Cleaning charges rage for a mop cyclone or soap slide. The score tracks feet poked as well as the cleaned floor. Complete the floor or play until timeout.

**顧客模式 / Diner.** Mops approach from the front, back, left and right, visiting every side each four attacks. The source label and dashed path show the approach, and a short impact countdown makes the precision window readable; the foot/menu instruction tells you what to hold. Hold Left/Right independently, both for a sweep, or Menu for a splash. Release to recover stamina. Holding both for around 3.8s cramps your legs for 3s. Three wet hits lose; finish the bun and milk tea before timeout to win. Following a clean dodge, a well-timed bite/sip doubles meal progress and reduces cramps.

Lift the required foot/feet or menu in the final 0.3s before impact and avoid the **entire** attack to earn a 70-point precise dodge and 18 stamina recovery. Early lifts are still safe and earn 35. Repeated keydown cannot fake a fresh lift. Three consecutive clean dodges earn one milk-tea shield (maximum one). It absorbs one wet hit, breaks the dodge streak and expires when the round ends.

Both modes offer 60/90 seconds and optional rain/lunch-rush events. There are no new motion, microphone or account permissions. Multi-touch foot controls, mouse dragging, keyboard controls, pause on background, reduced motion and sound mute are supported.

## More reasons to play

Each mode has three optional shift goals. Auntie: 12 pokes, 3 perfect pokes, 2 gold guests. Diner: 6 dodges, 3 precise dodges, finish the meal. Completed goals add 12/15/18 or 12/15/20 tips at checkout. The pause panel shows progress; the result receipt includes completed goals, a bronze/silver/gold shift badge and a comic verdict. Goals never block a normal round.

Tips unlock 13 cosmetic items, including the new butter-bun mop, milk-tea apron and wonton-cloud slippers. Cosmetics change drawings, not scoring or defences. Top three scores are saved independently by mode and duration.

Only `playground.feet-up-cafe.v1` stores game progress. It does not import or modify `playground.cha-chaan-mop.v1`. Shared site language is inherited. No server sync is claimed. Source offline cache is `feet-up-cafe-v1`; production uses the shared hashed build, update prompt and GoDaddy cache configuration.

## Development

Serve the repository and open `/feet-up-cafe/`. Run `node --test --test-isolation=none feet-up-cafe/tests/*.test.js`. Browser checks:

- `scripts/browser-check.mjs`: four viewport/language profiles, real dragging and multi-touch, shoe visibility, dialogs, complete rounds, reload persistence.
- `scripts/feature-check.mjs`: native gold-guest catch, four directional warnings, precise dodges, tea shield/save and isolation from the old game.
- `scripts/release-check.mjs`: production diner victory, purchases, offline assets and hidden landing-card policy and direct route.

Set `GRID_RUSH_PLAYWRIGHT_MODULE` for an installed Playwright module, `MOP_URL` for a game URL, or `MOP_ORIGIN` for a built-site origin. Audio is synthesized locally; optional Cantonese speech depends on the device's installed voices.

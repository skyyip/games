# Beat the Bad Luck · 鵝頸橋下：小人退散！

A solo, bilingual Hong Kong ritual game for the playground. Master Yip’s flyover stall turns everyday worries into cute paper gremlins, then ends with a kind fortune. Touch, two-finger play, mouse and accessible buttons work in the same browser game. The installable web app supports iOS/Android browsers, desktop, standalone previews and offline play.

Run `npm start` and open `http://localhost:5173/beat-bad-luck/`. No build step or runtime dependencies are needed. `npm test` runs the 26 game/gesture/economy tests. `node scripts/build-cover.mjs` regenerates the local SVG cover from the in-game artwork.

## Five-step ritual

A run lasts approximately **67–87 seconds**. The intro mascot uses the playground logo with a traditional Chinese yellow ritual hat and matching robe. Actions have a short settling time, while gentle timeouts keep every step moving:

1. **Incense:** tap each of three sticks, swipe across them, then use the blow button. Optional microphone access detects a sustained local sound; no audio is recorded, stored or uploaded. Denied/unavailable permission leaves the button available. Streams are stopped when their step ends, when paused and when leaving the page; a late permission grant is discarded.
2. **Name the worry:** choose a preset or type up to 64 characters before starting. The literal words appear on a paper slip and gremlin; they are never inserted as HTML or stored with records.
3. **Whack:** 60 seconds at a visible/audible **108 BPM** pulse. Tap within 95 ms of the beat for a rhythm bonus. Independent pointer tracking accepts two fingers; duplicate events on the same pointer within 55 ms are ignored. Swipe at least 60 px for a heavy strike, with power based on travel and speed. Combos span gaps of up to 800 ms; nine rhythm prompts cover double taps, heavy swipes, rubbing, circles and pinching. Rub with three clear direction changes, draw a full circle in either direction, or move two separated fingers inward for distinct special strikes. Trails and a charge ring follow the gesture, and the paper shakes, spins or squashes on release. Five move buttons provide equivalent single-pointer and keyboard actions. All five buttons are visible throughout the whacking phase. Worry silhouettes get a randomly chosen paper colour and small accessory. Paper creases, tears and gold scraps follow damage; every 50 damage scatters another paper worry.
4. **White tiger:** drag the pork into the paper tiger’s mouth. Close drops get magnetic attraction, the mouth opens, and feeding gives a small reward bonus. The feeding button provides the same action without dragging.
5. **Good fortune:** tap the talisman to turn the paper into gold light. One result awards relief points, oil money, merit, a kind fortune, a possible new friend and a spot in the top-three scores.

Pausing freezes the model clock and inputs; hiding the page pauses too. Resuming excludes paused time from the result. Quitting never grants ritual rewards. Effects respect reduced motion, and vibration is optional where the browser supports it. The fixed play panel keeps interactions clear of phone home gestures; the rest of the page becomes inert during a ritual.

## Stall, keepsakes and friends

- The fourteen original kits: a paid flip-flop, rolled newspaper, red-white-blue bag, folding stool, peachwood sword, jujube-wood seal, spiked mace, vinyl record, lucky pinwheel, big iron hammer, fortune-turning child, Jockey Club 3T, Mark Six Snowball and rebirth paper. They have distinct synthesized strike timbres. Merit unlocks availability. Configured bonuses apply to relief points and QTE bonuses: newspaper ×2.42 and rebirth paper ×19.6. All paid kits were reduced by about 30%, rounded to two decimals, without changing prices or merit gates. Paid kits are single-ritual consumables, removed from inventory and saved on the first successful whack; their bonus lasts through that ritual. Replaying, quitting or reloading after that use requires repurchase. Cancelling before any hit preserves the unused kit. Bare hands are the free starter and fallback; the fourteen shop kits, including the flip-flop, are consumable purchases. Switching back to hands preserves an unused paid kit.
- Nine decorations with five levels each: cassette radio, neon sign, incense stand, lucky cat, guardian tiger, feng shui aquarium, Fu/Lu/Shou, lucky money tree and amethyst cluster. Each base purchase price is 100 oil higher than the previous pricing. Rows sort by the current purchase/upgrade price, with fully upgraded pieces last. First-level hourly oil rates are 0.6/1.2/1.8/2.4/3/3.6/4.2/4.8/5.4 for those pieces; each later level adds 0.06, so all nine at level five earn 29.16/hour. Collection keeps fractional earnings to nine decimal places, caps elapsed income at eight hours and prevents repeat collection or negative-clock payouts.
- A dedicated stall diorama with miniature durability bars displays all purchased decorations immediately: wall-hung neon, a top shrine shelf for Fu/Lu/Shou and the money tree, a middle shelf for incense, the waving cat and a smiling amethyst cluster, and a lower shelf for the radio, sleepy tiger and aquarium. Level badges update in place; saved purchases return on reload. Brief placement bounces and small character animations respect reduced motion.
- Three collectible benefactors: café waiter, minibus driver and thoughtful neighbour. A completed ritual has a 35% chance to reveal an uncollected friend; each friend increases future ritual oil money by 5%. Names and short stories appear in the collection.
- The top three scores and inventory persist under `beat-bad-luck.stall.v1`. Corrupt saves fall back safely, unknown IDs are rejected, and unavailable storage falls back to this visit’s memory. A receipt and UI completion guard prevent double rewards.

## Decoration care

Each owned decoration starts with **30 real days** of durability, about 3.33% wear per day, including time away. Existing saves receive a fresh lifetime at migration; upgrades retain their expiry. Both the scene and shop show durability, with more dust/scuffs and a warning colour below 25%. The open page refreshes once a minute and settles again on return.

Repair restores a full 30 days without changing level. Its oil price is `ceil(base price × level × 25% × fraction worn)`, minimum one oil once wear is visible; almost-new pieces do not need repair. At zero durability, the piece disappears, its level is cleared and income stops at the exact expiry instant. The usual eight-hour offline payout cap remains. Rebuying starts at level one. Discard opens a confirmation dialog and removes the piece without a refund; cancelling keeps it. All care state is local to the current device.

## Presentation and integration

Local SVG artwork combines warm paper, concrete bridge beams, rainy skyline, three playful little ghosts and a small neon sign. No remote images, music files, microphone uploads or backend are required. Soft rain, a quiet four-bar background melody, tram-like chimes, metronome and kit impacts use Web Audio synthesis. Sound defaults on and unlocks on the first pointer or keyboard gesture. Both sound controls stay in sync; muting stops scheduled notes and ambience, while pause/background suspends audio. Re-enabling sound on the welcome screen starts the background again without stacking loops. Optional device speech requests a Hong Kong Cantonese voice when available, or the device’s language fallback; these are not studio-recorded voiceovers or real location samples.

Traditional Chinese is the playground default and English follows the existing language preference. The game is registered on the landing page, favourites, Pages deployment and shared winner celebration. Service-worker caches are scoped to this game and never remove another game’s cache.

Advertising SDKs, real-money purchases, professional recordings and server-wide seasonal events are not integrated. The implemented economy uses earned in-game oil money only.

See [VERIFICATION.md](./VERIFICATION.md). Browser QA uses the same optional Playwright setup as the other games:

```
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/browser-check.mjs
```

New keepsakes: spiked mace requires 360 merit and costs 440 oil; lucky pinwheel requires 500 merit and costs 520 oil; fortune-turning child requires 550 merit and costs 550 oil. Merit is an unlock threshold; purchasing spends oil only.

Stall upgrades sort by current next-upgrade oil price. Base hourly incomes are cassette radio 0.6, neon sign 1.2, incense stand 1.8, lucky cat 2.4, guardian tiger 3, feng shui aquarium 3.6, Fu/Lu/Shou 4.2. Tiger/aquarium/Fu-Lu-Shou start at 1210/6240/6270 oil and retain the five-level cap and base-cost × next-level pricing. Existing saves initialize new items at level zero.

Gesture verification: `node scripts/gestures-check.mjs` exercises real Chromium touch input for ordinary two-finger taps, rubbing, circles, one-score pinches, cancellation/pause, keyboard alternatives, rhythm prompts and six viewport sizes. Pure geometry and score/QTE guards are covered by unit tests.

Two shortcuts below the equipped kit select the Kits or Stall tab, focus the selected tab and scroll it into view. All nine upgrade rows have distinct local SVG icons alongside their names, rates and prices. Beat the Bad Luck is the first default landing card; saved player favourites still work.

Paper wear now combines elapsed whack time (45%) and cumulative score up to 1,800 (55%). It progresses from creases to cracks, folded edges, missing corners and punctures without resetting when every 50 damage scatters a worry. Pause freezes wear and a new ritual restores clean paper.

On each hit the paper briefly switches to a crying face with tears, then returns to its calm expression. Lit incense now has a flame seated on the tip, a warm halo, ember and wispy smoke; blowing removes the flame while preserving the ember/smoke. Five-level upgrades retain existing saves and use the same base-cost × next-level pricing.

Comic feedback now scales tool travel, paper squash, head/limb flailing, tears, torn scraps and synthesized boing sounds with hit power. Rub/circle speed and travel and pinch movement contribute to strength; buttons use a medium preset. Family/love worries join the presets. A smiling double-decker tram replaces the background text; instructions have opaque panels. The pork snack smiles and spins into a bouncing tiger with a synthesized chomp.

Paper wear now layers staggered jagged edge losses, fine fibres, highlighted crumple folds, a loose curled corner and a tiny repair patch. The head sags with cumulative wear, while the crying face keeps a single comic paper tooth. Fresh paper has no damage overlays; pause freezes wear.

New kits: 大鐵鎚 (400 merit / 550 oil), 賽馬會3T (5000 / 6000),六合彩金多寶 (6000 / 6500), and 投胎紙做李嘉誠個仔 (18000 / 18000). Their relief-score multipliers are ×4.55 / ×7 / ×10.5 / ×19.6. Each has distinct local SVG art and uses the existing single-ritual consumption. The fortune-child ID stays unchanged so owned kits and records use the new name 轉運童子 without losing progress.

Master Yip (葉師傅) replaces the previous character name throughout the game and landing copy. The shared logo wears the yellow ritual hat and robe in both the welcome and dialogue portraits, with repeating nods and hat wobble. Reduced motion keeps it still. During whacking, three original SVG ghosts drift, peek and pop up behind the action without intercepting input; the old passing prop is removed.

## Current prices and mobile audio

All fourteen original kits cost 200 oil more than their prior prices. The three premium kits have the further requested cumulative increases: Jockey Club 3T **5000 merit / 6000 oil** (fixed ×7), Mark Six Snowball **6000 / 6500** (fixed ×10.5), and rebirth paper **18000 / 18000** (fixed ×19.6). The iron hammer is 400 merit / 550 oil; the fortune-turning child is 550 / 550. Bare hands start free at ×1. Existing unused inventory remains available; after consumption the equipped fallback is bare hands.

Current decoration base prices, ascending: neon **1145**, incense **1155**, cat **1165**, radio **1190**, tiger **1210**, aquarium **6240**, Fu/Lu/Shou **6270**, money tree **6300**, amethyst **6340**. Upgrade and proportional repair prices use these bases; existing levels and thirty-day lifetimes are retained; hourly income is now 40% lower. The wallet section has 20px below it.

Mobile audio retries on touch endings, clicks and keys instead of discarding the first activation listener. Web Audio is primed synchronously within the gesture; supported Safari uses the playback audio session, and iOS additionally uses a local silent WAV media route. Mute/pause stop the route. Interrupted or closed contexts recover on a later gesture; waveform output, rather than only button labels, is checked in the browser tests.

All paid kits use explicit bonuses independent of their purchase price. Current premium values are 3T ×7, Mark Six ×10.5 and rebirth paper ×19.6; Lassie is ×18.2 and the immunity token is ×21. Free hands remain ×1.

## Expanded stall and prop collection

The shop now contains **27 decorations and 44 paid kits**, plus the always-free bare-hand fallback. See [EXPANSION.md](./EXPANSION.md) for all kit names, merit gates, oil prices and current score multipliers, plus all decoration prices and current hourly income, in price order. Existing prices, inventory, levels and expiry dates are preserved when older saves gain the new entries.

The eighteen new decorations appear immediately on a three-column extension below the original stall shelves. Each has a distinct local SVG, visible name, level badge, durability and the same upgrade/repair/discard rules. All twenty-seven at level five earn **108.78 oil/hour** before the unchanged eight-hour offline cap. Thirty new kits use their own artwork and sound pitch, explicit increasing score bonuses and the existing first-hit consumption rule. Kits sort by oil price, with rebirth paper pinned to the penultimate position; decoration rows sort by their next upgrade price. New bilingual names live inside this game’s catalogue so this update does not modify other games or shared language files.

Run `node scripts/expansion-check.mjs` with the usual Playwright module environment variable for the complete purchase/layout/translation/one-use/offline scenarios.

## Personalities, street stories and fortune keepsakes

Every worry now has a real weakness. Requirement/work-life gremlins emit up to two short-lived photocopies; click a copy or heavy-whack it away. Stocks ride a little paper roller coaster and reward the plunge. The pig teammate cycles helmet → pretend nap → snicker; protected hits give 35% normal points/damage, while snicker hits receive the normal weakness bonus. Other worries favour heavy strikes, circles, pinches, rubbing, precisely timed taps or alternating moves. Weakness hits give 40% extra points without changing kit multipliers.

Each round schedules two or three distinct flyover events, at 12, 32 and optionally 50 active seconds, for 5.4 seconds each. Match three 700ms tram bells, drag the actual paper worry under the rain awning (or use its button), or catch the windblown slipper. Awards are once-only and pause-aware. Any first score-producing interaction spends a paid kit, including an event handled before an ordinary whack.

Three optional neighbour stories have 3/4/3 chapters. Accepting a chapter chooses its worry; a completed matching ritual must satisfy the visible goal to advance exactly once. Story progress lights the street and unlocks three little thank-you keepsakes. Quitting or missing a goal never advances a chapter. Three skill challenges unlock stamps, selectable titles and actual paper/mascot looks: ten consecutive perfect whacks, a bare-hand commission chapter, and all five gestures in one round.

The layout editor moves any owned decoration into a labelled left-to-right, top-to-bottom shelf grid, with a reset to the original diorama. Owning the cat/meatballs/tiger, banana/paper phones or throne/dog dinner plus a Lassie friendship automatically presents a funny scene. Adjacent matching placements collect its scene; collected/available scenes can be replayed. Buying Lassie leaves a lasting companion flag even after the kit is consumed.

Every completed ritual adds a personal comic fortune, battered-paper/master photo and stamp to a recent 24-card album. Quotes depend on the worry type, kit, dominant gesture and performance. Custom worry text is never stored or exported. PNG export embeds the same logo-and-ritual-costume Master Yip locally; native file sharing is used when available, with a download fallback. Dates use Hong Kong time. New fields live under the existing save’s `neighbourhood` object and safely migrate older inventories, currencies, records, levels and ageing.

Finished stories offer a final-chapter replay, so missed bare-hand challenges remain obtainable without resetting gifts or chapter counts. Collected stall scenes remain replayable even if their physical props later wear out. The start button only activates after the game has finished initializing.

## Bigger bridge-side comedy collection

The collection now has **12 stall scenes, 9 event types, 15 skill titles/looks and 84 original bilingual fortunes**. See [COMEDY.md](./COMEDY.md) for combinations and goals. Existing prices, merit gates, hourly income, levels, story chapters, stamps and old fortune cards are preserved.

New scenes have three punchlines, large squash/stretch, an automatic rotation and manual Next punchline/Next scene controls. Reduced-motion players keep the same dialogue through manual controls. Previously collected scenes remain replayable after their props wear out. New events still appear only once or twice per round: pigeon cream delivery, a runaway receipt, auntie’s megaphone concert, a fuse-box strike, flying minibus coins and a tiger hiccup join the existing tram/rain/wind. Swipes, distinct coin tokens, matching gestures and a strict 700ms hold each have accessible alternatives; deadlines and paid-kit consumption remain guarded.

Twelve additional achievements include combo, copy-clearing, weakness and move challenges, plus twelve completed rituals, ten handled events and six collected scenes. Counters advance only after completed rituals and migrate older ritual totals. New fortunes use matching worry/move/kit/performance pools, avoid the recent sixteen choices, and store a stable fortune ID. A permanent quote collection complements the last 24 photo cards; all 84 quotes have complete Chinese/English SVG text and six printable comic themes. Custom worry text remains private and is never saved or exported.

### Ritual display and logo

The stall header uses the playground face with a small horn, a right-side scar and an upside-down 福 seal. Master Yip’s face is mirrored consistently in the welcome, in-game portraits, stall cover and exported fortune cards. A giggling slipper replaces the intro asterisk; decorative motion respects reduced-motion preferences.

During whacking, telemetry, event instructions, rhythm prompts, the arena, feedback and gesture buttons occupy separate layout areas. The character, paper copies, event targets and particles remain inside the arena, while event targets stay above decorative effects. Blackouts dim the arena without dimming instructions. The pause layer stays above the whole stage. Landscape uses a side panel for instructions and controls. Completed rain drags return the protected paper to the centre. Hit captions and points share the feedback row rather than stacking floating text over the paper.

Run `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/layout-check.mjs` from this directory against the development server for the 90-case event layout audit.

### Six signature ritual kits

The flying dagger, plunger nunchucks, beauty fist, solar torch, immunity token and blue-and-white flip-flop now have optional signature interactions. Twelve accepted ordinary hits fill the charge meter. A round allows two attempts, with eight active seconds of recovery after an attempt. Activation waits until a full six-second opening is available before the next bridge event or the round end; the original two/three-event schedule stays unchanged. Each interaction lasts up to five active seconds, followed by a short result pose. Success awards 50 base relief points multiplied by the equipped kit’s existing multiplier, exactly once. Missed or cancelled attempts award no bonus and charge no extra oil. Pausing freezes the timer and cancels any held pointer.

| Kit | Signature operation | Comic finish |
| --- | --- | --- |
| 小李飛刀 | Three ordered paper targets at 0.9/1.8/2.7s, with ±250ms timing windows. | Three paper worries become a paper kebab. |
| 馬桶塞雙截棍 | Hold the paper, pull at least 15% of the scene width in both directions, then release. Three equivalent buttons are available. | The stuck paper stretches and flies off with a pop. |
| 還原靚靚拳 | Five separate makeover taps, followed by the mirror. | Lashes, blush, bow, wig and hearts appear; the increasingly crumpled paper admires itself. |
| 太陽能電筒 | Move the torch to the left sunshine zone, accumulate 0.9s of actual daylight, then Shine. Clouds pass from 1.8–3s. | An uncharged torch gives two awkward flashes; a charged beam exposes the excuses. |
| 免死金牌 | Drag the token aside, drag the stamp inside its dotted box, then repeat for its appeal. Equivalent buttons are available. | 今日唔批 followed by 都唔批. |
| 藍白人字拖 | Alternate left/right/left/right on four 600ms cues, with ±240ms timing windows. | Both slippers clap the paper into a sandwich. |

The six kits also have ordinary-hit accents. The shop and welcome show each signature, the feedback-row button shows charge/readiness, and results show successful attempts and bonus points. Signature instructions replace ordinary prompts during the interaction; all targets stay inside the arena. Pointer-up handles touch and mouse buttons immediately, while native keyboard clicks remain supported. Reduced-motion preferences remove optional motion. Prices, merit thresholds, one-use inventory, existing multipliers, the 60-second whacking duration and stall earnings are unchanged. Timed targets use their own synchronized cue tones while the ordinary metronome is silent. New scripts and CSS are included in offline cache version 38.

Run `npm test`, `node scripts/kit-skills-check.mjs`, and `node scripts/layout-check.mjs` with the existing Playwright module environment variable and development server for verification.

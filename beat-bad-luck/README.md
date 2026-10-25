# Beat the Bad Luck · 鵝頸橋下：小人退散！

A solo, bilingual Hong Kong ritual game for the playground. Fong’s flyover stall turns everyday worries into cute paper gremlins, then ends with a kind fortune. Touch, two-finger play, mouse and accessible buttons work in the same browser game. The installable web app supports iOS/Android browsers, desktop, standalone previews and offline play.

Run `npm start` and open `http://localhost:5173/beat-bad-luck/`. No build step or runtime dependencies are needed. `npm test` runs the 25 game/gesture/economy tests. `node scripts/build-cover.mjs` regenerates the local SVG cover from the in-game artwork.

## Five-step ritual

A run lasts approximately **52–72 seconds**. The intro mascot uses the playground logo with a traditional Chinese yellow ritual hat and matching robe. Actions have a short settling time, while gentle timeouts keep every step moving:

1. **Incense:** tap each of three sticks, swipe across them, then use the blow button. Optional microphone access detects a sustained local sound; no audio is recorded, stored or uploaded. Denied/unavailable permission leaves the button available. Streams are stopped when their step ends, when paused and when leaving the page; a late permission grant is discarded.
2. **Name the worry:** choose a preset or type up to 64 characters before starting. The literal words appear on a paper slip and gremlin; they are never inserted as HTML or stored with records.
3. **Whack:** 45 seconds at a visible/audible **108 BPM** pulse. Tap within 95 ms of the beat for a rhythm bonus. Independent pointer tracking accepts two fingers; duplicate events on the same pointer within 55 ms are ignored. Swipe at least 60 px for a heavy strike, with power based on travel and speed. Combos span gaps of up to 800 ms; seven rhythm prompts cover double taps, heavy swipes, rubbing, circles and pinching. Rub with three clear direction changes, draw a full circle in either direction, or move two separated fingers inward for distinct special strikes. Trails and a charge ring follow the gesture, and the paper shakes, spins or squashes on release. Five move buttons provide equivalent single-pointer and keyboard actions. They are hidden at the start of each ritual; Show controls reveals them, and Hide controls or Escape collapses them. Worry silhouettes get a randomly chosen paper colour and small accessory. Paper creases, tears and gold scraps follow damage; every 50 damage scatters another paper worry.
4. **White tiger:** drag the pork into the paper tiger’s mouth. Close drops get magnetic attraction, the mouth opens, and feeding gives a small reward bonus. The feeding button provides the same action without dragging.
5. **Good fortune:** tap the talisman to turn the paper into gold light. One result awards relief points, oil money, merit, a kind fortune, a possible new friend and a spot in the top-three scores.

Pausing freezes the model clock and inputs; hiding the page pauses too. Resuming excludes paused time from the result. Quitting never grants ritual rewards. Effects respect reduced motion, and vibration is optional where the browser supports it. The fixed play panel keeps interactions clear of phone home gestures; the rest of the page becomes inert during a ritual.

## Stall, keepsakes and friends

- Ten equally powerful cosmetic kits: flip-flop, rolled newspaper, red-white-blue bag, folding stool, peachwood sword, jujube-wood seal, spiked mace, vinyl record, lucky pinwheel and fortune child. They have distinct synthesized strike timbres. Merit unlocks availability; oil money buys them, and re-equipping an owned kit is free.
- Seven decorations with five levels each: cassette radio, neon sign, incense stand, lucky cat, guardian tiger, feng shui aquarium and Fu/Lu/Shou. Upgrade costs rise by level. Their passive hourly oil rates are 3/4/5/6/7/8/9 per level. Collection keeps fractional earnings, caps elapsed income at eight hours and prevents repeat collection or negative-clock payouts.
- Three collectible benefactors: café waiter, minibus driver and thoughtful neighbour. A completed ritual has a 35% chance to reveal an uncollected friend; each friend increases future ritual oil money by 5%. Names and short stories appear in the collection.
- The top three scores and inventory persist under `beat-bad-luck.stall.v1`. Corrupt saves fall back safely, unknown IDs are rejected, and unavailable storage falls back to this visit’s memory. A receipt and UI completion guard prevent double rewards.

## Presentation and integration

Local SVG artwork combines warm paper, concrete bridge beams, rainy skyline, a passing tram and a small neon sign. No remote images, music files, microphone uploads or backend are required. Soft rain, tram-like chimes, metronome and kit impacts use Web Audio synthesis. Optional device speech requests a Hong Kong Cantonese voice when available, or the device’s language fallback; these are not studio-recorded voiceovers or real location samples.

Traditional Chinese is the playground default and English follows the existing language preference. The game is registered on the landing page, favourites, Pages deployment and shared winner celebration. Service-worker caches are scoped to this game and never remove another game’s cache.

Advertising SDKs, real-money purchases, professional recordings and server-wide seasonal events are not integrated. The implemented economy uses earned in-game oil money only.

See [VERIFICATION.md](./VERIFICATION.md). Browser QA uses the same optional Playwright setup as the other games:

```
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/browser-check.mjs
```

New keepsakes: spiked mace requires 360 merit and costs 240 oil; lucky pinwheel requires 500 merit and costs 320 oil; fortune child requires 550 merit and costs 350 oil. Merit is an unlock threshold; purchasing spends oil only.

Stall upgrades sort by hourly oil per level: cassette radio 3, neon sign 4, incense stand 5, lucky cat 6, guardian tiger 7, feng shui aquarium 8, Fu/Lu/Shou 9. Tiger/aquarium/Fu-Lu-Shou start at 110/140/170 oil and retain the five-level cap and base-cost × next-level pricing. Existing saves initialize new items at level zero.

Gesture verification: `node scripts/gestures-check.mjs` exercises real Chromium touch input for ordinary two-finger taps, rubbing, circles, one-score pinches, cancellation/pause, keyboard alternatives, rhythm prompts and six viewport sizes. Pure geometry and score/QTE guards are covered by unit tests.

Two shortcuts below the equipped kit select the Kits or Stall tab, focus the selected tab and scroll it into view. All seven upgrade rows have distinct local SVG icons alongside their names, rates and prices. Beat the Bad Luck is the first default landing card; saved player favourites still work.

Paper wear now combines elapsed whack time (45%) and cumulative score up to 1,800 (55%). It progresses from creases to cracks, folded edges, missing corners and punctures without resetting when every 50 damage scatters a worry. Pause freezes wear and a new ritual restores clean paper.

On each hit the paper briefly switches to a crying face with tears, then returns to its calm expression. Lit incense now has a flame seated on the tip, a warm halo, ember and wispy smoke; blowing removes the flame while preserving the ember/smoke. Five-level upgrades retain existing saves and use the same base-cost × next-level pricing.

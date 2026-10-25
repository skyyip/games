# Dice & Delight · 搖骰子

A **2–6 player** pass-and-play dice game. Choose **1–5 dice** and highest/lowest total, or **five-dice poker** (fixed at five dice). Each player makes one roll using a phone shake or the always-available button. Full rules and examples are visible in the game.

## Run

`npm start` serves the repository at `http://localhost:5173/`; open `/dice-party/`. `npm test` runs twelve dependency-free dice/hand/motion tests. No build step or runtime package is required. The landing card, favourites and Pages workflow include this directory.

## Rules

All players use the same count and mode for the whole round. No held dice, partial rerolls or second attempts. Players with identical comparison keys share the win; turn order never breaks a tie.

- **Highest total:** largest sum wins. Any equal sums tie, regardless of individual faces.
- **Lowest total:** smallest sum wins. Any equal sums tie.
- **Five-dice poker:** compare hand category, then its complete tie-break vector. The sum is displayed for reference and does not decide the poker winner.

The confirmed poker order, strongest first:

| Category | Tie-break order |
| --- | --- |
| Five of a kind | Repeated face |
| Four of a kind | Four's face, then kicker |
| Full house | Triple's face, then pair's face |
| Straight | Highest face: 2–3–4–5–6 beats 1–2–3–4–5 |
| Three of a kind | Triple's face, then kickers descending |
| Two pairs | Higher pair, lower pair, kicker |
| One pair | Pair's face, then kickers descending |
| High dice | All five faces descending |

There are no suits, flushes, straight flushes or wraparound straights. Four threes beat three fours, three fives beat three fours, and two sixes beat two fives. A straight beats a triple and loses to a full house. The in-game rule table includes every category, examples and every tie-break rule.

## Randomness and animation

On launch, generate the entire roll once. Web Crypto uses rejection sampling on a 32-bit value before taking modulo six, avoiding unequal face probabilities. A Math.random fallback supports environments without Web Crypto. Animation never consumes or changes the stored outcome. Repeated clicks/shakes while rolling are ignored.

The absolute reveal deadline is 1200ms plus 80ms per extra die. Dice tumble and display intermediate faces while rolling; at the deadline the stored result is revealed once. Reduced motion uses static question marks until reveal, with no fast face changes or tumbling. Die faces use local SVG pips and CSS bevels/shadows. Buttons support touch, mouse and keyboard.

## Phone motion

The first player's ready click invokes iOS motion permission synchronously, before awaiting its result. Permission is requested once; an explicit enable button allows retry. Unsupported/denied/silent motion always leaves button play available.

`ShakeDetector` accepts finite acceleration samples on all three axes, with gravity-subtracted fallback when linear acceleration is absent. Two readings of at least 10m/s², separated by 55ms and within 550ms, trigger one roll. Noise, duplicate timestamps and stale samples are ignored. Reset the detector between players and on visibility/focus changes; ignore motion while the document is hidden or outside the ready phase. Shake strength never changes the odds. Motion data stays on the device.

Changing to poker forces and locks five dice. Leaving poker restores the previous high/low dice selection. A whole match may be ended safely without revealing or advancing a pending roll.

## Language and offline

The landing language preference defaults to Traditional Chinese. Instructions, all eight hand rules, permission fallbacks, labels, results and metadata are bilingual. A dedicated five-dice straight label avoids colliding with the line games' translation of a straight line. User-entered names stay literal. No account, backend or long-term match history is used.

The scoped service worker precaches local game/shared party modules, CSS, language files, fonts and icons. Once Ready to play offline appears, offline reloads can complete full matches. Updates wait until existing game windows close; bump `CACHE_NAME` after editing cached assets. Opaque previews skip registration and still play with the button.

Optional browser QA: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright-module node scripts/browser-check.mjs`. See [VERIFICATION.md](./VERIFICATION.md).

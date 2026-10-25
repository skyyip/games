# Dice & Delight verification

## Model

Twelve Node tests pass. Exhaustively classifying all **7776** five-dice outcomes gives:

| Hand | Outcomes |
| --- | ---: |
| Five of a kind | 6 |
| Four of a kind | 150 |
| Full house | 300 |
| Straight | 240 |
| Three of a kind | 1200 |
| Two pairs | 1800 |
| One pair | 3600 |
| High dice | 480 |

Tests cover every category boundary, the user's repeated-face examples, each kicker/tie-break path, permutation ties, straight endpoints/no wraparound, every dice count in highest/lowest mode, immutable roll timing, repeated-input guards, shared winners, validation/cancellation, ordinary random face bounds, noise/stale/invalid motion and gravity-only detection.

The combined new-game suite passes 21 tests. The complete repository suite passes 235 tests.

## Browser

Twelve optional Chromium/Playwright checks cover:

- Full bilingual poker matches, literal player names, fixed/locked five dice and all eight translated rule rows.
- Four threes defeating three fours despite a lower sum; a straight defeating a triple. The Chinese straight label is 順子, independent of the line-game dictionary.
- A five-die roll stays hidden at 1519ms and resolves at 1520ms. Repeated button input cannot consume another random outcome.
- Ten complete highest/lowest matches covering every count from one to five.
- iOS-style permission grant/denial mocks, exactly one automatic permission request, motion-triggered rolls and always-available button fallback.
- Unsupported/silent motion, ties, replay and cancellation of an unfinished roll.
- Six-player/five-die layouts at 320×568, 375×812, 812×375, 768×1024 and 1440×1050, without horizontal overflow.
- Real service-worker installation, offline reload, full match and final comparison.
- No uncaught application errors.

Standalone and opaque `allow-scripts` previews complete full two-player poker games and replay with embedded assets and Chinese rules. Phone ready/result screenshots were inspected. The existing landing favourites suite also passes 14 checks for all fifteen cards.

Motion tests dispatch synthetic acceleration readings; physical iPhone/Android permission prompts and motion hardware remain untested. The button path requires no motion permission.

Twelve gameplay checks pass with six persistent 3D faces, red/blue pips and expanded hand names. Focused checks verify cube identity across animation updates, opposite faces summing to seven, all five result faces per player and explicit pair/triple values.

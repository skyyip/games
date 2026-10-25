# Mahjong Match · 麻將

A two-player pass-and-play game with **alternating turns** and **sudden death**. All **144 tiles** are used, including flowers and seasons. One target opens at random; 143 face-down tiles remain on the table. Match by the user's shared rank system, rather than exact face or suit.

Run `npm start` and open `http://localhost:5173/mahjong-match/`. `npm test` runs ten dependency-free tile/model tests. There is no build step or runtime package dependency.

## Rank equivalence

| Rank | Equivalent tiles |
| --- | --- |
| 1 | One Bamboo, Circle, Character; East; Red; Spring; Plum |
| 2 | Two Bamboos, Circles, Characters; South; Green; Summer; Orchid |
| 3 | Three Bamboos, Circles, Characters; West; White; Autumn; Chrysanthemum |
| 4 | Four Bamboos, Circles, Characters; North; Winter; Bamboo flower |
| 5–9 | Matching numbers across Bamboos, Circles and Characters |

Numbered tiles, winds and dragons have four copies each. Each of the four seasons and four flowers appears once. Ranks 1/2/3 contain 22 tiles each, rank 4 contains 18, and ranks 5–9 contain 12 each. Even a unique season or flower target has other same-rank partners. The full equivalence table is visible in the game.

## Two modes

- **Alternating turns:** a same-rank reveal is safe and passes play to the opponent; a different rank loses immediately.
- **Sudden death:** a different-rank reveal is safe and passes play to the opponent; revealing the target rank loses immediately, even if its face/suit differs.

Player 1 starts and can reveal immediately. Each safe reveal automatically starts the other player’s turn. A fatal first pick awards Player 2 the win. Used tiles and the target cannot be selected. The target/mode stay fixed throughout the round; the next round shuffles all 144 pieces and keeps the names and selected mode. No account, backend or long-term match history is used.

The table fits the target and all 143 other tiles into one playing viewport, with no scrolling inside the table. Revealed pieces remain visible, with an owner marker and a safe/fatal frame. The result compares target and last reveal, including both rank badges and an equals/not-equals sign. A short delay allows the reveal to settle before result focus moves. Reset cancels pending focus work.

Every face is local HTML/SVG: traditional glyphs, circle marks, bamboo strokes, winds, dragons and indexed seasons/flowers. Physical glyphs remain authentic in either language; interface labels, accessible names, instructions and rank rules are bilingual. Names stay literal and are limited to 24 characters.

The landing language carries into the game, defaulting to Traditional Chinese. The scoped service worker caches modules, shared party/UI/language assets, fonts and icons. Wait for Ready to play offline. Updates wait until existing game windows close. Opaque standalone previews skip registration and still support both modes.

See [VERIFICATION.md](./VERIFICATION.md). Optional browser QA: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright-module node scripts/browser-check.mjs`.

The compact table measures available width and viewport height and chooses columns and tile dimensions that fit the complete set. Tiles are intentionally smaller than 44px to show all 144 pieces at once, as requested. Portrait and landscape layouts keep the target and current player visible. Resizing, rotation and font loading recalculate the layout.

Ivory faces have dark, saturated markings; jade backs display the website logo. The winner receives a gold name badge and trophy, with a short ribbon burst after the final tile reveal. Replay cancels pending celebration work. Reduced-motion preferences keep the static badge and trophy.

# Mahjong Match · 麻將

A two-player pass-and-play game with **alternating turns** and **sudden death**. All **144 tiles** are used, including flowers and seasons. One target opens at random; 143 face-down tiles remain on the table. Match by the user's shared rank system, rather than exact face or suit.

Run `npm start` and open `http://localhost:5173/mahjong-match/`. `npm test` runs twelve dependency-free tile/model tests. There is no build step or runtime package dependency.

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

- **Alternating turns:** Player 1 reveals, then Player 2 reveals. Decide only after the complete pair. If exactly one player matches the fixed target rank, that player wins. Two matches or two misses start another pair, again with Player 1. Previously revealed tiles stay used; the target stays fixed. If a tied pair leaves fewer than two tiles, the match ends in a draw.
- **Sudden death:** each new game or replay randomly chooses either player to start, with equal probability. A different rank passes to the other player; matching the target rank loses immediately, even when its face/suit differs. The draw order and current player are visible.

No handoff confirmation is needed. Used tiles and the target cannot be selected. A fresh game shuffles all 144 pieces and keeps the names and mode. Paired games show the pair number during play and both player tiles beside the target at the end. Winners receive the shared trophy and ribbons; exhausted-table draws have no winner decoration.

“Change game mode” returns to setup, focuses the mahjong-mode dropdown and scrolls its label and control into view. Reduced-motion preferences skip the smooth scroll. No account, backend or long-term match history is used.

The table fits the target and all 143 other tiles into one playing viewport, with no scrolling inside the table. Revealed pieces remain visible, with a blue (Player 1) or rose (Player 2) frame and a matching numeric owner marker. Sudden-death results compare the target and fatal reveal with rank badges and an equals sign. Paired results compare the target with both named players’ tiles and show whether each matches. A short delay allows the reveal to settle before result focus moves. Reset cancels pending focus work.

Every face is local HTML/SVG: traditional glyphs, circle marks, bamboo strokes, winds, dragons and indexed seasons/flowers. Physical glyphs remain authentic in either language; interface labels, accessible names, instructions and rank rules are bilingual. Names stay literal and are limited to 24 characters.

The landing language carries into the game, defaulting to Traditional Chinese. The scoped service worker caches modules, shared party/UI/language assets, fonts and icons. Wait for Ready to play offline. Updates wait until existing game windows close. Opaque standalone previews skip registration and still support both modes.

See [VERIFICATION.md](./VERIFICATION.md). Optional browser QA: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright-module node scripts/browser-check.mjs`.

The table uses tiles at least 44px wide and 60px tall, with vertical scrolling for the full set. The target and current player stay above the scrollable deck. Resizing, rotation and font loading recalculate the columns. Bamboo pips use alternating red/green accents.

Ivory faces have dark, saturated markings; jade backs display the website logo. The winner receives a gold name badge and trophy, with a short ribbon burst after the final tile reveal. Replay cancels pending celebration work. Reduced-motion preferences keep the static badge and trophy.

Player identity colours also appear beside setup names, in the current-player badge and reveal history, and around the player tiles in results. They remain tied to the player when sudden death randomizes the starting order. Revealed tiles expose the owner name through `aria-description`; replay clears previous ownership.

# Pocket Poker · 撲克牌

A local **2–6 player** card comparison game. All 52 shuffled cards are placed face down on a felt table. Player 1 can immediately reveal a card; each reveal automatically passes the turn to the next player. Selected cards stay visible on the table with their owner badge and appear in that player's hand. Scroll within the table to explore the whole deck.

Run `npm start` and open `http://localhost:5173/poker-party/`. Run `npm test` for nine model/ranking tests. There is no build step or runtime package dependency.

## Modes

- **Five-card stud:** each player draws five cards, one per alternating turn. Compare straight flush, four of a kind, full house, flush, straight, three of a kind, two pairs, pair, high card. Compare every relevant rank/kicker. A2345 is five-high; 10JQKA is ace-high. Suits never break a stud tie; exact rank ties share the win.
- **Big Two, five-card comparison variant:** collect five cards. Rank 3 through A, then 2. Equal single ranks compare spades, hearts, clubs, diamonds. Categories are straight flush, four plus a kicker, full house, flush, straight, then unmade hands. This table uses consecutive Big Two rank order: 34567 is lowest and JQKA2 highest, without wrapping 2 back to 3. Compare straight top cards including suit; quads by repeated rank then kicker; full houses by triple then pair; flushes by their sorted single cards. A drawn hand without a valid five-card combination is a scatter/unmade hand and compares sorted single cards as an explicit fallback for this drawing game. This is not a full thirteen-card shedding game.
- **Single-card duel:** one card each. A is highest, 2 lowest, with the same suit order breaking equal ranks.

All variant details and examples are listed in the game before play. The deck has no jokers, replacements or repeated selections. Mode and count remain fixed throughout a round. The shared deck uses Fisher–Yates shuffling. Model phase guards prevent a double click from claiming the next player's card.

Names remain literal, are limited to 24 characters, and are inserted as text. Results show every hand and the comparison type. New round uses the same friends/mode with a freshly shuffled deck; Change rules returns to setup. Rounds are in memory and require no account or backend.

The shared landing language carries into the game; Traditional Chinese is the default. A scoped service worker caches local game modules, party controls/CSS, UI/language, fonts and icons. Wait for Ready to play offline. Updates wait until existing app windows close. Opaque standalone previews skip registration and play normally.

See [VERIFICATION.md](./VERIFICATION.md). Optional browser checks: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright-module node scripts/browser-check.mjs`.

The compact table uses adaptive columns, tighter spacing and smaller face labels while keeping at least 44px card targets. Table height adapts to the viewport so more cards fit at once.

Revealed cards use dark ink and saturated red on ivory, without dimming selected faces. Navy backs display the website logo. Winners, including shared winners, receive a gold name badge, trophy and a brief ribbon burst. Reduced-motion preferences keep the badge and trophy without animation.

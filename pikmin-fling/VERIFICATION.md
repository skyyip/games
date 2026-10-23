# Pikmin Fling verification

Verified using Node.js 24 and headless Chrome through the existing optional Playwright installation. No dependency was installed.

## Core logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js
```

**37 tests passed**, including 7 new tests covering:

- Timer starts once, counts unique arrivals and freezes at the final arrival rather than final launch.
- All counts, reset, duplicate/invalid input and rejected stale arrivals.
- Upward fast flings and slow swipes; rejected taps, tiny/sideways/downward gestures.
- Parabolic start/end positions and unique random fenced slots with valid character types.
- Independent fastest-three records, full precision, ties, slower fourth results, persistence and dates.
- Malformed, blocked and full localStorage.

## Browser checks

Start the local server, then use an existing Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PIKMIN_FLING_URL=http://localhost:5173/pikmin-fling/ \
node pikmin-fling/scripts/browser-check.mjs
```

**23 checks passed**:

- Idle clock and disabled board; all six local character assets load.
- Complete 20/30/40 games with upward mouse gestures, rejected taps and wrong directions, mouth opening, unique arrivals, stopped timing and highlighted new records.
- Independent records after a real reload, top-three limits and sorting after repeated games.
- Reset during flight cancels pending arrivals and saves no unfinished result.
- Touch cancellation, two simultaneous touch throws, no page scrolling during a throw, and tap-plus-feed alternative.
- 320/375/430/600/768/1024/1440px layouts, no horizontal overflow, 44px targets and stable 40-character board.
- Replay and fresh state; keyboard focus/Enter/Up Arrow on a short 320×568 screen.
- Reduced-motion sprites fade in place; blocked storage still permits completion and in-memory records.
- Corrupted storage recovers; standalone manifest/icons and every character work during a complete offline game and a fresh offline tab.
- Navigation returns to the five-game landing page, with no uncaught browser errors.

Online analytics requests were stubbed. Screenshots default to `/tmp/pikmin-fling-qa`; mobile boards, the open mouth/flight and completed results were visually reviewed.

The shared `grid-rush/scripts/ui-check.mjs` suite passed **19 checks** across all five games, including mobile two-column landing cards, supplied icons, return navigation, touch feedback and reduced motion.

Chrome touch emulation was tested. Physical phones, other browser engines, screen readers and native operating-system installation were not tested.

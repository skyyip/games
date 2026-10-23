# Pikmin Fling

Clear a fenced garden of 30 wandering Pikmin by feeding a hungry plant. Choose **Normal**, **Challenge** or **20s Rush**. All modes begin with 20 normal (leaf), 5 bud and 5 flower Pikmin. Red, yellow, blue, ice (light blue), rock (black) and winged (pink) characters are mixed randomly, with matching leaf/bud/flower artwork and visible gesture badges.

Play at [skyyip.github.io/games/pikmin-fling/](https://skyyip.github.io/games/pikmin-fling/).

## Run locally

Node.js 20 or newer; no dependencies or build step.

```sh
cd pikmin-fling
npm start
```

Open **http://localhost:5173/pikmin-fling/**. The server also serves the landing page and other games. Use `PORT=8080 npm start` for another port. Run core tests with `npm test`.

## Play

Start the game to start the clock and let the crowd wander inside the larger fence. Characters take longer walking routes, turn when blocked, and alternate their feet while their bodies bob. Held, linked or focused characters pause.

| Growth stage | Touch / mouse gesture |
| --- | --- |
| Normal / leaf ↗ | Swipe upward and release. |
| Bud 2× | Tap the same Pikmin twice within 350ms. |
| Flower ✿ | Hold still for at least 1 second, then swipe upward and release. |
| Any stage: chain | Short press for 200ms until highlighted, keep pressing and drag through others of the **same stage**, then finish with an upward flick. |

Chains can mix character colours, but never growth stages. All three stages can form a group after a 200ms short press; a single flower still requires its full 1-second stationary charge. Its ring continues to show that solo charge while the linked highlight signals that dragging can begin. Tracing through a different stage leaves it unselected. The final flick uses the upward end of the gesture, so a sideways tracing path does not spoil the throw. Pausing after the drag and then flicking also works with a single coalesced touch move; an old flick cannot be reused after waiting. Releasing without a flick cancels the chain. Multiple pointers may independently hold or fling different Pikmin.

Every throw automatically follows a parabolic path into the mouth. The cartoon plant sways gently above the rounded cream fence. Throws track the mouth as it moves. The plant opens, the character disappears on arrival, and the plant bites. In Normal and Challenge, the **last arrival** stops the timer. In 20s Rush, the round ends at 20 seconds or when the garden is cleared, whichever comes first. Play again starts a fresh round; Reset round clears the timer, selections and in-flight characters without saving an unfinished score.

### Challenge mode

Every random **3–8 seconds**, choose a new random count from each group:

- 1–5 buds become flowers.
- 1–5 flowers return to normal.
- 1–10 normal Pikmin become buds.

Each group is sampled without replacement from the states at the start of the wave, capped at the number available. Changes apply together; no character changes twice in a single wave. Held, linked, focused, selected, pending-double-tap and flying characters keep their current state. The countdown shows the next wave. Cycles continue until completion or reset. Returning from a background tab applies one due wave and schedules the next, avoiding a burst of missed changes.

### 20s Rush

Clear as many of the same 30 Pikmin as possible within **20 seconds**. The countdown starts immediately with Start game. This mode uses the same recurring 3–8 second growth waves and gesture protection as Challenge.

- Normal / leaf: **1 point**.
- Bud: **2 points**.
- Flower: **3 points**.

Each unique arrival in the mouth adds the value of its growth stage. Flying Pikmin keep their launch stage. Throws that have not arrived before the deadline earn no points. The score counts upward, pulses and shows a floating points gain; reduced motion shows the total immediately. Clearing all 30 finishes early and totals the score. Otherwise the 20-second deadline disables the remaining characters, releases held gestures and removes unfinished flights.

This mode keeps the **highest three scores**, separately from the other modes’ fastest times. Scores, date, new-result highlighting and personal best feedback survive a refresh. Equal scores preserve the older result’s order and do not count as a new personal best.

### Accessibility

A tap selects and pauses a character; **Feed selected** is a single-pointer alternative to dragging and timed gestures. Keyboard: Tab to a character, then Enter, Space or Up Arrow to feed it. Focus advances to the next remaining character. These alternatives intentionally work for all three growth stages. Escape cancels a pointer chain. Pointer cancellation, tab hiding and loss of window focus also release active gestures.

Native character buttons have visible focus, labels naming their growth stage, and distinct symbols as well as character artwork. They measure 44×58px in the regular page and 44×44px in the compact play view. Native text/image selection, tap highlighting, artwork dragging and long-press menus are disabled throughout the fence. Reduced motion keeps the crowd stationary, disables walking, footsteps, plant sway and bite effects, and substitutes an in-place fade for flight. Flight duration and timing stay the same.

### Fixed phone play view

On small screens and touch devices, starting any mode opens a fixed play view that fits the visible viewport. The page cannot pan while playing, including when a swipe starts in the blank fence or misses a character. A fixed-body lock, local touch-action rules and a non-passive single-touch fallback prevent unwanted page scrolling. The garden adapts to portrait/landscape space while retaining 44px character targets; rotation repacks their positions without changing their types, growth stages or scores. The regular desktop mouse layout remains available.

The existing Reset round button moves into the play view as **End round**. It resets without saving an unfinished round, then returns to mode controls. Completion and the 20-second deadline also release the lock, restore the page, and show results. Covered navigation and sidebar controls are inert while the fixed play view is active. Idle/completed pages retain native scrolling. The stage guide stays visible in portrait; very short landscape screens prioritise the garden, timer/score and action buttons. Full instructions remain on the setup page and character labels retain their gesture instructions.

## Structure

```text
index.html                 Mode controls, stage guide, garden/plant SVG, results
styles.css                 Responsive garden, walking, charge rings and linked states
src/game.js                Roster, deadline, stage scoring, gestures and growth waves
src/interaction.js         Walking/separation, pointer gesture, double tap, flight geometry
src/leaderboard.js         Safe local storage and separate top-three mode rankings
src/app.js                 Pointer/keyboard input, frame loop and DOM rendering
assets/pikmin/             Local character and growth-stage artwork
assets/README.md           Artwork sources and credits
manifest.webmanifest       Standalone app and shared cat icons
sw.js                      Scoped, versioned offline cache
tests/                     Dependency-free Node tests
scripts/browser-check.mjs   Original-mode Chrome, touch, responsive and offline checks
scripts/timed-check.mjs     Countdown, animated scores, cancellation and score records
scripts/scroll-check.mjs    Fixed play view, real touch scrolling and exit restoration
```

## Timing and records

`performance.now()` measures elapsed milliseconds. `requestAnimationFrame` refreshes the clock, advances roaming and draws each 480ms flight. Unique ready → flying → eaten transitions prevent duplicate scoring. Timed mode checks its absolute `performance.now()` deadline before growth, launch and arrival; `setTimeout` also ends the round when frame updates are suspended. Its elapsed duration is capped at 20,000ms, so a late callback cannot extend the scoring window. Reset cancels the deadline and score animation as well as gameplay work. Reset cancels gestures, effects and flights before replacing the roster.

The **`pikmin-fling.records.v2`** localStorage key contains independent `normal` and `challenge` arrays. Each time entry stores full-precision milliseconds and an ISO date. The additional `timed` array stores integer `{score, date}` entries, ranked highest first. Timed scores must be integers from 0 to 90; malformed entries are ignored. Adding this array preserves existing Normal and Challenge records. Reads validate, sort and cap each array at three. A slower fourth result leaves the existing three intact. Equal times keep their original order and do not count as a new personal best. Display rounding never changes stored times.

The previous `pikmin-fling.records.v1` count-based records are left untouched. They are not mixed with the new modes because the rules differ. Malformed storage is discarded safely; unavailable/full storage falls back to in-memory records with a visible notice.

## Offline

After a successful online load, wait for **Ready to play offline**. The scoped service worker caches all 18 growth images, game code, shared UI, fonts and icons. Supporting browsers can install the game using their native action. Updates wait for existing app windows to close; reopen to use the updated version. Bump `CACHE_NAME` when editing cached assets.

Pikmin artwork © Nintendo; this is an unofficial fan game. The plant and fence use local SVG markup. No gameplay backend or external artwork server is required. See [VERIFICATION.md](./VERIFICATION.md) for verification results.

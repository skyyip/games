# Memory Trace · 考你記憶

A local **2–6 player** memory drawing game. Each player privately sees the same randomly generated outline in the same place for **three seconds**, then redraws it after it disappears. After everyone finishes, reveal the overlap percentages, winners and original/drawn overlays.

## Run

`npm start` serves the repository at `http://localhost:5173/`; open `/memory-trace/`. `npm test` runs nine dependency-free model/scoring tests. There is no build step or runtime dependency. The root landing card, favourite and Pages workflow include this game.

## Turns and privacy

Setup accepts two to six names, up to 24 characters each. A handoff cover conceals the board until the named player presses ready. The next handoff never exposes the preceding drawing, its score or the target. All players get one view of the same shape; a new round generates a new shape.

`performance.now()` sets an absolute 3000ms deadline. A frame loop updates the countdown, with a timeout as backup. Submitting is impossible until the viewing phase ends. Leaving/hiding the window immediately ends the view, without granting another look. The board keeps the same dimensions and normalised coordinates for viewing and drawing. Resizing redraws the same geometry rather than generating a different shape.

Touch, mouse and pen can draw multiple strokes. Undo removes a whole stroke; Clear starts the current drawing over. A blank or single-point drawing cannot submit. Points outside the board are clamped at its edge. Cancellation ends the current stroke safely. There is a generous 64-stroke/5000-point bound to keep scoring and input work bounded.

Keyboard users focus the board, move with arrow keys (Shift for larger steps), and toggle pen up/down with Space. Submit using the native button. Repeated Space keydown events cannot keep toggling the pen. Names are rendered as text and marked literal so language translation does not alter them.

## Shapes and overlap

Eight irregular radial families produce clouds, wavy leaves, flowers, wonky stars, comets, crowns, pebbles and heart-like contours. Each round varies family, phase, rotation, scale and centre, keeping the closed outline inside the board.

The scoring algorithm measures **outline agreement in the original position**, not a repositioned or resized best fit:

1. Rasterise the original outline and submitted strokes on a fixed 256×256 grid, independent of display size and device pixel density.
2. Count unique occupied cells; drawing over the same line cannot create extra credit.
3. Allow a circular four-grid-pixel tolerance for natural finger wobble.
4. Compute coverage (fraction of the target near the drawing) and precision (fraction of the drawing near the target).
5. The percentage is the harmonic mean, `100 × 2 × precision × coverage / (precision + coverage)`, rounded to one decimal place. Zero coverage yields zero.

An exact outline receives 100%. Missing parts reduce coverage; extra scribbles reduce precision. Moving or resizing a shape changes its overlap. Rank by the displayed one-decimal percentage; equal percentages share the win. Each submitted answer is copied so later edits cannot change it. Results let players select each drawing to compare the green original with the coral reconstruction.

## Language and offline use

The shared language preference defaults to Traditional Chinese and carries from the landing page. All instructions, rules, prompts, percentages and metadata support English/Traditional Chinese; entered names remain unchanged. Rounds stay in memory: no server, account or long-term drawing history is used.

The scoped service worker precaches local modules, fonts, shared party/UI/language assets and icons. Wait for Ready to play offline before an offline reload. Updates wait for existing app windows to close. Bump `CACHE_NAME` when changing cached assets. Opaque previews skip offline registration and still support a full game.

Optional browser QA: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright-module node scripts/browser-check.mjs`. See [VERIFICATION.md](./VERIFICATION.md).

Results show the original green dashed outline and all player drawings in six distinct colours. Each player also gets a labelled side-by-side comparison canvas in the results gallery.

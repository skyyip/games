# Memory Trace verification

## Model and scoring

Nine Node tests pass for all eight shape families/bounds, closed contours, exact/reversed/resampled 100% matches, finger-wobble tolerance, size/position penalties, missing and extra ink, duplicate stroke handling, malformed drawings, exactly 3000ms viewing, phase guards, private turns, ties, interruption and immutable answer snapshots.

The combined new-game suite passes 21 tests. The full repository suite passes 235 tests, including the previously added Flick Force game.

## Browser

Ten optional Chromium/Playwright checks pass:

- Traditional Chinese and English complete two-player matches using native CDP touch drawing.
- The preview remains visible at 2999ms and hides at 3000ms. Drawing/submitting is locked during preview.
- Exact drawing scores 100.0%, a displaced small drawing loses, and scores/drawings stay hidden between turns.
- Literal player names, ranked winners, selectable comparison drawings and fresh-round replay.
- Focus interruption hides the shape, without another look. Undo, clear and keyboard drawing work.
- Six-player setup at 320×568, 375×812, 812×375, 768×1024 and 1440×1050, with stable board sizing and no horizontal overflow.
- Real service-worker installation and offline reload, then a complete viewing/drawing/submitting turn.
- No uncaught application errors.

Both the embedded standalone preview and an opaque `allow-scripts` sandbox complete a full two-player game and replay with Chinese UI. Modules, fonts, CSS and icons are embedded. Isolated frames use their native three-second timer. Mobile view/drawing/results screenshots were inspected.

The shared landing favourites suite passes 14 checks with all fifteen games. Tests emulate touch in Chromium; physical Safari/pen hardware is not covered.

# Mobile UI pass 02 — verification report

## Scope
- Target: 390 × 844 CSS-pixel mobile viewport, device scale factor 3.
- Browser engine: Chromium (automated mobile emulation; not a physical handset).
- Completed full 10-question sessions for Dog and Cat factions.
- Re-tested scratch reveal, rapid tap, runaway answer, dog treat, cat paw, hold-to-confirm, result screen and poster rendering.

## Results
- Both sessions reached the result screen after all 10 questions.
- Both sessions retained 100 HP when the correct answers and interaction success paths were used.
- No page-level JavaScript exceptions or console errors were recorded.
- `document.documentElement.scrollWidth` remained 390 px at the start and result screens; no horizontal page overflow was observed.
- Result poster canvas rendered at 1080 × 1920; displayed preview width was 334 CSS px.
- Existing Node test suite: 2 tests passed, 0 failed.

## UI refinements from the mobile pass
- Reflowed the progress dots onto their own full-width row below the hint control; this fixed the earlier horizontal overflow.
- Removed duplicated intro stats from the home hero and hid secondary faction descriptions on narrow screens.
- Tightened the HP/timer HUD and made interaction panels/buttons more thumb-friendly.
- Increased mobile poster preview width and made the download action full-width, with share/retry actions beneath it.
- Kept the question hint area collapsed when empty, so it only appears for meaningful feedback.

## Limitations
This is Chromium mobile emulation, not testing on physical iOS/Android devices. Safari/WebKit, Firefox, native share-sheet behavior, actual file downloads on mobile hardware, and PWA installation/offline behavior were not validated in this pass.

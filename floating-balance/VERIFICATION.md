# Verification

The complete repository suite passed **184 unit tests**, including **nine floating-board model tests**. Coverage includes all shape boundaries and marble margins; actual falls on all three shapes with frozen survival time; four-direction correction and bounded diagonal input; two-minute corrective survival through repeated disturbances; warnings, parcel/earthquake momentum; fixed-step consistency; pause/interruption behaviour; replay/abandonment and independent longest-three records.

**15 browser checks passed** with system Chromium and the workspace's optional Playwright installation. Both languages play all three shapes through actual edge crossings, save separate records, rank the longest three and restore them on reload. Keyboard input changes real position; pause/resume and lost focus freeze time, and abandonment does not save. Synthetic four-axis phone data verifies calibration, movement, stale-reading pause and switching to touch. Missing/declined/silent readings offer a complete fallback run.

Real touch input rolls the marble off a triangle at 320×568, 375×812, 812×375 and 768×1024. Result and pause actions stay in the visible board and pass a centre hit test. Replay restores input; quitting restores page scrolling. Blocked/full storage retains visit-only times. A fully cached offline round completes with a saved record. No uncaught browser errors occurred.

The stale-sensor check exposed a retained force that could move a marble beyond the edge before a two-second timeout. The game now pauses after **650 ms** without valid orientation data, before that stale force can complete the fall. Phone calibration continues receiving samples during the countdown; missing initial data uses the explicit fallback path.

A standalone phone preview embeds all artwork, scripts, styles and fonts. It is tested in an opaque `sandbox="allow-scripts"` iframe without forms or storage access: default Chinese, three shapes, a complete fall, a visit-only record and a fresh replay. Screenshots of the shaded board and mobile result layouts were reviewed.

Shared integration passed **26 UI**, **14 favourites** and **18 touch/title** checks across the twelve-game site. Physical phone hardware, native iOS prompts, other engines and screen readers were not directly exercised. Sensor readings were simulated; real Chromium touch events used the device protocol.

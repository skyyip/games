# Flick Force verification

## Automated model and persistence tests

`node --test flick-force/tests/*.test.js` passes **12 tests**:

- Equivalent upward/downward flicks travel equally far; faster/longer gestures and useful pressure readings increase strength.
- Proportional gestures remain consistent across screen sizes.
- Missing/default/saturated touch pressure does not claim to measure physical force; pen and usable touch readings are distinguished from mouse input.
- Taps, horizontal drags, long holds and back-and-forth rubbing cannot launch.
- Invalid/duplicate samples and invalid animation steps do not poison a round or exceed its bounds.
- Analytic deceleration gives increasing distance, decreasing speed and the same final result across frame rates.
- Repeated launches, cancellation and replay obey the round lifecycle.
- Only the three longest full-precision results persist, stable ties retain earlier records, and unrelated game storage remains untouched.
- Malformed scores/storage are rejected; denied/full storage supports in-memory rankings.

The full repository unit run passed **214 tests**, including these twelve and all existing game suites.

## Browser checks

`scripts/browser-check.mjs` uses the existing optional Playwright installation and Chromium. **15 checks passed** covering:

- Native CDP touch swipes in Traditional Chinese and English, in both directions.
- Live coasting, metre values and three quality meters; no result or storage write before stopping; exactly one saved result and persistence after reload.
- Fully translated Chinese gameplay text, prompts, result and metadata.
- Short/horizontal gestures, pointer cancellation and simultaneous fingers.
- Focus-loss pause, frozen background time, explicit resume and cancellation without a record.
- Arrow-key simulated gestures, stronger holds, Escape and native mouse input.
- Reduced motion and blocked-storage fallback.
- Responsive viewports 320×568, 375×812, 430×932, 812×375, 768×1024 and 1440×1050, without horizontal overflow.
- The thirteenth landing card, its translated name, favourite reordering and game navigation.
- A real service-worker installation, offline reload and completed offline round with local records.
- No uncaught application errors.

The existing landing favourites suite also passed **14 checks** with all thirteen games.

## Preview and visual checks

The standalone preview embeds modules, fonts, styles and icons. Full rounds, Chinese labels, results, the leaderboard and replay passed both a normal preview origin and an opaque `allow-scripts` sandbox. Opaque previews retain scores in memory, and offline registration safely skips unsupported origins. The opaque frame uses its native animation clock; the parent test clock cannot accelerate an isolated frame.

Native touch smoke testing without a fake clock completed a 148.81m run after the final pressure/focus refinements. Phone ready/coasting/result and desktop/landscape screenshots were inspected. The runway follows the gesture into the coast without resetting its visual origin; its offset settles onto the final distance marker. Pointer results keep their natural visual appearance, while keyboard users retain visible focus and result focus management.

## Device limit

These checks use Chromium device emulation, not physical iPhone pressure hardware. Most screens cannot reliably measure finger force. The UI explicitly describes acceleration-based effort estimates and labels keyboard simulation; distances are game metres. Physical Safari/Android validation remains useful for real hardware pressure and browser-specific gesture behaviour.


## Toy-car visual update

This supersedes the earlier skateboard character and keyboard gameplay. The character is now a local SVG toy car inspired by the supplied cream/grey vehicle reference, with a softer rounded face, cheeks, star, glazed windows and dotted side panels. The game and generated landing cover share its markup. Coasting adds an effort face, headband, sweat, fluttering ribbon, distance-driven wheels, suspension bob, streaks, dust and a translated whoosh sticker. Pause freezes the pose; reduced motion removes car/road animation. The complete UI uses pastel peach, rose and mint colours.

All arrow-key launch handlers, simulated keyboard input and keyboard gameplay instructions are removed. Native link/button keyboard navigation remains available. Thirteen model/storage tests and fifteen browser checks pass, including explicit non-launch from arrow keys, mouse/touch coasting, wheel motion, pause, records, layout and offline play. Previous keyboard checks above describe the historical version.


## Front-facing orientation refinement

The later direction update replaces the angled side view with a centred front view: symmetrical front tyres, a centred windscreen/face and a level axle aligned with the road. Tyres use scrolling tread marks rather than side-facing rotating spokes. Body roll is limited to a small suspension movement. The cover is regenerated from the same frontal SVG. Pointer-only input, effort expressions, the pastel road, streaks, dust and translated whoosh remain.

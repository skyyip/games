# Pikmax Fling verification

Verified on 2026-10-24 with Node.js 24, system Chromium and the existing optional Playwright installation. No runtime or test dependency was added to the game.

## Core logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js
```

**69 repository tests passed**, including **29 Pikmax tests** covering:

- Thirty-character rosters with 20 leaves, five buds and five flowers; all seven types, including White.
- A 30,000ms deadline enforced before launches, growth and arrivals, including delayed background updates; unique 1/2/3-point scoring and early completion.
- Flower charging at the exact 599/600ms boundary, ordinary flings and double taps.
- Chains armed after 200ms, requiring both matching colour and growth stage; incompatible groups reject atomically.
- Coalesced touch input, fresh final flicks, duplicate membership rejection and expired gestures.
- Protected recurring growth waves, bounded walking, distance-based gait and paused characters.
- Separate rankings, validation and storage failures. v3 imports Normal/Challenge completion times from v2 while leaving old 20-second scores intact and separate from 30-second scores.

## Browser checks

Start the local server, then run each suite with an existing Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PIKMIN_FLING_URL=http://localhost:5173/pikmin-fling/ \
node pikmin-fling/scripts/browser-check.mjs
```

The original-mode suite passed **38 checks**:

- Each of seven character types completes a round with matching SVG leaf/bud/flower representations and flight clones.
- Mouse, keyboard, touch, double tap, charged fling, same-stage chains, cancellation, multi-pointer input and Feed selected.
- Challenge waves, records, reset during flight, repeated rounds and final-arrival timing.
- Native selection protection, responsive layouts from 320 to 1440px, 44px targets, reduced motion and blocked/corrupt storage.
- All 21 SVG type/stage combinations render offline, including a fresh offline tab; navigation and no uncaught browser errors.

The screen-lock suite (`scripts/scroll-check.mjs`) passed **14 checks** for touch/wheel scrolling, rotation, full-viewport gardens at six portrait/landscape sizes, covered controls becoming inert, End round, completion and timeout restoring normal scrolling.

The timed-mode suite (`scripts/timed-check.mjs`) passed **14 checks** for 30-second countdowns, scoring, growth waves, unfinished-flight cancellation, replay/reset, early clears, persistent rankings, touch input, reduced motion and offline play. Its deadline test pauses the test clock so automation latency cannot consume the intended final 300ms window.

The shared language suite (`grid-rush/scripts/language-check.mjs`) passed **16 checks**, including completed Normal/timed Pikmax rounds in Traditional Chinese and English, dynamic scores, records and offline language modules.

The improvement suite (`scripts/improvements-check.mjs`) passed **7 checks**:

- White characters render; ground characters have opposing arm/leg swings; only pink characters hover and flap wings.
- Selected characters have no frame, non-flower selections have no charge ring, and different-colour characters cannot join a chain. Keyboard focus remains visible.
- Exact 599ms rejection and 600ms flower launch with the countdown ring retained.
- At 320×568, 375×812 and 812×375, three consecutive timeout/replay cycles and an early-clear/replay cycle preserve full viewport coverage and clear internal scroll positions.
- No uncaught errors across these actions.

Replay screenshots in `/tmp/pikmin-improvements-qa` were visually inspected in portrait and landscape. The reported half-white frame was not reproduced in the initial Chromium baseline. The fix removes negative fixed-body positioning, cancels pending result scrolling, clears internal offsets, blurs hidden result controls and clips internal field overflow. Regression checks cover the suspected replay/scroll path; physical-device confirmation remains useful.

## Standalone preview

The standalone `/workspace/games-preview/pikmin-fling.html` embeds local JavaScript, styles, fonts and icons. A browser check verified default Traditional Chinese instructions, white characters, timed play, early completion and Play again without uncaught errors. A mobile screenshot was visually inspected.

Analytics requests were stubbed during QA. Chrome touch emulation was tested; physical iOS/Android devices, other browser engines, screen readers and native installation were not directly tested.

## Corner icon visibility

Browser checks passed in Chinese and English at 1440×1100, 320×568, 375×812 and 812×375. Each checked all three modes: icons start hidden, keyboard/touch controls show and hide all 30 badges, reset preserves the current choice, reload returns to hidden, and flower hold rings remain visible. All controls fit the viewport with at least 44px height. The 14 screen-lock regressions and the regenerated standalone preview (including its toggle, completion and replay) also passed.

## Plump character artwork

All 21 type/stage combinations were rendered together and visually inspected, including wider rock/ice silhouettes, white characters, yellow ears and pink wings. Body widths fit the existing SVG viewBox; the 375×812 garden retains 30 characters and its original touch targets. The seven improvement browser checks passed again for opposing limb motion, pink-only flight, chain selection, the 600ms flower ring and repeated portrait/landscape replay. Standalone previews were rebuilt with the updated vector sprites.

## Larger sprouts and rock moustaches

Rendered all 21 type/stage combinations with leaf, bud and flower ornaments enlarged by 10% around their stem attachment; only rock characters have the curled moustache. Visually inspected the full roster and checked the 375×812 phone garden. Leaf, bud and flower flight clones retain both changes and complete feeding normally. All seven improvement browser checks passed again, including limb/wing motion, selection, the flower ring and repeated replay. Standalone preview aliases were regenerated.

## Fence clearance and character refinements

The pickets are shorter and rails thinner, with a shared inset origin for walking and chain lines. Compact fields pack by full 44px touch targets; short portrait and landscape layouts reclaim room around the plant. All 29 unit tests, seven improvement browser checks and 14 screen-lock checks passed. At seven viewport sizes (320×568 through 1440×1100, including 568×320), 168 type/stage/gait/corner poses per size and four seconds of live walking stayed clear of the fence. Chain coordinates matched the field.

The final artwork keeps red and pink characters slightly slimmer, crowns at 110% of their original size, and a curled yellow-only tail behind the body. A focused browser check covers all 21 variants, tail movement and matching flight clones across the three growth stages. Desktop roster and phone screenshots were visually inspected. Standalone preview aliases were regenerated.

## Ice bow tie

All 21 variants were rendered and visually inspected: only the three ice growth stages wear the pastel bow tie. It sits below the face within the existing silhouette and follows the body rig. A 375×812 phone check verified all 30 ice characters and matching bow ties on leaf, bud and flower feeding flights, with no uncaught errors. Standalone preview aliases were rebuilt.

## Pikmax / 皮克鈍 naming

English presentation uses Pikmax Fling and Traditional Chinese uses 皮克鈍投投樂 across the landing card, titles, instructions, metadata, character labels, announcements, results and installable app name. The original route, favourite ID and score-storage keys remain compatible with existing bookmarks and saved data. The asset provenance document retains accurate source names and external URLs. All 16 language checks, 14 favourites checks and 33 character/favourites unit tests passed. A focused bilingual check seeded existing favourites and normal/timed records, completed rounds, and found no old names in displayed text or accessibility labels. Shared service-worker cache versions and standalone previews were updated.

## Centred buds

All seven bud variants now use a straight central stem and follow body motion without independent sprout rotation. A browser check verified the bud centre, exact stem-to-bud attachment and 110% ornament scale at three walking poses for each type; the resulting pose sheet was visually inspected. Standalone preview aliases were rebuilt.

## Blue ears and red belly button

All 21 variants were rendered and visually inspected: only blue has the rounded pink-lined head ears, and only red has the tiny curled belly button. The additions follow the existing body rig. Phone checks verified 30 matching characters and all three growth-stage feeding flights for red and blue, alongside the existing ice bow tie checks, without uncaught errors. The rebuilt standalone preview completed a timed round and replay.

The blue ears were subsequently reduced by 20% around their attachment points and the red navel enlarged by 35% around its centre. The 21-variant pose sheet was visually inspected again; red/blue phone and three-stage feeding-flight checks passed again.

## Three-legged white characters

All three white growth stages have left, right and centre legs; the other six types retain two. A focused browser check verified changing, staggered leg poses, all three legs pausing on focus or reduced motion, and matching three-legged feeding-flight clones. The three-stage artwork and 375×812 phone garden were visually inspected. All seven improvement browser checks and the rebuilt standalone preview also passed.

## Current 35-character version, Glow, Purple and natural walking

The current configuration supersedes the earlier 30-character baselines: 35 per round (25 leaf, five bud, five flower), eight starting types including Purple and an occasional ninth Glow type. Forty-two unit tests passed for the updated counts, scoring, Glow cap/protected interactions, separate strength-independent bonus, persistence and walking support/turning. Six bilingual browser scenarios cover every mode, Glow replenishment, the cap including flights, scored clears and replay. Dedicated Purple checks cover all modes and stage flight clones.

Seven improvement checks, 14 timed checks (including real CDP double taps), 14 screen-lock checks and 16 shared language checks passed. Timed gesture tests control virtual time so automation latency cannot exceed the double-tap window; score-animation creation is observed independently of real-time WAAPI completion. Seven viewport sizes pass 216 type/stage/edge poses each and four seconds of walking without fence overlap. Small phone/landscape views preserve 44px targets by reclaiming decorative guide space.

All 27 type/stage variants were visually inspected, including green Glow halos, round Purple bodies, pink-only eyebrows and crowns at 132% of the original size. Buds remain centred. Ground steps include a support/return phase, foot lift, distance-based cadence, gradual steering and time-based separation; white retains its three-leg gait, while pink and Glow hover; only pink has wings. Motion-reduction and held/focused characters remain still.

## Wrist bracelets, slimmer blue, floating Glow, grass and landing cover

All 27 variants were rendered and visually inspected. Purple wears two beaded bracelets with heart charms inside the arm rigs; blue uses the slimmer silhouette with its small ears retained. Glow follows the supplied reference with a green teardrop head, blue eyes, yellow flowers, a ghost tail, no legs/wings, a golden head halo and exactly two belly stripes. Its tail and body hover gently; pause and reduced motion stop the decorative movement.

Six bilingual Glow scenarios pass all modes, the cap including feeding flights, correct scoring and replay with the new halo/tail artwork. Purple and blue phone checks retain their details on all three growth-stage flight clones. Eight grass tufts sit beyond the interactive field and inherit pointer-events: none. Grass/hover checks cover 320×568, 375×812 and 812×375. The 42 unit tests and seven-size fence clearance checks passed again.

The static landing cover is generated from all nine current sprites using `node pikmin-fling/scripts/build-cover.mjs`; it loads at 480×260 and fits cards at 320, 375, 768 and 1440px. Fourteen favourites browser checks passed with the new image. Its game link and favourite ID retain their previous paths. Standalone landing/game previews were rebuilt.

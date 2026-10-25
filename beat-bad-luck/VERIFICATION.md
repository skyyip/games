# Verification

- **26 unit tests:** automatic 72-second and active 52-second rituals; phase/action guards; private literal worries; two simultaneous pointers; duplicate suppression; rhythm and heavy-strike scoring; combo/QTE behaviour; paper damage; pause/resume; feed/blessing bonuses; corrupt saves; merit/cost gates; all decor levels; capped idle income/fractions/backwards clocks; idempotent rewards; unique benefactors; and three best records.
- **16 browser checks:** full Traditional Chinese/English rituals, native simultaneous touch, mouse swipes, pause/resume, safe custom text, a single saved reward, friend arrival, reload, seven kit purchases/equips, decoration appearance/accounting, keyboard tabs, eight-hour income, optional/denied/late microphone permission, dragging and magnetic feeding, reduced motion, offline completion and blocked storage. No uncaught application errors were recorded.
- **Six play sizes:** 320×568, 375×812, 430×932, 812×375, 768×1024 and 1440×1050. The active panel and real hit target fit, remain unobstructed and avoid horizontal overflow. Quitting grants no ritual reward.
- **286 repository unit tests** pass after adding this game. Landing favourites pass 14 browser checks with all 18 games; language switching passes 16 checks; touch/title verification passes 24 checks, including double-tap zoom prevention on the new route.
- **Offline isolation:** installing the new service worker preserves a cache belonging to another game and reloads the new game offline. Home icons and manifest assets are verified for the new route; missing Apple icon links on Poker/Mahjong were also supplied.
- **Standalone previews:** the embedded HTML completes all five steps, scores strikes and awards its trophy in normal and opaque sandbox previews. The opaque preview is checked using its native browser clock, since Chromium places it in a separate process that the parent page’s test clock does not control.

Chromium simulates touch and permissions. Physical iOS/Android vibration, real microphone sensitivity and installed speech voices depend on the device and were not hardware-tested. Sound is synthesized and no real ad/payment or global live-event service is connected.

- **Three new keepsakes:** exact merit/oil thresholds, insufficient-merit/funds rejection, one-time purchase, free re-equipping, save restoration, game selection and record persistence are checked for mace, pinwheel and fortune child. Focused mobile browser checks verify all ten entries, Chinese/English names, prices, purchase deductions and equipped artwork.

- **New stall upgrades:** Traditional Chinese/English mobile checks cover seven items sorted by hourly rate, tiger/aquarium rates, all three upgrades and costs, visible decorations, old-save migration, hourly income and reload persistence.

- **Gesture expansion:** five pure-geometry tests and one score/QTE test cover jitter, incomplete paths, straight swipes, three-turn rubbing, both circle directions, narrow loops, pinch thresholds, bounded paths, matching-only bonuses and pause/deadline guards. Nine browser checks exercise native touch, pinch-once scoring, cancel/pause cleanup, keyboard alternatives, gesture prompts and six layouts with 44px buttons.

- **Latest UI checks:** both shortcuts select the correct tab, move keyboard focus and scroll into view in Chinese/English at 320/375/1440px. Fu/Lu/Shou is checked through three upgrades, rates, deductions and reload; the first landing card/embedded cover and all 14 favourite browser checks pass. All seven decor rows use unique SVGs.

- **Persistent damage:** Chinese/English browser checks verify 45 seconds of whacking, zero-input time wear, cumulative score wear across scattered worries, visible cut-out edges, paused wear, results and a clean replay. Both languages render seven distinct stall icons.

- **Five-level and feedback update:** Chinese/English checks buy all seven decorations through level five and verify the cap, total deduction, hourly rate and save reload. All ten worries switch to crying on hit and recover. All five move buttons remain visible and support keyboard use. Ignition checks verify tip alignment, glow, flicker and persistent ember/smoke after blowing. Nine native gesture/layout browser checks pass with expanded controls.

- **Comic feedback polish:** native gesture tests plus a complete ritual check cover family/love presets, the smiling tram, permanent controls, opaque hint surfaces, force-scaled paper/head/limb/tool animations, stronger paper scraps and animated pork/tiger feeding. The full repository has 286 passing unit tests.

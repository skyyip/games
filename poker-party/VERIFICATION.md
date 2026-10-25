# Pocket Poker verification

Nine unit tests pass for all 52 unique deck cards, every stud category, ace-low straights, all kicker comparisons, suit-independent stud ties, the documented Big Two variant, single-card rank/suit order, immediate alternating turns for 2–6 players, repeated-card guards, every mode's hand size, literal names, validation and reset.

Ten Chromium/Playwright browser checks pass for full English/Traditional Chinese stud games, native touch selection, double-pick rejection, straight flush over quads, all hand/rule output, ace-high single-card play, legal Big Two combinations over scatter, replay/cancellation and offline reload. Six-player tables at 320×568, 375×812, 812×375 and 1440×1050 show all 52 buttons with at least 44px target width and no page overflow. No uncaught errors were recorded.

The full repository unit suite passes 255 tests, including the recent toy-car UI and mahjong matching model. Local standalone and opaque sandbox previews are separately checked for complete matches, Chinese rules and replay. Actual physical device browser testing is not covered.

The latest checks cover immediate first picks and consecutive picks without a confirmation button, shared logo backs, literal winner names, trophy rendering, a 36-piece animated ribbon burst, replay cleanup and reduced motion.

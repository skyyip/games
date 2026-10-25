# Mahjong Match verification

Ten unit tests pass for the 144-piece/42-type set, ordinary four-copy and flower/season single-copy counts, every local face, invalid kinds, the complete rank equivalence table, rank populations, remaining matches for unique targets, both modes' opposite loss conditions, first-turn fatalities, duplicate/target rejection, phase guards and reset.

Thirteen Chromium/Playwright checks cover full bilingual matches in both modes, native safe reveals, cross-face equal ranks, winner identity, equals/not-equals result labels, fresh replay, all 143 hidden buttons and seven screen sizes. A dedicated Spring target test verifies that a single-copy season matches an ordinary rank-one face and triggers sudden death. The offline reload completes a real round with cached tile art, code and translations. No uncaught application errors were recorded.

The complete repository suite passes 255 tests. Separate standalone/opaque sandbox checks cover full matches in both modes, Chinese rules and replay. The target and all 143 selectable tiles fit within a single viewport at 320×568, 375×812, 430×932, 568×320, 812×375, 768×1024 and 1440×1050, without page overflow. Tile sizes intentionally adapt below 44px for this complete-table layout. Tests emulate touch in Chromium; physical Safari hardware is not covered.

Latest checks cover automatic safe-turn transitions, immediate first picks, website logo backs, literal winner names, gold trophies, a 36-piece animated ribbon burst, replay cleanup and reduced motion.

# Mahjong Match verification

Latest validation: 257 repository unit tests and 19 Mahjong Match browser checks passed, plus standalone and opaque-preview matches.

Twelve unit tests cover the full 144-piece set and 42 faces, rank equivalence and populations, both possible paired winners, waiting for Player 2 even when Player 1 matches, both kinds of tied pair, fresh-pair state, duplicate/target guards, reset, an exhausted-table draw, sudden-death starts for either player, randomized replay order and first-pick fatalities.

The browser check exercises complete English and Traditional Chinese paired matches, both player winners, repeated tied pairs, retained target/used tiles, result comparisons for both players, random sudden-death order on replay, a single-copy Spring target, offline paired play, literal winner names and ribbons, draw suppression, and the renamed mode button’s scroll/focus behaviour with normal and reduced motion. Responsive checks keep all 144 tiles in one viewport at 320×568, 375×812, 430×932, 568×320, 812×375, 768×1024 and 1440×1050.

Standalone/opaque sandbox checks cover both modes and replay. Chromium emulates touch; physical Safari hardware is not covered.

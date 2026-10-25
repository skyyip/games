# Character artwork

Pikmin artwork © Nintendo. The original sprites were downloaded from Nintendo’s official Pikmin portal; the additional growth-stage Nintendo artwork is hosted by Pikipedia. This is an unofficial fan game. The assets are not presented as original artwork or as open-source licensed files.

Visual reference supplied by the user: [Pikmin Bloom campaign](https://pikminbloom.com/zh_hant/pikmin4-update-campaign-info).

Source page: [The official home for Pikmin](https://pikmin.nintendo.com/).

| Local file | Original URL |
| --- | --- |
| `pikmin/red.png` | https://pikmin.nintendo.com/_images/layouts/home/my-nintendo/pikmin-red.png |
| `pikmin/blue.png` | https://pikmin.nintendo.com/_images/layouts/home/my-nintendo/pikmin-blue.png |
| `pikmin/yellow.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-yellow-sit/pikmin-yellow-sit-leaf.png |
| `pikmin/white.png` | https://pikmin.nintendo.com/_images/layouts/short-movies/hidden-pikmin/pikmin-white.png |
| `pikmin/rock.png` | https://pikmin.nintendo.com/_images/layouts/short-movies/hidden-pikmin/pikmin-rock.png |
| `pikmin/winged.png` | https://pikmin.nintendo.com/_images/layouts/home/hidden-pikmin/pink-pikmin.png |

The original images above are retained as references and previous artwork. The previous renderer used the following 18 stage-specific variants; these original PNG files remain unchanged.

| Local files | Official source pattern (`STAGE` = `leaf`, `bud`, `flower`) |
| --- | --- |
| `pikmin/red-STAGE.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-red-lay/pikmin-red-lay-STAGE.png |
| `pikmin/yellow-STAGE.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-yellow-sit/pikmin-yellow-sit-STAGE.png |
| `pikmin/blue-STAGE.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-blue-fall/pikmin-blue-fall-STAGE.png |

The retained images are local files. No external artwork server is required at runtime. The hungry plant and fence are drawn in the game’s own SVG markup.

## Additional types

Ice (light blue), Rock (black) and Winged (pink) Pikmin also have distinct leaf, bud and flower images. These are existing Nintendo renders; no recolouring or generated character art is used. Pikipedia supplies 240px thumbnails where available to keep downloads small. Winged leaf artwork is from *Hey! Pikmin*; the other new renders are from *Pikmin 4*, except the existing official Winged flower artwork.

| Local file | Source file / original artwork |
| --- | --- |
| `pikmin/ice-leaf.png` | https://www.pikminwiki.com/File:P4_Leaf_Ice_Pikmin_Artwork.png |
| `pikmin/ice-bud.png` | https://www.pikminwiki.com/File:Ice_Bud_Pikmin.png |
| `pikmin/ice-flower.png` | https://www.pikminwiki.com/File:Ice_Flower_Pikmin.png |
| `pikmin/rock-leaf.png` | https://www.pikminwiki.com/File:Pikmin_4_Rock_Pikmin_Walking_Leaf.png |
| `pikmin/rock-bud.png` | https://www.pikminwiki.com/File:Pikmin_4_Rock_Pikmin_Walking.png |
| `pikmin/rock-flower.png` | https://www.pikminwiki.com/File:P4_Rock_Flower_Pikmin_Walk.png |
| `pikmin/winged-leaf.png` | https://www.pikminwiki.com/File:HP_Winged_Pikmin_Leaf.png |
| `pikmin/winged-bud.png` | https://www.pikminwiki.com/File:P4_Winged_Pikmin.png |
| `pikmin/winged-flower.png` | Existing `pikmin/winged.png`: https://pikmin.nintendo.com/_images/layouts/home/hidden-pikmin/pink-pikmin.png |

The Winged bud source has transparent padding. The original PNG remains intact.

## Current articulated renderer

The play field now uses local SVG markup in `src/sprites.js` for all seven types (including White) and all three growth stages. Separate arms, legs and pink wings support coordinated movement. These simplified fan-game drawings replace the static PNGs during play; the source images above remain unchanged for provenance. No external artwork fetch is needed. Pikmin characters belong to Nintendo.

The current local SVG renderer additionally includes Purple and Glow variants (nine types and 27 growth-stage combinations in total). These game drawings do not add or replace any of the original source PNGs listed above.

The current landing card uses `pikmax-cover.svg`, generated from `src/sprites.js` by `scripts/build-cover.mjs`. It includes the current nine character types, purple wrist bracelets, slim blue body, and the floating Glow redesign with a head halo and two belly stripes.

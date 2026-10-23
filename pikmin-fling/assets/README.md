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

The original images above are retained for the landing card and previous artwork. The current game uses 18 stage-specific variants, so the character itself shows the correct growth stage.

| Local files | Official source pattern (`STAGE` = `leaf`, `bud`, `flower`) |
| --- | --- |
| `pikmin/red-STAGE.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-red-lay/pikmin-red-lay-STAGE.png |
| `pikmin/yellow-STAGE.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-yellow-sit/pikmin-yellow-sit-STAGE.png |
| `pikmin/blue-STAGE.png` | https://pikmin.nintendo.com/_images/hoverable-pikmin/pikmin-blue-fall/pikmin-blue-fall-STAGE.png |

Characters load from local files during play. No external artwork server is required at runtime. The hungry plant and fence are drawn in the game’s own SVG markup.

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

The Winged bud source has transparent padding, so the renderer scales it to keep the character legible in the garden and during flights. The original PNG remains intact.

# Beat the Bad Luck · 鵝頸橋下：小人退散！

A bilingual, local-first Hong Kong ritual game at Master Yip’s flyover stall. Run `npm start` from this directory and open `http://localhost:5173/beat-bad-luck/`. No runtime dependencies or source build are required. A production release uses the repository’s `tools/build-site.mjs` for hashed resources and Apache cache rules.

## One simple ritual

1. **Incense:** light three sticks and blow, using the button or an optional local microphone. No recording is saved or uploaded. The button remains available if microphone access fails.
2. **Name the worry:** choose a grouped preset or enter a private, literal worry of at most 64 characters. Custom words are never inserted as HTML or saved in records.
3. **Whack for 68 active seconds:** tap or swipe the paper. Circles in either direction (one gesture), rubbing, pinching, weaknesses and 108 BPM rhythm bonuses are optional. The primary goal is to finish the ritual; a neighbour commission adds a story to that goal. The main HUD shows time, relief score, combo and the finisher meter. A read-only row below the paper shows Tap / Swipe / Circle / Rub / Pinch; both circle directions share one hint. The labels never activate attacks and fit on one row in portrait and landscape.
4. **Feed the tiger:** one tap automatically dips the pork if needed and feeds the yellow paper tiger. Manual dipping and smearing are optional; at least half a coating gives `round(20 × kit × paper multiplier)` once. Close drag releases feed the tiger too.
5. **Resolve and bless:** one confirmation burns the worry and offering paper, scatters rice or beans and burns the green-horse paper in one short animated sequence.
6. **Sacred blocks:** cast once. A non-sacred result triggers a funny automatic retry with one flat and one curved block. No repeated button pressing is needed.

Pausing or hiding the page freezes the model clock and inputs. Quitting never grants ritual rewards. The play panel keeps controls above phone home gestures; the surrounding page is inert during play. Reduced motion removes optional travel and wobbling.

## A single finisher system

The old kit-signature recipes and separate three-step finisher are retired from the live game. All sixty kits, including free hands, share one control:

- Each accepted ordinary hit adds 2 charge; combo 10–19 adds 3, and combo 20+ adds 4. Charge caps at 100.
- A combo allows a gap of **1 second**. Breaking the combo removes its charge acceleration but retains stored charge.
- Tap the full meter to launch an automatic **2.7-second** illustrated performance, at most **two launches per ritual**. No prerequisite signature wins, compulsory first-use popup or additional oil charge.
- An optional nice tap at 1,350 ms ±220 ms adds 10% finisher points. Missing it never fails the show.
- Base bonus is `round(250 × kit × paper multiplier)`; the optional bonus is `round(25 × kit × paper multiplier)`, once. Ordinary strikes, copies and event rewards cannot score during the show.
- The cinematic freezes the ordinary round, event and rhythm clocks and preserves combo. User pause also freezes cinematic time. A long frame excludes only the actual cinematic duration.

Ten illustrated families retain each equipped tool’s artwork: palms/slippers, triple blades, spinning wheels, heavy bonks, application-denied stamps, suction slingshots, solar light, makeover mirrors, the 3000-tool fan and Lassie. The 3000 tools collapse into a plastic comb and a voluntary surrender; the beauty paper refuses to leave its mirror. The guide is available from home and pause, without spending charge.

Long-press/release, outward two-finger spreading, X and V are not scoring gestures. Two separated fingers can still pinch inward. Pointer cancellation, lost capture, pause and resize discard unfinished gestures. A 55 ms per-pointer guard prevents duplicate hits; independent fingers can tap separately. Stationary presses lasting 0.7 seconds or longer do not score on release; short taps still work.

## Surprises and recurring comedy

**Random challenge events are off by default**, including for older saves. The checkbox immediately above Start remembers the player’s choice. When enabled, exactly **one random bridge event** appears at 18 active seconds and lasts 5.4 seconds. The choice is captured when a ritual starts and survives the naming step. Turning it off leaves all ritual steps and story progression available; event bonuses and event-related titles require opting in. One tap or swipe resolves an event; an accessible tap on its fixed control is equivalent. Completed and expired events never pay again. The event caption has reserved space, and only artwork moves inside its stable touch target.

Requirement/work-life worries emit at most two expiring copies. Stocks reward hitting during the plunge. The pig teammate cycles helmet → pretend nap → snicker; the snicker is its weakness. Other presets retain their gesture-specific optional bonuses.

Three new paid, ten-use papers have three comic acts (swagger → pleading → undignified wrap): 九品甩鍋官 (6,200 oil, ×1.9), 假扮高人的老細 (6,800, ×1.95), 永遠未準備好的龍套 (7,400, ×2). The original fifteen paid paper multipliers have increased by 0.3; unlimited free plain paper stays at ×1; existing paper prices and remaining uses are preserved.

Seven additional ten-use papers follow the existing catalogue. Prices and final bonuses reflect fictional comic difficulty, not real-life conduct. 銀幕奸角宗師 honours Fong Kong’s screen roles, not the actor himself; 空頭承諾王 and 迷糊雞仔偵探 are original fictional replacements for the submitted real-person negative labels. All use original chibi vector art with individual props, hit reactions and reduced-motion support. Free plain paper remains ×1; existing prices, bonuses and saved uses remain unchanged.

| Paper | Oil | Final relief bonus |
| --- | ---: | ---: |
| 迷糊雞仔偵探 | 7,800 | ×2.05 |
| 空頭承諾王 | 8,400 | ×2.10 |
| 銀幕奸角宗師 | 9,200 | ×2.20 |
| 古惑仔・靚坤 | 10,400 | ×2.30 |
| 古惑仔・烏鴉 | 11,800 | ×2.45 |
| 斷水流大師兄 | 13,800 | ×2.60 |
| 鹿鼎記・鼇拜 | 16,800 | ×2.80 |

The three-chapter **橋底申訴處・牛丸係老闆** story follows a missing meatball, an unreliable witness and a meatball boss on the throne. A completed ritual advances one accepted chapter even if its optional target is missed. Completion pays 60% of the listed maximum; meeting the matching worry/skill target pays the full amount. Replays retain the existing reduced pay. The final first completion places the **自動準時收工印** in the stall, with normal durability and repair. Replays never duplicate this gift; its shop entry unlocks after the story for later replacement/upgrading.

Owning the beef balls, lucky cat and dragon throne unlocks **牛丸追逐戰**: the helmeted cat chases the meatball, which takes the throne while owned props bow. It joins the existing replayable/auto-play scene collection and layout discovery system.

The new three-star patron **臨時救場龍套王** has +2% ritual oil and +2% merit, using the existing strongest-per-category rules. When owned, its first event rescue each ritual gets a brief dropped-hat cameo. Existing patron buffs remain unchanged.

Fortunes retain the existing 84 bilingual quotes and Cantonese Master comments. **Forty additional endings** combine ten finisher families and four worry groups; their own result card and collection book preserve discoveries independently of the most recent 24 fortune cards. Private worry text is never stored.

## Inventory and stall

Paid kits last **three scored rituals**; paid papers last **ten**. The first scoring action commits one use of each, once per ritual. Leaving before scoring preserves inventory; leaving after scoring does not refund it. The current ritual retains its configured multiplier even on the final use. Free hands remain an unlimited ×1 kit; free plain paper is unlimited ×1. Kit and paper multipliers multiply together.

Purchases show a comic confirmation before any deduction, then an animated reveal. Closing or cancelling before confirmation spends nothing. Merit is an unlock threshold and is not deducted. Coupons apply once on successful purchase. Shops have bilingual search and All / Owned / Can buy filters; story-locked props cannot be purchased or shown as affordable.

Every decoration base price is 300 oil lower, including care values for hidden pieces; income and existing levels are unchanged. Decorations appear immediately in a rearrangeable three-column stall shelf. Drag the ⠿ handle on touch, or drag a piece with a mouse; arrow keys on a handle also reorder. Order is saved and continues to drive scene discovery. The separate neighbourhood layout tab/dropdowns are removed. Icons use 80% of their prior scale. Decorations have five levels and **30 real days** of durability. Upgrades preserve expiry; repair restores 30 days for `ceil(base price × level × 25% × fraction worn)`. Zero durability removes the item and stops income at its expiry. Discarding gives no refund. Hourly rates retain the previous reduction and +0.06 per extra level. Offline income caps at eight hours and preserves fractional oil.

Eleven patrons span five rarities. Their strongest oil and merit buffs are capped at 5% per category; coupons are one-use 5–15% discounts. Thirty hidden props/kits remain a 6% post-ritual drop. Daily login awards 20 oil and 30 merit once per Hong Kong day. Receipts prevent duplicate awards.

The top three scores, balances, expiry, inventory, stories, titles and collections use `beat-bad-luck.stall.v1`. Existing saves migrate without resetting owned counters or story progress. Invalid IDs are discarded. Storage failures use memory for that visit; the backup/import UI supports user-controlled transfer. Browser and installed versions share the same origin’s storage where the browser permits it.

The sanctuary wallet has prominent oil/merit totals with 650 ms counting animations; reduced motion shows final values immediately. Dock, shop and detail numbers have contrasting emphasis. Home titles glow and shine slowly, selected paper cards have a gold border, and title controls use consistent 14px text. Decoration details use 90% of their former text sizes, a prominent close control, title-first focus and 260/180 ms open/close motion. The dialog remains modal during closing; purchase/discard hand-offs await completion.

## Audio, language and updates

Traditional Chinese is the default; English follows the playground preference. During whacking, Master randomly cycles through the six requested Cantonese villain-hitting lines, without repeats within a six-line bag or at bag boundaries. Local SVG and Web Audio provide the art, rain, melody, bells and impacts; speech uses an available device voice. Audio unlock retries on gestures, including iPhone’s silent media route. Mute/pause stop pending audio without stacking music loops.

Offline cache **v67** includes the new content, art and presentation. Existing windows finish their ritual before an update activates. Production hashing and the shared update prompt remain handled by the repository build. No paid SDKs, real-money purchases, professional recordings or multiplayer server are integrated.

## Verification

```sh
npm test
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-comedy-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-interactions-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/event-optin-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/gesture-hints-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/stall-refresh-check.mjs
```

The current browser acceptance test covers four Chinese/English portrait/landscape/desktop profiles, a reduced-motion profile, real ordinary hits, two finishers, optional timing, pause, stable event geometry, the patron cameo, one-tap feeding/blessing, automatic block retry, the final story gift, inventory accounting and reload. Set `BEAT_BAD_LUCK_URL` to run the same test against a hashed production build. The interaction check additionally exercises all nine native event controls, purchase cancellation/confirmation and manual blood dipping/smearing with one bonus. The opt-in check completes event-free and event-enabled rituals, verifies story progression with events off, and reloads both saved choices in Chinese and English mobile layouts. Historical signature/event browser scripts document retired mechanics; use the current check above for this version.

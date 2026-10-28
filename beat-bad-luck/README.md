# Beat the Bad Luck · 鵝頸橋下：小人退散！

A bilingual, local-first Hong Kong ritual game at Master Yip’s flyover stall. Run `npm start` from this directory and open `http://localhost:5173/beat-bad-luck/`. No runtime dependencies or source build are required. A production release uses the repository’s `tools/build-site.mjs` for hashed resources and Apache cache rules.

## One simple ritual

1. **Offer incense / 奉神:** light three sticks and blow, using the button or an optional local microphone. No recording is saved or uploaded. The button remains available if microphone access fails.
2. **Name the worry:** choose a grouped preset or enter a private, literal worry of at most 64 characters. Custom words are never inserted as HTML or saved in records.
3. **Whack freely for 58 active seconds:** any supported gesture scores immediately, without a system cue or required beat. Base points are **Pinch 100 > Circle 80 > Rub 60 > Swipe 40 > Tap 30**, plus existing combo, kit, paper and worry bonuses. Strength changes impact/damage rather than base gesture points. Optional on-beat recognition still contributes to rhythm titles; it never blocks scoring. The lower gesture row remains read-only; the former static guide is removed to enlarge the arena. The paused guide retains the score ranking. Keyboard: Space tap, Down swipe, C circle, R rub, P pinch.
4. **Feed the tiger:** one tap automatically dips the pork if needed and feeds the yellow paper tiger. Manual dipping and smearing are optional; at least half a coating gives `round(20 × kit × paper multiplier)` once. Close drag releases feed the tiger too.
5. **Resolve and bless:** one confirmation burns the worry and offering paper, scatters rice or beans and burns the green-horse paper in one short animated sequence.
6. **Sacred blocks / 打杯:** cast once. A non-sacred result triggers a funny automatic retry with one flat and one curved block. No repeated button pressing is needed.

Pausing or hiding the page freezes the model clock and inputs. Quitting never grants ritual rewards. The play panel keeps controls above phone home gestures; the surrounding page is inert during play. Reduced motion removes optional travel and wobbling.

## A single finisher system

The old kit-signature recipes and separate three-step finisher are retired from the live game. All sixty kits, including free hands, share one control:

- Land **100 consecutive hits with any gestures** to unlock the finisher. Keep the gap between scored hits at 1.5 seconds or less. A longer active-time gap resets unfinished progress, while earned points and an earned unlock remain. Pause and the cinematic preserve the combo.
- Tap the full meter for a **10-second burst**, at most **one launch per ritual**. No prerequisite signature wins, compulsory first-use popup or additional oil charge.
- Rapid-tap with one finger or alternate two fingers. Each pointer press on the paper scores immediately and independently, with the existing 55 ms per-pointer duplicate guard. No pinch recognition consumes alternating presses during a burst.
- Each real hit scores **×3**, after its ordinary critical, combo, kit, paper and worry modifiers. The extra portion is recorded as the finisher bonus. There is no automatic payout or optional nice-tap award: more taps earn more points.
- The ten seconds **count toward the existing 58-second round**; event and combo clocks keep running. Expiry or round end immediately restores normal scoring. User pause and a hidden page freeze burst time and input; quitting clears the burst without ritual rewards.
- A noninteractive otherworld backdrop, edge lightning, synthesized thunder and flames around the equipped tool accompany the burst. Reduced motion keeps the scene and flames still. The fixed telemetry row uses compact large totals with accessible exact numbers, so scoring cannot displace the paper.

All sixty tools retain their own artwork; the ten comedy families still determine collection endings. The paused guide is available without spending charge. The former automatic movie and nice-tap ring are retired.

Outside a burst, long-press/release, outward two-finger spreading, X and V are not scoring gestures. Two separated fingers can still pinch inward. Pointer cancellation, lost capture, pause and resize discard unfinished gestures. A 55 ms per-pointer guard prevents duplicate hits; independently completed gestures can score without waiting for a cue. Stationary presses lasting 0.7 seconds or longer do not score on release; short taps still work.

## Surprises and recurring comedy

**Random challenge events are off by default**, including for older saves. The checkbox immediately above Start remembers the player’s choice. When enabled, exactly **one random bridge event** appears at 18 active seconds and lasts 5.4 seconds. The choice is captured when a ritual starts and survives the naming step. Turning it off leaves all ritual steps and story progression available; event bonuses and event-related titles require opting in. One tap or swipe resolves an event; an accessible tap on its fixed control is equivalent. Completed and expired events never pay again. The event caption has reserved space, and only artwork moves inside its stable touch target.

Requirement/work-life worries emit at most two expiring copies. Stocks reward hitting during the plunge. The pig teammate cycles helmet → pretend nap → snicker; the snicker is its weakness. Other presets retain their gesture-specific optional bonuses.

Three new paid, ten-use papers have three comic acts (swagger → pleading → undignified wrap): 九品甩鍋官 (6,200 oil, ×2.1), 假扮高人的老細 (6,800, ×2.15), 永遠未準備好的龍套 (7,400, ×2.2). The original fifteen paid paper multipliers have increased by 0.5 in total; unlimited free plain paper stays at ×1; existing paper prices and remaining uses are preserved.

Seven additional ten-use papers follow the existing catalogue. Prices and final bonuses reflect fictional comic difficulty, not real-life conduct. 銀幕奸角宗師 honours Fong Kong’s screen roles, not the actor himself; 空頭承諾王 and 迷糊雞仔偵探 are original fictional replacements for the submitted real-person negative labels. All use original chibi vector art with individual props, hit reactions and reduced-motion support. Free plain paper remains ×1; existing prices and saved uses remain unchanged. All 22 paid looks receive a further +0.2 bonus; free paper remains ×1.

| Paper | Oil | Final relief bonus |
| --- | ---: | ---: |
| 迷糊雞仔偵探 | 7,800 | ×2.25 |
| 空頭承諾王 | 8,400 | ×2.30 |
| 銀幕奸角宗師 | 9,200 | ×2.40 |
| 古惑仔・靚坤 | 10,400 | ×2.50 |
| 古惑仔・烏鴉 | 11,800 | ×2.65 |
| 斷水流大師兄 | 13,800 | ×2.80 |
| 鹿鼎記・鼇拜 | 16,800 | ×3.00 |

The three-chapter **橋底申訴處・牛丸係老闆** story follows a missing meatball, an unreliable witness and a meatball boss on the throne. A completed ritual advances one accepted chapter even if its optional target is missed. Completion pays 60% of the listed maximum; meeting the matching worry/skill target pays the full amount. Replays retain the existing reduced pay. The final first completion places the **自動準時收工印** in the stall, with normal durability and repair. Replays never duplicate this gift; its shop entry unlocks after the story for later replacement/upgrading.

Owning the beef balls, lucky cat and dragon throne unlocks **牛丸追逐戰**: the helmeted cat chases the meatball, which takes the throne while owned props bow. It joins the existing replayable/auto-play scene collection and layout discovery system.

The new three-star patron **臨時救場龍套王** has +2% ritual oil and +2% merit, using the existing strongest-per-category rules. When owned, its first event rescue each ritual gets a brief dropped-hat cameo. Existing patron buffs remain unchanged.

Fortunes retain the existing 84 bilingual quotes and Cantonese Master comments. **Forty additional endings** combine ten finisher families and four worry groups; their own result card and collection book preserve discoveries independently of the most recent 24 fortune cards. Private worry text is never stored.

## Inventory and stall

Each purchased kit adds **three scored ritual uses**; paid papers last **ten**. The same kit can be bought repeatedly: purchases add three uses without resetting partially used stock, and an Owned label shows how many kits remain. Equip is a separate, free action; Buy another always opens the normal purchase confirmation. Stock survives reload and backup transfer, is bounded at 999,999 uses, and only returns to free hands after all uses are exhausted. The first scoring action commits one use of each kit and paper, once per ritual. Leaving before scoring preserves inventory; leaving after scoring does not refund it. The current ritual retains its configured multiplier even on the final use. Free hands remain an unlimited ×1 kit; free plain paper is unlimited ×1. Kit and paper multipliers multiply together.

Purchases show a comic confirmation before any deduction, then an animated reveal. Closing or cancelling before confirmation spends nothing. Merit is an unlock threshold and is not deducted. Coupons apply once on successful purchase. Shops have bilingual search and All / Owned / Can buy filters; story-locked props cannot be purchased or shown as affordable.

Every decoration base price is 300 oil lower, including care values for hidden pieces; income and existing levels are unchanged. Decorations appear immediately in a rearrangeable three-column stall shelf. Drag the ⠿ handle on touch, or drag a piece with a mouse; arrow keys on a handle also reorder. Order is saved and continues to drive scene discovery. The separate neighbourhood layout tab/dropdowns are removed. Owned shelf icons use scale 0.7344, another 10% smaller than the previous 0.816; hit targets and labels stay unchanged. Decorations have eight levels and **30 real days** of durability. First placement retains its base price; later upgrades cost `ceil(base × next level × 0.8)` before the best one-use coupon. Upgrades preserve expiry; repair restores 30 days for `ceil(base price × level × 25% × fraction worn)`. Zero durability removes the item and stops income at its expiry. Discarding gives no refund. Hourly rates retain the previous reduction and +0.06 per extra level. Offline income caps at eight hours and preserves fractional oil.

Eleven patrons span five rarities. Their strongest oil and merit buffs are capped at 5% per category; coupons are one-use 5–15% discounts. Thirty hidden props/kits remain a 6% post-ritual drop. Daily login awards 20 oil and 30 merit once per Hong Kong day. Receipts prevent duplicate awards.

The top three scores, balances, expiry, inventory, stories, titles and collections use `beat-bad-luck.stall.v1`. Existing saves migrate without resetting owned counters or story progress. Invalid IDs are discarded. Storage failures use memory for that visit; the backup/import UI supports user-controlled transfer. Browser and installed versions share the same origin’s storage where the browser permits it.

The sanctuary wallet has prominent oil/merit totals with 650 ms counting animations; reduced motion shows final values immediately. Dock, shop and detail numbers have contrasting emphasis. Home titles glow and shine slowly, selected paper cards have a gold border with a continuous six-second highlight, and title controls use consistent 14px text. Decoration details use 90% of their former text sizes, a prominent close control, title-first focus and 260/180 ms open/close motion. The dialog remains modal during closing; purchase/discard hand-offs await completion.

## Merit levels, seven-day fortunes and bounded reading

Merit is cumulative and is never deducted for kit unlocks. Levels **1–168** use the steeper threshold `12 * n**2 + Math.floor(n**3 / 8)`, where `n = level - 1`: level 10 needs 1,063, level 100 needs 238,899, and level 168 needs 916,850. Every successive level-up costs more, and the final level remains reachable within the existing one-million-merit cap. Existing merit, inventory and collections are unchanged; displayed levels are recalculated against the new thresholds. Every ten levels unlocks one of sixteen animated badges (10–160); their dimensions are now 65% of the former size. The wallet shows the current level and progress to the next. Reduced motion keeps badges and the festive red spring-couplet headline still.

Each personal fortune card expires **seven elapsed days** after creation. Load, idle collection, import/export, ritual completion and a foreground minute timer prune expired cards; the 24-card cap remains. Top-three scores, merit and earned story/title collections are retained. The card uses larger small print, wrapped Chinese/English text and a cartoon lucky stamp; exported PNG is 600 × 900.

Home worry selection starts empty. Choose a grouped option or enter non-whitespace text to enable either Start button; the start action independently validates this rule. Custom thoughts are used for the current ritual only. Accepting a commission selects that chapter’s worry. The neighbour shortcut opens Stories and scrolls its internal panel to the chapter heading. All accordion bodies and tab panels have bounded internal scrolling, focus outlines and touch scrolling; summaries and tab navigation remain outside the scrolling content.

Ordinary whacks can randomly become **2X impacts (10% chance, ×1.5 hit points)** or **3X impacts (4% chance, ×2 hit points)**. They multiply the hit before worry/kit/paper modifiers; optional event rewards are paid separately. The gesture ranking and 100-combo/once-only finisher are unchanged. The reaction caption uses its existing row, while comic dentures/ghosts and distinct mouth/limb motion animate beside the paper. No mandatory gesture cue is added.

All 22 neighbourhood chapters have original bilingual slapstick scenes inspired by Hong Kong film comedy. They keep the existing story IDs, chapter goals, gifts and optional-bonus logic.

## Audio, language and updates

Traditional Chinese is the default; English follows the playground preference. During whacking, Master randomly cycles through the six requested Cantonese villain-hitting lines, without repeats within a six-line bag or at bag boundaries. Local SVG and Web Audio provide the art, rain, melody, bells and impacts; speech uses an available device voice. Audio unlock retries on gestures, including iPhone’s silent media route. Mute/pause stop pending audio without stacking music loops.

Offline cache **v75** includes the current gameplay, rounded cartoon trophy and function-appropriate raised buttons. Small ritual-button labels are enlarged by 15%, without compounding on rerender. Illustrated gesture targets retain their coordinates while changing shadow depth. The fixed score cell cannot shift when its value changes; the narrower finisher HUD has extra left spacing and no idle remaining-use label. Cute decorative zombies occasionally hop up from the arena's bottom edge behind the paper, then hop back out. They never intercept touches; pause freezes them, other phases hide them, and reduced motion keeps them still. The backdrop tiger is hidden during rituals; feeding the white tiger is unchanged. The stall showcase has a viewport-bounded height and keyboard-reachable inner scrolling.

Favicon (64), Apple home-screen (180), and manifest icons (192/512) use the website logo with its horn and safe padding. Regenerate them with `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/build-icons.mjs`. Existing windows finish their ritual before an update activates. Production hashing and the shared update prompt remain handled by the repository build. No paid SDKs, real-money purchases, professional recordings or multiplayer server are integrated.

## Verification

```sh
npm test
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/freestyle-ritual-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-interactions-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/event-optin-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/gesture-hints-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/stall-refresh-check.mjs
```

The current browser acceptance test (`freestyle-ritual-check.mjs`) drives the real pointer recognizer through 100 freely chosen gestures, verifies the 99/100 unlock boundary, native alternating two-finger burst input, exact triple scoring, running round time, frozen pause, full-arena lightning, contained flames, stable high-score layout, all six ritual steps, inventory and reload. Desktop uses its documented P key for pinch. Older cinematic, signature and cue-based checks document retired mechanics.

Selection polish: equipped paid/free paper cards have a bright gold border and a continuously travelling SVG perimeter glint, with a static highlight for reduced-motion preferences. The overlay never intercepts clicks or covers text; selected copy and bonuses keep at least 4.5:1 contrast. The game’s update prompt heading is 21.6px (80% of its former 27px).

Kit and decoration shortcuts use distinct gold/mint raised cards and original slipper/storefront icons. Their existing tab navigation, enlarged labels and mobile touch targets are preserved.

Stall badges use explicit 22px centred cells. Drag controls use centred SVG dots: visible frame 19.2px and icon 14.4px (40% smaller), retaining the 32px touch target. The decoration dialog’s SVG close mark is centred in its 44px button.

Decoration upgrade prices use dark green ink on the gold button. Unaffordable upgrades keep an opaque, muted surface so their prices remain readable.

Owned decoration art and its drag preview are a further 10% smaller (CSS scale 0.816 → 0.7344); the shelf cells, badges and touch targets keep their sizes and positions.

The intro uses two flexible columns across the full available width. The heading stays on two lines; the slipper and introduction share the right column. Ritual duration occupies the full row on mobile and the lower right on wider screens, without the former 135px note-width cap.

Both collection and neighbourhood tab rows stick to the viewport top while reading their own sections. The collection wrapper bounds its sticky row before records; the neighbourhood wrapper allows viewport sticky positioning. Collection switching and shortcuts scroll to the group’s natural start, including when the tab row is already pinned. Filters continue scrolling normally.

UI follow-up: pause action labels are 15px (25% above 12px); final auspicious-card body copy is 12.48px (20% above 10.4px). Search rows fill the available width with a compact 92px filter; input fonts stay 16px instead of compounding collection typography scaling. Original vector stove, cheering grain bowl and green-horse taxi replace the blessing emoji props.

The neighbour-commission shortcut is a raised button. It always opens the Stories tab and aligns “Neighbour story chapters” below the sticky tab row, instead of restoring whichever collection tab was used last.

Sanctuary acceptance: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright BEAT_BAD_LUCK_URL=http://localhost:5216/beat-bad-luck/ node scripts/sanctuary-update-check.mjs` validates responsive typography, required worry entry, eight-level pricing, retained saves, bounded scroll regions, merit badges, critical hits and full ritual/export flows.

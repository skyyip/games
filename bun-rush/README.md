# 登頂啦！平安包 · Cheung Chau Bun Rush

A bilingual, dependency-free island game inspired by Cheung Chau’s Tai Ping Ching Chiu bun tower and floating-colour procession. Play a sixty-second climb, collect eight modern wishes, then use the same gold blessings to build a funny little parade troupe.

## Play and develop

With Node.js 20+, run `npm start` from this directory and open `/bun-rush/`. Run `npm test` for the pure simulation and local-progress tests. The landing page links this nineteenth game immediately after Beat the Bad Luck; saved favourite orders remain user-controlled. Traditional Chinese is the default, with English inherited from the landing page.

## The climb

The climber automatically ascends for **60 active seconds**. Drag horizontally on the tower, hold the two arrow buttons, or use Left/Right or A/D. Horizontal motion uses a damped spring and produces inertial body sway. Only nearby buns with an illuminated ring can be picked; tap or keyboard-activate each bun once. The first four wishes award one gold blessing, and the latter four award two:

| Wish | Gold blessings |
|---|---:|
| 準時收工包 | 1 |
| 拒絕OT包 | 1 |
| 拒絕內耗包 | 1 |
| 一覺睡醒自然醒包 | 1 |
| 健康全綠包 | 2 |
| 行運一條龍包 | 2 |
| 開開心心包 | 2 |
| 無憂無慮包 | 2 |

A grab emits exactly its award count of gold orbs and a short synthesized chime. Wet bamboo, rival climbers and excessive sway cause a recoverable slip: the safety rope holds, some height is lost, and climbing pauses briefly. Collected gold remains safe. The clock keeps running; there is no early elimination. The simulation integrates fixed 120 Hz steps and the camera follows the actual height. Buns and hazards are generated ahead and pruned behind the camera.

Completed score equals the spendable gold award. The three highest scores are stored on the current device, with nickname, height and date; earlier equal scores rank first. Quitting midway grants no gold or record. Pause and backgrounding freeze active time and release held controls. A completed-round receipt prevents duplicate rewards.

## Floating-colour parade

Five performers and five props include a free apprentice and peace-bun flag, a ten-screen overtime superhero, inbox ninja, slow-life captain, green-health guardian, screen cape, off-duty banner, sleep-in cloud and bun crown. Purchases spend gold once; owned pieces can be re-equipped for free in independent actor/prop slots.

A parade lasts **18 active seconds**. Each of six neighbours can be tapped once. Final laughter is `6 + neighbours cheered + actor laugh bonus + prop laugh bonus`; good fortune is `ceil(laughter / 3)`. These two social currencies are stored separately and do not mint spendable gold. A separate receipt prevents repeated parade payouts.

## Technical notes

- Local SVG artwork supplies all buns, performers, bamboo, sea, ferry and cover images. No art or audio network service is required.
- The shared `StallAudio` class provides the tested iPhone playback activation and mute/pause transport; `IslandAudio` overrides ambience with wave swells and provides ferry horns, footsteps and bun chimes. The service worker explicitly caches the shared audio and catalog dependencies.
- Sound defaults on and begins on a user gesture. Both modes and the welcome screen share synchronized sound controls. Hiding the page stops sound.
- The scoped service worker caches this game, fonts, shared interface modules and icons. It only clears caches with its own `bun-rush-app-` prefix.
- `bun-rush.harbour.v1` stores local gold, laughter, fortune, owned pieces, equipped outfit and top three records. Inputs are bounded; nicknames remain literal text. Unavailable storage retains play and progress for the current visit.
- Native buttons and descriptive labels support keyboard use. Reduced motion suppresses decorative travel and confetti while retaining essential climbing movement and scoring. Touch surfaces prevent double-tap zoom without disabling intentional browser pinch zoom globally.

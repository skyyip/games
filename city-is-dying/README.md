# 天與地：The City is Dying

An independent, unofficial, original interactive interpretation inspired by the user’s television-drama premise. Open `city-is-dying/` directly. **Hidden from landing cards and the landing collection schema** through `listed:false`. No accounts, paid services, cloud project or game engine download are required. Dialogue, events, illustrations and synthesized minor-key music are original; no show footage, commercial song recordings or song lyrics are included.

## Complete playable structure

1. **Original sin — six nights in the snow.** Angus, Bowman and Ronnie rotate as decision makers. Share up to two supplies each night, then choose a card. Each night also consumes one food and water when available. Missing either adds exposure damage; the starting food runs out by the fourth-night dinner. Fire, water, food and warmth can keep the group alive; exposure can end the expedition. Ka Ming’s death leads to a three-part dinner decision: proposer, responsibility and portion/refusal. These choices persist into guilt, trust and humanity. Refusal is playable and costs health; no graphic act is shown.
2. **Floating city — up to twelve days in Hong Kong.** Freely switch between three viewpoints sharing three actions per day. Angus trades, acquires property, protects shops or buys silence; Bowman organizes workers, strikes, bargains or listens; Ronnie earns wages, searches belongings or reconstructs memories. Every character can confess once. Prices, unrest, solidarity, influence, trust and Yan’s inquiry cross-affect the loops. High prices/unrest cause a real strike backlash. Revealing memories raises psychological pressure instead of automatically healing it. A completed inquiry can bring the finale forward.
3. **Redemption & rock.** Fund a community stage, take a sponsor or use an always-available unplugged street corner. Choose truth, secrecy, power or mutual accusation, then perform a final set. The same persistent state determines the ending.

There are **54 collectible fragments**, eight key memories and **eight endings**, including a mountain failure. Roles, guilt, sanity, humanity, ideals, memory and city pressures affect the final result. Exact sanity/guilt numbers are hidden by default behind qualitative states; Settings can expose them. The guilt/sanity vignette affects only the Canvas scenery, not decisions, dialogue or controls, and can be disabled.

## Music

Music is the only mechanic that reduces guilt or raises sanity. Successful rehearsal needs at least 65% hits and 35 trust. It awards −9 guilt and +12 sanity to each character and increases trust. It is available once per city day, plus the final set. A result token can settle only once.

- Rhythm: 600ms beats; tap the four shape buttons or A/S/D/F near the judgement line.
- Slow: 900ms beats and a wider timing window.
- Untimed composition: follow the displayed shapes at any pace, with equivalent story rewards. It does not start an animation loop.
- Hidden tabs pause an active take. Resume explicitly; no elapsed-time penalty accumulates while paused. Ending a started take consumes it without granting unearned recovery. Cancelling the setup before starting preserves the rehearsal opportunity.

Tones use Web Audio only after user interaction and are **muted by default**. They are short original synthesized notes and an occasional original high-guilt whistle effect, not a rendition of a commercial song. Static city/snow scenes redraw only on changes/resizes. Canvas backing pixels are bounded; reduced-motion preferences and the in-game effects toggle are supported.

## Saves and replay

- Autosave: `city-is-dying.save.v1` after discrete decisions/settings-independent story updates.
- Three independent manual slots: `city-is-dying.slots.v1`.
- Ending collection: `city-is-dying.endings.v1`, retained across new stories or loading an older slot.
- Export/import a versioned JSON file; schema/ranges/known characters and fragment IDs are validated before replacing a story. Import files are limited to 250KB in the UI.
- Undo returns to the preceding decision. Switching viewpoints does not consume that undo snapshot.
- Unavailable storage leaves the in-memory story playable and shows an export reminder. Local data does not cross browsers/devices automatically. There is no Firebase integration or global leaderboard.

## Ending conditions

`whiteout`: a companion dies in the snow. `silence`: cover up at the finale. `empire`: choose power with sufficient influence or very low humanity. `ashes`: mutual accusation, low trust and extreme unrest/low sanity. `fracture`: trust below 40. Otherwise the default is `unfinished`.

`redemption` requires everyone’s confession, mean humanity ≥45 and ideals ≥40, memory ≥65, trust ≥55, two successful sets (including the finale), at least 65% final accuracy, and choosing truth. With all eight core fragments and at least 85% accuracy it becomes `parallel`. These thresholds are also explained after an ending; they are not presented as real-world psychological guidance.

## Development

No package installation is needed for the game itself. From the repository root:

```
node --test --test-isolation=none city-is-dying/tests/*.test.js
PORT=5314 node grid-rush/scripts/serve.js
```

Open `/city-is-dying/` in the source server. The shared production build handles hashed JS/CSS/fonts/images, Apache cache configuration and update-aware offline workers. The Pages workflow watches this folder. To build under the repository’s Pages prefix:

```
PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs /tmp/city-preview/games
node tools/check-seo.mjs /tmp/city-preview/games /games/
```

Browser acceptance: `CITY_URL=http://localhost:5314/games/city-is-dying/ node city-is-dying/scripts/browser-check.mjs`; set `GRID_RUSH_PLAYWRIGHT_MODULE` if Playwright uses an external installation. See `VERIFICATION.md` for results and limitations.

# Verification

Validated with Node.js 24, system Chromium and the existing optional Playwright installation. No runtime dependencies were added.

## Logic

**124 repository tests passed**, including **15 Stone Skip tests** covering:

- All five minimum defaults, every requested parameter boundary, invalid settings and invalid strength values.
- Exact 10/10/10/10/60 scoring, optimum size/weight/angle, faster spin and monotonic strength.
- Frozen settings, input ownership, one launch and one completion per round.
- All water contacts in order, position continuity, final sink and completion timing with both motion preferences.
- Swipe direction, recent speed, stale release rejection and the keyboard charge curve.
- Independent top-three rankings, deduplication, serialization, malformed storage and fabricated score rejection.
- Sensor calibration, stationary data, isolated spikes, null readings, insufficient sample cadence, gravity removal and strength comparison.

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js just-a-sec/tests/*.test.js roach-rush/tests/*.test.js stone-skip/tests/*.test.js
```

## Browser

**16 Stone Skip checks passed**:

- Full Traditional Chinese and English setup, swipe, animation, results, keyboard replay, top-three persistence and reload.
- Results remain hidden and storage unchanged until the flight finishes. Taps, Escape, pointer cancellation and abandoned flights create no records.
- Synthetic linear and gravity-inclusive motion events verify permission requests, calibration, stationary rejection and a measured strength contribution.
- Declined permission and a missing motion API offer a working swipe alternative. No sensor data times out without inventing a result.
- Real Chromium touch events complete swipe throws at 320×568, 375×812, 812×375 and 768×1024. Results and replay controls fit; ending and restarting correctly restore and reopen the fixed play view.
- Ordinary motion shows the stone, dotted arc, bounce counter and expanding ripples before revealing the result.
- A suspended cached page resumes the unfinished flight and records it exactly once after returning. Reduced motion removes decorative stone rotation; every landing stays below the far riverbank.
- A complete offline round loads the river, fonts, game and shared modules from the scoped service worker.
- No uncaught browser errors.

Shared UI passed **22 checks**, favourites **14**, and language integration **16** with eight landing cards. New-game manifests, icons, home navigation and layouts fit at 320, 375, 430, 600, 768, 1024 and 1440px. The throwing-mode selector uses a single native radio-card border; the shared animated outline no longer attaches to this fieldset. At 320, 375 and 1440px, both selections show the correct border and result, record and announcement distances use 米 in Chinese. Desktop, phone, flight and result screenshots were visually inspected.

The standalone preview embeds all module imports, styles, local fonts and SVG assets. Its native start button does not depend on form submission. Two sandboxed phone checks passed: one with persistent storage and one with an opaque origin and blocked storage. Both complete a Chinese round, reveal the result after the flight, keep separate top-three lists and restore the ordinary page after leaving the play view.

Motion permission and sensor samples were simulated in Chromium. Physical-device acceleration sensitivity, Safari’s native permission UI, other browser engines, screen readers and native app installation were not directly exercised. Device/browser permission policies may require using the full HTTPS site for phone motion; the preview also supports swipe and keyboard input.

Fresh-page checks at 320px in Chinese and 1440px in English confirm all ten range/number inputs start at their minimum values and the setup score reads 7.2 / 40. The 16 game browser checks passed with the minimum defaults, including swipe, motion, touch, keyboard, replay and offline play.

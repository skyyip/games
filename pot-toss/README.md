# 拋箭入尿壺 · Pot Luck

A solo courtyard tossing game. Flick an arrow into a cute lavender chamber pot. A bamboo arrow earns **1 point**, a rainbow arrow **2 points**. Choose **2 minutes** or **3 minutes**; each duration saves its own three best completed scores on the current device.

## Play

1. Start a round. An arrow appears at the throwing position.
2. Swipe upward from the arrow and release while moving. Swipe direction controls left/right aim; swipe speed controls launch speed. A medium flick usually reaches the initially centred pot. The strength guide helps find that range.
3. Adjust using the short/far/left/right/rim feedback. Aim for the opening: hitting the chamber pot's side or rim bounces off and earns nothing.
4. The pot remains still for 12 seconds, then moves slowly left and right. After 24 seconds it also moves slowly nearer and farther, appearing to move up and down on screen. Aim ahead to allow for the arrow's flight time.

Both arrow types have identical physics. A shuffled four-arrow bag contains two of each type, with random ordering. The current type remains fixed while aiming; tapping, cancelling or holding cannot reroll it. The next arrow arrives after the current shot resolves and a short cooldown.

Desktop users can drag with the mouse, or focus the arrow and hold Space/Enter to charge, then release. Left/Right or A/D adjust aim in one-degree steps; a labelled slider offers the same adjustment. Keyboard charge rises for 1.25 seconds, then falls over 1.25 seconds. The middle of the strength guide reaches the central pot. Escape cancels a held shot. Blur, pointer cancellation, lost capture, rotation and backgrounding also release held input without throwing.

## Physics and timing

Arrows launch from a fixed height at a 50° elevation. A flick maps to 5.6–9.7 metres/second in the game's world, with a bounded horizontal heading. Three-dimensional ballistic motion uses gravity of 9.81 m/s². The rendered arrow follows its velocity, turning downward after the apex. A short dotted arc previews the beginning of a held shot, rather than revealing the final collision.

Only descending entry through the circular opening scores. Collision uses the pot's position at the exact crossing time, including when a display frame is late. The pot rim and body have separate non-scoring collisions; misses bounce or fall to the floor. Successful landings leave matching arrow tails in the pot and trigger a small glaze rebound and confetti.

Movement follows random waypoints joined with smooth cubic easing. The first waypoint holds the centre until 12 seconds; later durations depend on travel distance, keeping lateral speed below 0.45 world metres/second. Every turn slows continuously to rest before changing direction.

An absolute monotonic clock controls the round, including time spent in a background tab. A timeout settles any already-launched trajectory up to the deadline, then finishes exactly once. An arrow landing at or after the buzzer cannot score. End round abandons the score; only timeout saves a completed round. Replay resets the score, arrows, pot, input and deadline.

## Local data and integration

`pot-toss.records.v1` stores `{version:1,modes:{120:[],180:[]}}`. Each row has `{score,at}`. Higher scores rank first, older ties first. Zero scores are valid. Invalid values, unsupported versions and unusable dates are ignored. Blocked or full storage retains records for this visit and displays a note.

Traditional Chinese is the default, with English inherited from the landing page. The game is the tenth landing card and has a normal favourite control. The Pages workflow includes its files. Artwork uses local Canvas/SVG and local fonts; the scoped service worker caches game and language modules for offline play after an initial online visit. Reduced motion removes optional decorative movement while retaining the essential trajectory and moving target. The shared touch policy prevents double-tap zoom while permitting pinch zoom.

## Development

No build or dependency installation is required. With Node.js 20 or later:

```sh
cd pot-toss
npm start
npm test
```

Open `/pot-toss/`. See [VERIFICATION.md](./VERIFICATION.md) for automated checks and their limits.

Depth motion eases in after 24 seconds, with a 0.65-world-metre range either side of the original depth. Both mouth and body collisions evaluate that depth at the exact impact time; rendered size changes with perspective. The pastel pot has a cream face, glossy round eyes, pink cheeks and tiny feet. Successful entry triggers a closed-eye smile for 1.1 seconds. A short, far, left, right or rim miss triggers worried brows, a frown and blue tears for 1.5 seconds, then restores the idle face. The latest resolved throw replaces the previous expression immediately. Reduced motion keeps the tears static.

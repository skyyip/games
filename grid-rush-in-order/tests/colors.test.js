import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderedGame, COLOR_PALETTE } from '../src/game.js';

const linearRGB = hex => hex.slice(1).match(/../g).map(value => {
  const channel = parseInt(value, 16) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
});
const luminance = hex => linearRGB(hex).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

// Independent perceptual check: Euclidean distance in Oklab (CSS Color 4).
function oklab(hex) {
  const [r, g, b] = linearRGB(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

test('random colour rounds avoid similar shades while preserving palette and order variation', () => {
  const combinations = new Set();
  const orders = new Set();
  const used = new Set();
  for (const draw of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.999]) {
    const game = new OrderedGame({ mode: 'colors', random: () => draw });
    const colors = game.colorOrder;
    assert.equal(colors.length, 4);
    assert.equal(new Set(colors.map(color => color.id)).size, 4);
    for (const [index, color] of colors.entries()) {
      used.add(color.id);
      for (const other of colors.slice(index + 1)) {
        const lab = oklab(color.hex);
        const otherLab = oklab(other.hex);
        const distance = Math.hypot(...lab.map((value, channel) => value - otherLab[channel]));
        // Product guardrail for distinct game colours, not a WCAG contrast ratio.
        assert.ok(distance >= 0.18, `${color.name} and ${other.name} are too similar (${distance})`);
      }
    }
    const ids = colors.map(color => color.id);
    orders.add(ids.join(','));
    combinations.add([...ids].sort().join(','));
  }
  assert.ok(combinations.size >= 3, 'rounds must vary their colour selection');
  assert.ok(orders.size > combinations.size, 'the colour order must also vary');
  assert.equal(used.size, COLOR_PALETTE.length);
});

test('every palette colour meets the requested 3:1 minimum label contrast', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#ffffff', '#ffffff'), 1);
  for (const color of COLOR_PALETTE) {
    const ratio = contrast(color.hex, color.ink ?? '#ffffff');
    assert.ok(ratio >= 3, `${color.name} label contrast is ${ratio}:1`);
  }
});

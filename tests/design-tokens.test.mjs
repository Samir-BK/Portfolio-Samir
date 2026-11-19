import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stylesheet = readFileSync(
  new URL('../src/app/globals.css', import.meta.url),
  'utf8',
);
const pairs = [
  ...stylesheet.matchAll(
    /--([\w-]+): light-dark\(#([\da-f]{6}), #([\da-f]{6})\);/g,
  ),
];
const palettes = [2, 3].map((index) =>
  Object.fromEntries(pairs.map((pair) => [pair[1], pair[index]])),
);

function luminance(color) {
  const channels = color.match(/../g).map((pair) => {
    const value = Number.parseInt(pair, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test('both palettes meet text and control contrast targets', () => {
  for (const colors of palettes) {
    function check(foreground, background, minimum) {
      assert.ok(
        colors[foreground] && colors[background],
        `${foreground} and ${background} exist`,
      );
      const values = [
        luminance(colors[foreground]),
        luminance(colors[background]),
      ];
      const ratio = (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
      assert.ok(
        ratio >= minimum,
        `${foreground} on ${background}: ${ratio.toFixed(2)} ≥ ${minimum}`,
      );
    }

    for (const surface of ['background', 'surface', 'surface-raised']) {
      check('text-primary', surface, 4.5);
      check('text-secondary', surface, 4.5);
      check('accent-text', surface, 4.5);
      check('focus-ring', surface, 3);
      check('control-border', surface, 3);
      check('accent', surface, 3);
    }

    check('accent-ink', 'accent', 4.5);
    check('accent-ink', 'accent-hover', 4.5);
  }
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { gsd } from '../gsd.ts';

// Test case obtained from Pag 443, Chap 8.
test('Ethylvinylether should have 21 peaks', () => {
  const spectrum: number[][] = JSON.parse(
    readFileSync(
      join(import.meta.dirname, 'data/ethylvinylether.json'),
      'utf8',
    ),
  );
  const result = gsd(
    { x: spectrum[0].toReversed(), y: spectrum[1].toReversed() },
    {
      minMaxRatio: 0.03,
      smoothY: false,
      realTopDetection: true,
      sgOptions: { windowSize: 5, polynomial: 3 },
    },
  );

  expect(result).toHaveLength(21);
});

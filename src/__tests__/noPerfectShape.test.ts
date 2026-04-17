import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { gsd } from '../gsd.ts';

// Test case obtained from Pag 443, Chap 8.
test('Should have 5 peaks', () => {
  const spectrum: { x: number[]; y: number[] } = JSON.parse(
    readFileSync(
      join(import.meta.dirname, 'data/broadNotLorentzianShape.json'),
      'utf8',
    ),
  );
  const sgOptions = { windowSize: 7, polynomial: 3 };
  const peaks = gsd(
    { x: spectrum.x, y: spectrum.y },
    {
      minMaxRatio: 0.05,
      noiseLevel: 1500,
      smoothY: false,
      realTopDetection: false,
      maxCriteria: true,
      sgOptions,
    },
  );

  expect(peaks).toHaveLength(3);
  expect(peaks).toMatchObject([
    {
      x: 7.49587013996984,
      y: 89560.7890625,
      width: 0.006723240417656484,
    },
    {
      x: 7.514817453874146,
      y: 203634.84912109375,
      width: 0.007028842254822365,
    },
    {
      x: 7.534375971452784,
      y: 118908.73388671875,
      width: 0.007028842254822365,
    },
  ]);
});

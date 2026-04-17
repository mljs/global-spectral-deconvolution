import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { expect, test } from 'vitest';

import { gsd } from '../gsd.ts';

const peaks = [
  { x: -0.5, y: 1, width: 0.05 },
  { x: 0.5, y: 1, width: 0.05 },
];

const data: DataXY = generateSpectrum(peaks, {
  generator: {
    from: -1,
    to: 1,
    nbPoints: 101,
  },
  peakOptions: {
    factor: 6,
  },
  noise: {
    percent: 5,
  },
});

test('positive maxima peaks', () => {
  const peakList = gsd(data);

  expect(peakList).toMatchCloseTo([
    { x: -0.5, y: 1.131 },
    { x: 0.5, y: 1.05 },
  ]);
});

test('negative maxima peaks', () => {
  const peakList = gsd({ x: data.x, y: data.y.map((value) => value - 2) }, {});

  expect(peakList).toMatchCloseTo([
    { x: -0.5, y: -0.868 },
    { x: 0.5, y: -0.95 },
  ]);
});

test('Negative peaks', () => {
  // we check negative peaks
  const peakList = gsd(
    { x: data.x, y: data.y.map((value) => -value) },
    { maxCriteria: false },
  );

  expect(peakList).toMatchCloseTo([
    { x: -0.5, y: -1.131 },
    { x: 0.5, y: -1.05 },
  ]);
});

test('minima peaks', () => {
  // we check negative peaks
  const peakList = gsd(
    { x: data.x, y: data.y.map((value) => 1 - value) },
    { maxCriteria: false },
  );

  expect(peakList).toMatchCloseTo([
    { x: -0.5, y: -0.131 },
    { x: 0.5, y: -0.05 },
  ]);
});

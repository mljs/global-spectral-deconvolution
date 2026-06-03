import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { expect, test } from 'vitest';

import { gsd } from '../gsd.ts';

const peaks = [
  { x: -0.5, y: 20, width: 0.05 },
  { x: 0.5, y: -2, width: 0.05 },
];

const data: DataXY = generateSpectrum(peaks, {
  generator: {
    from: -1,
    to: 1,
    nbPoints: 1024,
  },
  peakOptions: {
    factor: 6,
  },
  noise: {
    percent: 0.03,
  },
});

test('maxAbsoluteRatio throws if negative', () => {
  expect(() => gsd(data, { maxAbsoluteRatio: -0.1 })).toThrow(
    'maxAbsoluteRatio must be between 0 and 1',
  );
});

test('maxAbsoluteRatio throws if greater than 1', () => {
  expect(() => gsd(data, { maxAbsoluteRatio: 1.1 })).toThrow(
    'maxAbsoluteRatio must be between 0 and 1',
  );
});

test('should only detect one peak because of maxAbsoluteRatio', () => {
  const result = gsd(data, { maxAbsoluteRatio: 0.2, maxCriteria: true });

  expect(result[0].x).toBeCloseTo(-0.5, 2);
  expect(result[0].y).toBeCloseTo(20, 0);
  expect(result).toHaveLength(1);
});

test('should not detect peaks because of maxAbsoluteRatio', () => {
  const result = gsd(data, { maxAbsoluteRatio: 0.2, maxCriteria: false });

  expect(result).toHaveLength(0);
});

test('should detect one negative peak because of maxAbsoluteRatio is less than threshold', () => {
  const result = gsd(data, { maxAbsoluteRatio: 0.09, maxCriteria: false });

  expect(result).toHaveLength(1);
  expect(result[0].x).toBeCloseTo(0.5, 2);
  expect(result[0].y).toBeCloseTo(-2, 0);
});

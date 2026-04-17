import { expect, test } from 'vitest';

import { groupPeaks } from '../groupPeaks.ts';

test('default factor value', () => {
  const result = groupPeaks([
    { x: 5, y: 10, width: 5 },
    { x: 10, y: 10, width: 5 },
    { x: 30, y: 10, width: 5 },
  ]);

  expect(result).toStrictEqual([
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
    ],
    [{ x: 30, y: 10, width: 5 }],
  ]);
});

test('factor = 0.1', () => {
  const result = groupPeaks(
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
    { factor: 0.1 },
  );

  expect(result).toStrictEqual([
    [{ x: 5, y: 10, width: 5 }],
    [{ x: 10, y: 10, width: 5 }],
    [{ x: 30, y: 10, width: 5 }],
  ]);
});

test('factor=3', () => {
  const result = groupPeaks(
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
    { factor: 3 },
  );

  expect(result).toStrictEqual([
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
    ],
    [{ x: 30, y: 10, width: 5 }],
  ]);
});

test('factor=5', () => {
  const result = groupPeaks(
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
    { factor: 5 },
  );

  expect(result).toStrictEqual([
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
  ]);
});

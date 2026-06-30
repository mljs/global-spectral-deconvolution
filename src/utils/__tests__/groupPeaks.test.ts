import { expect, test } from 'vitest';

import { groupPeaks } from '../groupPeaks.ts';

test('default groupingFactor value', () => {
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

test('groupingFactor = 0.1', () => {
  const result = groupPeaks(
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
    { groupingFactor: 0.1 },
  );

  expect(result).toStrictEqual([
    [{ x: 5, y: 10, width: 5 }],
    [{ x: 10, y: 10, width: 5 }],
    [{ x: 30, y: 10, width: 5 }],
  ]);
});

test('groupingFactor=3', () => {
  const result = groupPeaks(
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
    { groupingFactor: 3 },
  );

  expect(result).toStrictEqual([
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
    ],
    [{ x: 30, y: 10, width: 5 }],
  ]);
});

test('groupingFactor=5', () => {
  const result = groupPeaks(
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
    { groupingFactor: 5 },
  );

  expect(result).toStrictEqual([
    [
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ],
  ]);
});

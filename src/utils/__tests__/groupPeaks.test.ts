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

test('groups broad partially-overlapping peaks with default hybrid criterion', () => {
  const result = groupPeaks([
    { x: 10, y: 10, width: 20 },
    { x: 25, y: 10, width: 2 },
    { x: 60, y: 10, width: 2 },
  ]);

  expect(result).toStrictEqual([
    [
      { x: 10, y: 10, width: 20 },
      { x: 25, y: 10, width: 2 },
    ],
    [{ x: 60, y: 10, width: 2 }],
  ]);
});

test('overlapFactor=0 disables overlap-based extension and keeps strict distance grouping', () => {
  const result = groupPeaks(
    [
      { x: 10, y: 10, width: 20 },
      { x: 25, y: 10, width: 2 },
      { x: 60, y: 10, width: 2 },
    ],
    { overlapFactor: 0 },
  );

  expect(result).toStrictEqual([
    [{ x: 10, y: 10, width: 20 }],
    [{ x: 25, y: 10, width: 2 }],
    [{ x: 60, y: 10, width: 2 }],
  ]);
});

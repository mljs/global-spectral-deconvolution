import { expect, test } from 'vitest';

import { splitGroup } from '../splitGroup.ts';

function createPeaks(values: number[]) {
  const peaks = [];
  for (const value of values) {
    peaks.push({ x: value, width: 1 });
  }
  return peaks;
}

test('separe first far peaks  larger than maxNumberOfPeaks', () => {
  const group = Array.from({ length: 21 }, (_, i) => ({
    x: i,
    width: 1,
  }));

  group[19].x = 100;
  group[20].x = 200;

  const result = splitGroup(group, 10);

  expect(result).toHaveLength(4);

  // Largest gaps are near the end
  const lengths = [];
  for (const group of result) {
    lengths.push(group.length);
  }

  expect(lengths).toStrictEqual([9, 10, 1, 1]);
});

test.each([
  {
    values: [1, 2, 3, 4, 5, 7, 8],
    maxNumberOfPeaks: 5,
    expected: [
      [1, 2, 3, 4, 5],
      [7, 8],
    ],
  },
  {
    values: [1, 2, 4, 5, 6, 7, 8],
    maxNumberOfPeaks: 5,
    expected: [
      [1, 2],
      [4, 5, 6, 7, 8],
    ],
  },
  {
    values: [1, 2, 3, 4, 5, 6],
    maxNumberOfPeaks: 5,
    expected: [
      [1, 2, 3],
      [4, 5, 6],
    ],
  },
  {
    values: [1, 2, 3, 4],
    maxNumberOfPeaks: 5,
    expected: [[1, 2, 3, 4]],
  },
  {
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    maxNumberOfPeaks: 5,
    expected: [
      [1, 2, 3, 4, 5],
      [6, 7, 8],
      [9, 10, 11],
    ],
  },
  {
    values: [1, 2, 4, 5, 6, 8, 9, 10, 11],
    maxNumberOfPeaks: 3,
    expected: [
      [1, 2],
      [4, 5, 6],
      [8, 9],
      [10, 11],
    ],
  },
])(
  'splits $values with max $maxNumberOfPeaks',
  ({ values, maxNumberOfPeaks, expected }) => {
    const result = splitGroup(createPeaks(values), maxNumberOfPeaks);

    const resultValues = [];
    for (const group of result) {
      const valuesInGroup = [];
      for (const peak of group) {
        valuesInGroup.push(peak.x);
      }
      resultValues.push(valuesInGroup);
    }

    expect(resultValues).toStrictEqual(expected);
  },
);

test('keeps grouped peaks below the max size around a large gap', () => {
  const result = splitGroup(
    createPeaks([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13]),
    3,
  );

  let allGroupsWithinMaxSize = true;
  for (const group of result) {
    if (group.length > 3) {
      allGroupsWithinMaxSize = false;
      break;
    }
  }

  expect(allGroupsWithinMaxSize).toBe(true);

  const flattenedValues = [];
  for (const group of result) {
    for (const peak of group) {
      flattenedValues.push(peak.x);
    }
  }

  expect(flattenedValues).toStrictEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13,
  ]);
});

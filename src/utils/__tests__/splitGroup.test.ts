import { expect, test } from 'vitest';

import { splitGroup } from '../splitGroup.ts';

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
  expect(result.map((g) => g.length)).toStrictEqual([9, 10, 1, 1]);
});

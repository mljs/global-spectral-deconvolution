import { expect, test } from 'vitest';

import { xGetCrossZeroPoints } from '../algorithms/xGetCrossZeroPoints.ts';

test('cross with exact zero', () => {
  const y = [1, 1, 1];
  const dY = [1e-10, 0, 1e-8];

  const result = xGetCrossZeroPoints({
    y,
    dY,
  });

  expect(result).toHaveLength(0);
});

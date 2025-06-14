import { describe, expect, it } from 'vitest';

import { optimizeTop } from '../optimizeTop.ts';

describe('optimizeTop', () => {
  it('no change', () => {
    const peaks = [{ index: 2, x: 2, y: 5 }];
    optimizeTop({ x: [0, 1, 2, 3, 4], y: [1, 3, 5, 3, 1] }, peaks);
    expect(peaks).toBeDeepCloseTo([{ index: 2, x: 2, y: 5 }]);
  });
  it('should optimize', () => {
    const peaks = [{ index: 2, x: 2, y: 5 }];
    optimizeTop({ x: [0, 1, 2, 3, 4], y: [1, 3, 5, 4, 1] }, peaks);
    expect(peaks).toBeDeepCloseTo([
      { index: 2, x: 2.195976944413467, y: 5.048994236103367 },
    ]);
  });
});

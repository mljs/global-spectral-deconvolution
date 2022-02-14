import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import { optimizeTop } from '../optimizeTop';

expect.extend({ toBeDeepCloseTo });

describe('optimizeTop', () => {
  it('no change', () => {
    let peaks = [{ index: 2, x: 2, y: 5 }];
    optimizeTop({ x: [0, 1, 2, 3, 4], y: [1, 3, 5, 3, 1] }, peaks);
    expect(peaks).toBeDeepCloseTo([{ index: 2, x: 2, y: 5 }]);
  });
  it('should optimize', () => {
    let peaks = [{ index: 2, x: 2, y: 5 }];
    optimizeTop({ x: [0, 1, 2, 3, 4], y: [1, 3, 5, 4, 1] }, peaks);
    expect(peaks).toBeDeepCloseTo([
      { index: 2, x: 2.195976944413467, y: 5.048994236103367 },
    ]);
  });
});

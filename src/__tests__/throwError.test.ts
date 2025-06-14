import { describe, expect, it } from 'vitest';

import { gsd } from '../gsd.ts';

describe('Throw Errors', () => {
  it('decreasing x data', () => {
    const data = {
      x: [5, 4, 3, 2, 1],
      y: [1, 2, 4, 3, 1],
    };
    expect(() => gsd(data)).toThrow(
      'GSD only accepts monotone increasing x values',
    );
  });
});

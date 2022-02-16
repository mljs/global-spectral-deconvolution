import { gsd } from '../gsd';

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

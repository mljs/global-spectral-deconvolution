'use strict';

var broadenPeaks = require('../broadenPeaks');

describe('broadenPeaks', () => {
  test('should prevent overlap', () => {
    let result = broadenPeaks([
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 }
    ]);
    expect(result).toEqual([
      { from: 0, to: 7.5, width: 7.5, x: 5, y: 10 },
      { from: 7.5, to: 15, width: 7.5, x: 10, y: 10 },
      { from: 25, to: 35, width: 10, x: 30, y: 10 }
    ]);
  });

  test('should prevent overlap but small factor', () => {
    let result = broadenPeaks(
      [
        { x: 5, y: 10, width: 5 },
        { x: 10, y: 10, width: 5 },
        { x: 30, y: 10, width: 5 }
      ],
      { factor: 0.5 }
    );
    expect(result).toEqual([
      { from: 3.75, to: 6.25, width: 2.5, x: 5, y: 10 },
      { from: 8.75, to: 11.25, width: 2.5, x: 10, y: 10 },
      { from: 28.75, to: 31.25, width: 2.5, x: 30, y: 10 }
    ]);
  });

  test('should allow overlap', () => {
    let result = broadenPeaks(
      [
        { x: 5, y: 10, width: 5 },
        { x: 10, y: 10, width: 5 },
        { x: 30, y: 10, width: 5 }
      ],
      { overlap: true }
    );
    expect(result).toEqual([
      { from: 0, to: 10, width: 10, x: 5, y: 10 },
      { from: 5, to: 15, width: 10, x: 10, y: 10 },
      { from: 25, to: 35, width: 10, x: 30, y: 10 }
    ]);
  });
});

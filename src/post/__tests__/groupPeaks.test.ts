import { groupPeaks } from '../groupPeaks';

describe('groupPeaks', () => {
  it('default factor value', () => {
    let result = groupPeaks([
      { index: 1, x: 5, y: 10, width: 5 },
      { index: 2, x: 10, y: 10, width: 5 },
      { index: 3, x: 30, y: 10, width: 5 },
    ]);
    expect(result).toStrictEqual([
      [
        { index: 1, x: 5, y: 10, width: 5 },
        { index: 2, x: 10, y: 10, width: 5 },
      ],
      [{ index: 3, x: 30, y: 10, width: 5 }],
    ]);
  });

  it('factor = 0.1', () => {
    let result = groupPeaks(
      [
        { index: 1, x: 5, y: 10, width: 5 },
        { index: 2, x: 10, y: 10, width: 5 },
        { index: 3, x: 30, y: 10, width: 5 },
      ],
      0.1,
    );
    expect(result).toStrictEqual([
      [{ index: 1, x: 5, y: 10, width: 5 }],
      [{ index: 2, x: 10, y: 10, width: 5 }],
      [{ index: 3, x: 30, y: 10, width: 5 }],
    ]);
  });

  it('factor=3', () => {
    let result = groupPeaks(
      [
        { index: 1, x: 5, y: 10, width: 5 },
        { index: 2, x: 10, y: 10, width: 5 },
        { index: 3, x: 30, y: 10, width: 5 },
      ],
      3,
    );
    expect(result).toStrictEqual([
      [
        { index: 1, x: 5, y: 10, width: 5 },
        { index: 2, x: 10, y: 10, width: 5 },
      ],
      [{ index: 3, x: 30, y: 10, width: 5 }],
    ]);
  });

  it('factor=5', () => {
    let result = groupPeaks(
      [
        { index: 1, x: 5, y: 10, width: 5 },
        { index: 2, x: 10, y: 10, width: 5 },
        { index: 3, x: 30, y: 10, width: 5 },
      ],
      5,
    );
    expect(result).toStrictEqual([
      [
        { index: 1, x: 5, y: 10, width: 5 },
        { index: 2, x: 10, y: 10, width: 5 },
        { index: 3, x: 30, y: 10, width: 5 },
      ],
    ]);
  });
});

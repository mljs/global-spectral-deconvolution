import { broadenPeaks } from '../broadenPeaks';

describe('broadenPeaks', () => {
  it('should prevent overlap', () => {
    let result = broadenPeaks([
      { x: 5, y: 10, width: 5 },
      { x: 10, y: 10, width: 5 },
      { x: 30, y: 10, width: 5 },
    ]);
    expect(result).toStrictEqual([
      {
        x: 5,
        y: 10,
        width: 7.5
      },
      {
        x: 10,
        y: 10,
        width: 7.5
      },
      {
        x: 30,
        y: 10,
        width: 10
      },
    ]);
  });

  it('should prevent overlap with factor=1', () => {
    let result = broadenPeaks(
      [
        { x: 5, y: 10, width: 10 },
        { x: 10, y: 10, width: 10 },
        { x: 30, y: 10, width: 10 },
      ],
      { factor: 1 },
    );
    expect(result).toStrictEqual([
      { width: 7.5, x: 5, y: 10 },
      { width: 7.5, x: 10, y: 10 },
      { width: 10, x: 30, y: 10 },
    ]);
  });

  it('should prevent overlap with factor=3', () => {
    let result = broadenPeaks(
      [
        { x: 5, y: 10, width: 10 },
        { x: 10, y: 10, width: 10 },
        { x: 30, y: 10, width: 10 },
      ],
      { factor: 3 },
    );
    expect(result).toStrictEqual([
      { width: 17.5, x: 5, y: 10 },
      { width: 12.5, x: 10, y: 10 },
      { width: 25, x: 30, y: 10 },
    ]);
  });

  it('should prevent overlap but small factor', () => {
    let result = broadenPeaks(
      [
        { x: 5, y: 10, width: 5 },
        { x: 10, y: 10, width: 5 },
        { x: 30, y: 10, width: 5 },
      ],
      { factor: 0.5 },
    );
    expect(result).toStrictEqual([
      { width: 2.5, x: 5, y: 10 },
      { width: 2.5, x: 10, y: 10 },
      { width: 2.5, x: 30, y: 10 },
    ]);
  });

  it('should allow overlap', () => {
    let result = broadenPeaks(
      [
        { x: 5, y: 10, width: 5 },
        { x: 10, y: 10, width: 5 },
        { x: 30, y: 10, width: 5 },
      ],
      { overlap: true },
    );
    expect(result).toStrictEqual([
      { width: 10, x: 5, y: 10 },
      { width: 10, x: 10, y: 10 },
      { width: 10, x: 30, y: 10 },
    ]);
  });
});

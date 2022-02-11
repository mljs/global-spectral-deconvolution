import { gsd } from '../gsd';

describe('Simple test cases', () => {
  it('length = 0', () => {
    let x = [];
    let y = [];
    expect(() => {
      gsd({ x, y });
    }).toThrow('input must not be empty');
  });

  it('length = 2', () => {
    let x = [1, 2];
    let y = [2, 3];
    expect(() => {
      gsd({ x, y });
    }).toThrow('Window size is higher than the data length 9>2');
  });

  it('no peaks', () => {
    let x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let y = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
    let peaks = gsd({ x, y });
    expect(peaks[0].x).toBe(8);
  });
});

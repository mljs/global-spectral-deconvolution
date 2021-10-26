import { toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { getShape1D } from 'ml-peak-shape-generator';

import { gsd } from '../gsd';

expect.extend({ toMatchCloseTo });

describe('Simple test cases', () => {
  let x: number[] = [];
  let y: number[] = [];
  let negY: number[] = [];
  for (let i = 0; i < 10; i++) {
    x.push(x.length);
    y.push(0);
    negY.push(0);
  }
  for (let i = 0; i <= 10; i++) {
    x.push(x.length);
    let newY = i > 5 ? 10 - i : i;
    y.push(newY);
    negY.push(-newY);
  }
  for (let i = 0; i < 10; i++) {
    x.push(x.length);
    y.push(0);
    negY.push(0);
  }

  let widthToFWHM = getShape1D('gaussian').widthToFWHM;

  it('gsd not realtop', () => {
    let peaks = gsd(
      { x, y },
      {
        realTopDetection: false,
        smoothY: true,
        sgOptions: {
          windowSize: 5,
          polynomial: 3,
        },
      },
    );

    expect(peaks[0].y).toBeCloseTo(4.657, 3);
    expect(peaks[0].shape.noiseLevel).toBeCloseTo(1.1956, 3);
    expect(peaks[0].x).toBeCloseTo(15, 2);
  });

  it('gsd negative peak', () => {
    let peaks = gsd(
      { x, y: negY },
      {
        realTopDetection: false,
        maxCriteria: false,
        smoothY: true,
        sgOptions: {
          windowSize: 5,
          polynomial: 3,
        },
      },
    );
    expect(peaks[0].y).toBeCloseTo(-4.657, 3);
    expect(peaks[0].shape.noiseLevel).toBeCloseTo(1.1956, 3);
    expect(peaks[0].x).toBeCloseTo(15, 2);
  });

  it('gsd not realtop asymetric', () => {
    let Y2 = y.slice(0);
    Y2[14] = 5;
    let peaks = gsd(
      { x, y: Y2 },
      {
        realTopDetection: false,
        smoothY: true,
        sgOptions: {
          windowSize: 5,
          polynomial: 3,
        },
      },
    );

    expect(peaks).toMatchCloseTo(
      [
        {
          shape: {
            noiseLevel: 1.2434539324230613,
            soft: false,
            width: widthToFWHM(3),
          },
          x: 15,
          y: 5,
        },
      ],
      2,
    );
  });

  it('gsd realtop', () => {
    let Y2 = y.slice();
    Y2[14] = 5;
    let peaks = gsd(
      { x, y: Y2 },
      {
        realTopDetection: true,
        smoothY: false,
        sgOptions: {
          windowSize: 5,
          polynomial: 3,
        },
      },
    );
    expect(peaks).toMatchCloseTo(
      [
        {
          shape: {
            noiseLevel: 1.2434539324230613,
            soft: false,
            width: widthToFWHM(3),
          },
          x: 14.5,
          y: 4.006546067576939,
        },
      ],
      2,
    );
  });
});

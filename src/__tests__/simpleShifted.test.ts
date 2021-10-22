import { DoubleArray } from 'cheminfo-types';
import { toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { getShape1D } from 'ml-peak-shape-generator';

import { gsd } from '..';

expect.extend({ toMatchCloseTo });

describe('Simple shifted baseline test cases', () => {
  let x: DoubleArray = [];
  let y: DoubleArray = [];
  let negY: DoubleArray = [];
  for (let i = 0; i < 10; i++) {
    x.push(x.length);
    y.push(1);
    negY.push(-1);
  }
  for (let i = 0; i <= 10; i++) {
    x.push(x.length);
    let newY = i > 5 ? 10 - i : i;
    y.push(newY);
    negY.push(-newY);
  }
  for (let i = 0; i < 10; i++) {
    x.push(x.length);
    y.push(1);
    negY.push(-1);
  }

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
    let widthToFWHM = getShape1D('gaussian').widthToFWHM;
    expect(peaks).toHaveLength(1);
    expect(peaks[0]).toMatchCloseTo({
      x: 15,
      y: 4.657142857142857,
      shape: {
        width: widthToFWHM(2),
        soft: false,
        noiseLevel: 0.6695521174585716,
      },
    });
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
    let widthToFWHM = getShape1D('gaussian').widthToFWHM;
    expect(peaks).toHaveLength(1);
    expect(peaks[0]).toMatchCloseTo({
      x: 15,
      y: -4.657142857142857,
      shape: {
        width: widthToFWHM(2),
        soft: false,
        noiseLevel: 0.6695521174585716,
      },
    });
  });
});

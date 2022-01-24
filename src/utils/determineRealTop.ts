import { DoubleArray } from 'cheminfo-types';
import { Peak1D } from '../gsd';

export function determineRealTop(options: {
  peaks: Peak1D[];
  x: DoubleArray;
  y: DoubleArray;
  indexes: number[];
}): void {
  const { peaks, x, y, indexes } = options;
  let alpha: number;
  let beta: number;
  let gamma: number;
  let p: number;
  for (let i = 0; i < peaks.length; i++) {
    const peak = peaks[i];
    let currentPoint = indexes[i];
    // The detected peak could be moved 1 or 2 units to left or right.
    if (
      y[currentPoint - 1] >= y[currentPoint - 2] &&
      y[currentPoint - 1] >= y[currentPoint]
    ) {
      currentPoint--;
    } else {
      if (
        y[currentPoint + 1] >= y[currentPoint] &&
        y[currentPoint + 1] >= y[currentPoint + 2]
      ) {
        currentPoint++;
      } else {
        if (
          y[currentPoint - 2] >= y[currentPoint - 3] &&
          y[currentPoint - 2] >= y[currentPoint - 1]
        ) {
          currentPoint -= 2;
        } else {
          if (
            y[currentPoint + 2] >= y[currentPoint + 1] &&
            y[currentPoint + 2] >= y[currentPoint + 3]
          ) {
            currentPoint += 2;
          }
        }
      }
    }
    // interpolation to a sin() function
    if (
      y[currentPoint - 1] > 0 &&
      y[currentPoint + 1] > 0 &&
      y[currentPoint] >= y[currentPoint - 1] &&
      y[currentPoint] >= y[currentPoint + 1] &&
      (y[currentPoint] !== y[currentPoint - 1] ||
        y[currentPoint] !== y[currentPoint + 1])
    ) {
      alpha = 20 * Math.log10(y[currentPoint - 1]);
      beta = 20 * Math.log10(y[currentPoint]);
      gamma = 20 * Math.log10(y[currentPoint + 1]);
      p = (0.5 * (alpha - gamma)) / (alpha - 2 * beta + gamma);
      peak.x = x[currentPoint] + (x[currentPoint] - x[currentPoint - 1]) * p;
      peak.y =
        y[currentPoint] -
        0.25 * (y[currentPoint - 1] - y[currentPoint + 1]) * p;
    }
  }
}

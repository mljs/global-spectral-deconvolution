import { DoubleArray } from 'cheminfo-types';

/**
 * We check that the maximal slot with is not larger that 5% of the minimal slot width
 * @param x
 * @returns
 */
export function isEquallySpaced(x: DoubleArray): boolean {
  let maxDx = 0;
  let minDx = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < x.length - 1; ++i) {
    let absoluteDifference = Math.abs(x[i + 1] - x[i]);
    if (absoluteDifference < minDx) {
      minDx = absoluteDifference;
    }
    if (absoluteDifference > maxDx) {
      maxDx = absoluteDifference;
    }
  }
  return (maxDx - minDx) / maxDx < 0.05;
}

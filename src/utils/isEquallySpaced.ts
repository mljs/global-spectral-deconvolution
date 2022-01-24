import { DoubleArray } from 'cheminfo-types';

export function isEquallySpaced(x: DoubleArray): boolean {
  let tmp: number;
  let maxDx = 0;
  let minDx = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < x.length - 1; ++i) {
    tmp = Math.abs(x[i + 1] - x[i]);
    if (tmp < minDx) {
      minDx = tmp;
    }
    if (tmp > maxDx) {
      maxDx = tmp;
    }
  }
  return (maxDx - minDx) / maxDx < 0.05;
}

import type { DataXY } from 'cheminfo-types';

/**
 * Correction of the x and y coordinates using a quadratic optimizations with the peak and its 3 closest neighbors to determine the true x,y values of the peak.
 * This process is done in place and is very fast.
 * @param data
 * @param peaks
 */
export function optimizeTop(
  data: DataXY,
  peaks: Array<{ index: number; x: number; y: number }>,
): void {
  const { x, y } = data;

  for (const peak of peaks) {
    let currentIndex = peak.index;
    // The detected peak could be moved 1 or 2 units to left or right.
    if (
      y[currentIndex - 1] >= y[currentIndex - 2] &&
      y[currentIndex - 1] >= y[currentIndex]
    ) {
      currentIndex--;
    } else if (
      y[currentIndex + 1] >= y[currentIndex] &&
      y[currentIndex + 1] >= y[currentIndex + 2]
    ) {
      currentIndex++;
    } else if (
      y[currentIndex - 2] >= y[currentIndex - 3] &&
      y[currentIndex - 2] >= y[currentIndex - 1]
    ) {
      currentIndex -= 2;
    } else if (
      y[currentIndex + 2] >= y[currentIndex + 1] &&
      y[currentIndex + 2] >= y[currentIndex + 3]
    ) {
      currentIndex += 2;
    }
    // interpolation to a sin() function
    if (
      y[currentIndex - 1] > 0 &&
      y[currentIndex + 1] > 0 &&
      y[currentIndex] >= y[currentIndex - 1] &&
      y[currentIndex] >= y[currentIndex + 1] &&
      (y[currentIndex] !== y[currentIndex - 1] ||
        y[currentIndex] !== y[currentIndex + 1])
    ) {
      const alpha = 20 * Math.log10(y[currentIndex - 1]);
      const beta = 20 * Math.log10(y[currentIndex]);
      const gamma = 20 * Math.log10(y[currentIndex + 1]);
      const p = (0.5 * (alpha - gamma)) / (alpha - 2 * beta + gamma);
      const xCurrent: number = x[currentIndex];
      const xPrevious: number = x[currentIndex - 1];
      peak.x = xCurrent + (xCurrent - xPrevious) * p;
      peak.y =
        y[currentIndex] -
        0.25 * (y[currentIndex - 1] - y[currentIndex + 1]) * p;
    }
  }
}

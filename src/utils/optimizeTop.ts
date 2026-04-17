import type { DataXY } from 'cheminfo-types';

/**
 * Refine the `x` and `y` coordinates of each peak by running a quadratic
 * interpolation over the peak and its 3 closest neighbors.
 * The correction is performed in place.
 * @param data - Object with `x` and `y` arrays.
 * @param peaks - Peaks to refine (mutated in place).
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
    // Quadratic interpolation on log-intensities to refine the peak top.
    if (
      y[currentIndex - 1] > 0 &&
      y[currentIndex + 1] > 0 &&
      y[currentIndex] >= y[currentIndex - 1] &&
      y[currentIndex] >= y[currentIndex + 1] &&
      (y[currentIndex] !== y[currentIndex - 1] ||
        y[currentIndex] !== y[currentIndex + 1])
    ) {
      const alpha = Math.log10(y[currentIndex - 1]);
      const beta = Math.log10(y[currentIndex]);
      const gamma = Math.log10(y[currentIndex + 1]);
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

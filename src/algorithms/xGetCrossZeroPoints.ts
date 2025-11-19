import type { PeakData } from './PeakData.ts';

export type XGetCrossZeroPointsInput = Pick<PeakData, 'y' | 'dY'>;

/**
 * Finds the indices where the first derivative crosses zero (sign change),
 * which are potential peak positions. This function does not detect zero-crossings
 * in regions with consecutive zero values in the derivative (flat regions).
 *
 * @param input - Object containing the y values and their first derivative (dY).
 * @returns Array of indices where the first derivative crosses zero (excluding consecutive zeros).
 */
export function xGetCrossZeroPoints(input: XGetCrossZeroPointsInput) {
  const { y, dY } = input;

  const crossDy: number[] = [];

  for (let i = 1; i < y.length - 1; ++i) {
    if (isLessAndGreaterThanZero(dY[i], dY[i + 1])) {
      // push the index of the element closer to zero
      crossDy.push(Math.abs(dY[i]) < Math.abs(dY[i + 1]) ? i : i + 1);
    } else if (
      // Handle exact zero
      dY[i] === 0 &&
      isLessAndGreaterThanZero(dY[i - 1], dY[i + 1])
    ) {
      crossDy.push(i);
    }
  }
  return crossDy;
}

function isLessAndGreaterThanZero(back: number, next: number) {
  return (back < 0 && next > 0) || (back > 0 && next < 0);
}

import type { PeakData } from './PeakData.ts';

export type xGetCrossZeroPointsInput = Pick<PeakData, 'y' | 'dY'>;
export function xGetCrossZeroPoints(input: xGetCrossZeroPointsInput) {
  const { y, dY } = input;

  const crossDy: number[] = [];

  for (let i = 1; i < y.length - 1; ++i) {
    if ((dY[i] < 0 && dY[i + 1] > 0) || (dY[i] > 0 && dY[i + 1] < 0)) {
      // push the index of the element closer to zero
      crossDy.push(Math.abs(dY[i]) < Math.abs(dY[i + 1]) ? i : i + 1);
    } else if (
      // Handle exact zero
      dY[i] === 0 &&
      dY[i] < Math.abs(dY[i + 1]) &&
      dY[i] < Math.abs(dY[i - 1])
    ) {
      crossDy.push(i);
    }
  }
  return crossDy;
}

import type { PeakData } from './PeakData.ts';
import { getMinMaxIntervalsDy } from './getMinMaxIntervals.ts';
import { getPeakFromIntervals } from './getPeaksFromIntervals.ts';

/**
 * Detect peaks using local minima of the second derivative (inflection points).
 * @param input - Spectrum values and its first/second derivatives.
 * @returns The detected peaks.
 */
export function secondDerivative(input: PeakData) {
  const { x, y, yData, dY, ddY, dX, yThreshold } = input;

  const minddY: number[] = [];
  const { intervalL, intervalR } = getMinMaxIntervalsDy(y, x, dY, dX);

  // By the intermediate value theorem We cannot find 2 consecutive maximum or minimum
  for (let i = 1; i < y.length - 1; ++i) {
    // Minimum in second derivative
    if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
      minddY.push(i);
    }
  }

  return getPeakFromIntervals({
    minData: minddY,
    intervalL,
    intervalR,
    x,
    yData,
    yThreshold,
    ddY,
  });
}

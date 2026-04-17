import type { PeakData } from './PeakData.ts';
import { getMinMaxIntervalsDy } from './getMinMaxIntervals.ts';
import { getPeakFromIntervals } from './getPeaksFromIntervals.ts';
import { xGetCrossZeroPoints } from './xGetCrossZeroPoints.ts';

/**
 * Detect peaks using zero-crossings of the first derivative.
 * @param input - Spectrum values and its first/second derivatives.
 * @returns The detected peaks.
 */
export function firstDerivative(input: PeakData) {
  const { y, x, dY, dX, yData, yThreshold, ddY } = input;
  const crossDy = xGetCrossZeroPoints(input);
  const { intervalL, intervalR } = getMinMaxIntervalsDy(y, x, dY, dX);

  return getPeakFromIntervals({
    minData: crossDy,
    intervalL,
    intervalR,
    x,
    yData,
    yThreshold,
    ddY,
  });
}

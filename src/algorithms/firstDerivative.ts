import type { PeakData } from './PeakData.ts';
import { getMinMaxIntervalsDy } from './getMinMaxIntervals.ts';
import { getPeakFromIntervals } from './getPeaksFromIntervals.ts';

export function firstDerivative(input: PeakData) {
  const { x, y, yData, dY, ddY, dX, yThreshold } = input;

  const crossDy: number[] = [];
  const { intervalL, intervalR } = getMinMaxIntervalsDy(y, x, dY, dX);

  for (let i = 1; i < y.length - 1; ++i) {
    if ((dY[i] < 0 && dY[i + 1] > 0) || (dY[i] > 0 && dY[i + 1] < 0)) {
      // push the index of the element closer to zero
      crossDy.push(Math.abs(dY[i]) < Math.abs(dY[i + 1]) ? i : i + 1);
    }
    // Handle exact zero
    if (
      dY[i] === 0 &&
      dY[i] < Math.abs(dY[i + 1]) &&
      dY[i] < Math.abs(dY[i - 1])
    ) {
      crossDy.push(i);
    }
  }

  return getPeakFromIntervals({
    minData: crossDy,
    intervalL,
    intervalR,
    x,
    y,
    yData,
    yThreshold,
    ddY,
  });
}

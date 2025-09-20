import type { NumberArray } from 'cheminfo-types';

import { getMinMaxIntervalsDy } from './getMinMaxIntervals.ts';
import { getPeakFromIntervals } from './getPeaksFromIntervals.ts';

export function secondDerivative(input: {
  x: NumberArray;
  y: NumberArray;
  yData: NumberArray;
  dY: NumberArray;
  ddY: NumberArray;
  yThreshold: number;
  dX: number;
}) {
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
    y,
    yData,
    yThreshold,
    ddY,
  });
}

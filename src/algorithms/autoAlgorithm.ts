import type { GSDPeakID } from '../gsd.ts';

import type { PeakData } from './PeakData.ts';
import { getMinMaxIntervalsDy } from './getMinMaxIntervals.ts';
import { tryMatchOneIntervalWithMinData } from './tryMatchOneIntervalWithMinData.ts';

/**
 * Peak detection that combines first-derivative zero-crossings and
 * second-derivative local minima to find peaks inside each interval.
 * @param input - Spectrum values together with its first and second derivatives.
 * @returns The detected peaks.
 */
export function autoAlgorithm(input: PeakData) {
  const { x, y, yData, dY, ddY, dX, yThreshold } = input;

  const minddY: number[] = [];
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

    // Minimum in second derivative
    if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
      minddY.push(i);
    }
  }

  const peaks: GSDPeakID[] = [];
  let lastK = -1;
  let lastJ = -1;
  for (let i = 0; i < intervalL.length; i++) {
    const intervalWidth = (intervalR[i].x - intervalL[i].x) / 2;
    const intervalCenter = (intervalR[i].x + intervalL[i].x) / 2;

    let yIndex = -1;
    let match = tryMatchOneIntervalWithMinData({
      x,
      yData,
      lastK,
      yThreshold,
      intervalWidth,
      intervalCenter,
      minData: crossDy,
    });
    lastK = match.lastIndex;
    if (match.possible !== -1) {
      yIndex = crossDy[match.possible];
    } else {
      match = tryMatchOneIntervalWithMinData({
        x,
        yData,
        yThreshold,
        lastK: lastJ,
        intervalWidth,
        intervalCenter,
        minData: minddY,
      });
      if (match.possible !== -1) {
        yIndex = minddY[match.possible];
      }
      lastJ = match.lastIndex;
    }

    if (yIndex !== -1) {
      const width = Math.abs(intervalR[i].x - intervalL[i].x);
      peaks.push({
        id: crypto.randomUUID(),
        x: x[yIndex],
        y: y[yIndex],
        width,
        index: yIndex,
        ddY: ddY[yIndex],
        inflectionPoints: {
          from: intervalL[i],
          to: intervalR[i],
        },
      });
    }
  }

  return peaks;
}

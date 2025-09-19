import type { NumberArray } from 'cheminfo-types';

import type { XIndex } from '../XIndex.ts';
import type { GSDPeakID } from '../gsd.ts';

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
  let lastMax: XIndex | null = null;
  let lastMin: XIndex | null = null;
  const minddY: number[] = [];
  const intervalL: XIndex[] = [];
  const intervalR: XIndex[] = [];

  // By the intermediate value theorem We cannot find 2 consecutive maximum or minimum
  for (let i = 1; i < y.length - 1; ++i) {
    if (
      (dY[i] < dY[i - 1] && dY[i] <= dY[i + 1]) ||
      (dY[i] <= dY[i - 1] && dY[i] < dY[i + 1])
    ) {
      lastMin = {
        x: x[i],
        index: i,
      };
      if (dX > 0 && lastMax !== null) {
        intervalL.push(lastMax);
        intervalR.push(lastMin);
      }
    }

    // Maximum in first derivative
    if (
      (dY[i] >= dY[i - 1] && dY[i] > dY[i + 1]) ||
      (dY[i] > dY[i - 1] && dY[i] >= dY[i + 1])
    ) {
      lastMax = {
        x: x[i],
        index: i,
      };
      if (dX < 0 && lastMin !== null) {
        intervalL.push(lastMax);
        intervalR.push(lastMin);
      }
    }

    // Minimum in second derivative
    if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
      minddY.push(i);
    }
  }
  let lastK = -1;
  const peaks: GSDPeakID[] = [];
  for (let i = 0; i < intervalL.length; i++) {
    let minDistance = Number.POSITIVE_INFINITY;
    const intervalWidth = (intervalR[i].x - intervalL[i].x) / 2;

    let possible = -1;
    for (let k = lastK + 1; k < minddY.length; ++k) {
      const minddYIndex = minddY[k];
      if (yData[minddYIndex] <= yThreshold) {
        continue;
      }

      const deltaX = x[minddYIndex];
      const currentDistance = Math.abs(
        deltaX - (intervalL[i].x + intervalR[i].x) / 2,
      );

      if (currentDistance < intervalWidth) {
        if (currentDistance < minDistance) {
          possible = k;
        }
        lastK = k;
      }
      if (currentDistance >= minDistance) break;
      minDistance = currentDistance;
    }

    if (possible !== -1) {
      const minddYIndex = minddY[possible];
      const width = Math.abs(intervalR[i].x - intervalL[i].x);
      peaks.push({
        id: crypto.randomUUID(),
        x: x[minddYIndex],
        y: yData[minddYIndex],
        width,
        index: minddYIndex,
        ddY: ddY[minddYIndex],
        inflectionPoints: {
          from: intervalL[i],
          to: intervalR[i],
        },
      });
    }
  }

  return peaks;
}

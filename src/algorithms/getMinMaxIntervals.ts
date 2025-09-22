import type { NumberArray } from 'cheminfo-types';

import type { XIndex } from '../XIndex.ts';

export function getMinMaxIntervalsDy(
  y: NumberArray,
  x: NumberArray,
  dY: NumberArray,
  dX: number,
) {
  let lastMax: XIndex | null = null;
  let lastMin: XIndex | null = null;
  const intervalL: XIndex[] = [];
  const intervalR: XIndex[] = [];
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
  }

  return { intervalL, intervalR };
}

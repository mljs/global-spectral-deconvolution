import type { NumberArray } from 'cheminfo-types';

interface TryMatchOneIntervalWithMinDataOptions {
  x: NumberArray;
  lastK: number;
  minData: number[];
  yThreshold: number;
  intervalWidth: number;
  intervalCenter: number;
  yData: NumberArray;
}

export function tryMatchOneIntervalWithMinData(
  options: TryMatchOneIntervalWithMinDataOptions,
) {
  const {
    x,
    lastK,
    minData,
    yThreshold,
    intervalWidth,
    intervalCenter,
    yData,
  } = options;

  let minDistance = Number.POSITIVE_INFINITY;
  let possible = -1;
  let newLastIndex = lastK;
  for (let k = newLastIndex + 1; k < minData.length; k++) {
    const centerIndex = minData[k];
    if (yData[centerIndex] <= yThreshold) {
      continue;
    }

    const deltaX = x[centerIndex];
    const currentDistance = Math.abs(deltaX - intervalCenter);

    if (currentDistance < intervalWidth) {
      if (currentDistance < minDistance) {
        possible = k;
      }
      newLastIndex = k;
    }

    if (currentDistance >= minDistance) break;
    minDistance = currentDistance;
  }

  return { lastIndex: newLastIndex, possible };
}

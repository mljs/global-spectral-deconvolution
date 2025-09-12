import type { DataXY } from 'cheminfo-types';
import type { SGGOptions } from 'ml-savitzky-golay-generalized';
import { sgg } from 'ml-savitzky-golay-generalized';
import {
  xIsEquallySpaced,
  xIsMonotonic,
  xMinMaxValues,
  xNoiseStandardDeviation,
} from 'ml-spectra-processing';

import type { GSDPeak } from './GSDPeak.ts';
import type { MakeMandatory } from './utils/MakeMandatory.ts';
import { optimizeTop } from './utils/optimizeTop.ts';

export interface GSDOptions {
  /**
   * Options for the Savitzky-Golay generalised algorithm. This algorithm is used
   * to calculate the first ans second derivative.
   * It is also used when smoothY:true to smooth the spectrum for peak picking.
   * The Y values in case of smoothY is true will therefore be lower.
   * @default {windowSize:9,polynomial:3}
   */
  sgOptions?: SGGOptions;
  /**
   * Select the peak intensities from a smoothed version of the independent variables
   * @default false
   */
  smoothY?: boolean;
  /**
   * Peaks are local maxima (true) or minima (false)
   * @default true
   */
  maxCriteria?: boolean;
  /**
   * Peak under the noiseLevel (or over in case of maxCriteria=false) are ignored.
   */
  noiseLevel?: number;
  /**
   * Minimal height of small peaks based on the ratio between min and max
   * @default 0.00025
   */
  minMaxRatio?: number;
  /**
   * Use a quadratic optimizations with the peak and its 3 closest neighbors
   * @default false
   */
  realTopDetection?: boolean;
}
export type GSDPeakID = MakeMandatory<GSDPeak, 'id'>;

interface PeakCandidate {
  height: number;
  distance: number;
  minddYIndex: number;
  intervalIndex: number;
}

/**
 * Global spectra deconvolution
 * @param  data - Object data with x and y arrays. Values in x has to be growing
 * @param options
 * @param {number} [options.broadRatio = 0.00] - If `broadRatio` is higher than 0, then all the peaks which second derivative
 * smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.
 */

export function gsd(data: DataXY, options: GSDOptions = {}): GSDPeakID[] {
  let { noiseLevel } = options;
  const {
    sgOptions = {
      windowSize: 9,
      polynomial: 3,
    },
    smoothY = false,
    maxCriteria = true,
    minMaxRatio = 0.00025,
    realTopDetection = false,
  } = options;
  const { x } = data;
  let { y } = data;
  if (xIsMonotonic(x) !== 1) {
    throw new Error('GSD only accepts monotone increasing x values');
  }
  //rescale;
  y = y.slice();

  // If the max difference between delta x is less than 5%, then,
  // we can assume it to be equally spaced variable
  const equallySpaced = xIsEquallySpaced(x);

  if (noiseLevel === undefined) {
    if (equallySpaced) {
      const noiseInfo = xNoiseStandardDeviation(y);
      if (maxCriteria) {
        noiseLevel = noiseInfo.median + 1.5 * noiseInfo.sd;
      } else {
        noiseLevel = -noiseInfo.median + 1.5 * noiseInfo.sd;
      }
    } else {
      noiseLevel = 0;
    }
  } else if (!maxCriteria) {
    noiseLevel *= -1;
  }

  if (!maxCriteria) {
    for (let i = 0; i < y.length; i++) {
      y[i] *= -1;
    }
  }
  if (noiseLevel !== undefined) {
    for (let i = 0; i < y.length; i++) {
      if (y[i] < noiseLevel) {
        y[i] = noiseLevel;
      }
    }
  }

  const xValue = equallySpaced ? x[1] - x[0] : x;

  const yData = smoothY
    ? sgg(y, xValue, {
        ...sgOptions,
        derivative: 0,
      })
    : y;

  const dY = sgg(y, xValue, {
    ...sgOptions,
    derivative: 1,
  });
  const ddY = sgg(y, xValue, {
    ...sgOptions,
    derivative: 2,
  });

  const { min: minY, max: maxY } = xMinMaxValues(yData);

  if (minY > maxY || minY === maxY) return [];

  const yThreshold = minY + (maxY - minY) * minMaxRatio;

  const dX = x[1] - x[0];

  interface XIndex {
    x: number;
    index: number;
  }

  let lastMax: XIndex | null = null;
  let lastMin: XIndex | null = null;
  const minddY: number[] = [];
  const intervalL: XIndex[] = [];
  const intervalR: XIndex[] = [];

  // By the intermediate value theorem We cannot find 2 consecutive maximum or minimum
  for (let i = 1; i < yData.length - 1; ++i) {
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
    let k = lastK + 1;
    const candidates: PeakCandidate[] = [];
    for (; k < minddY.length; k++) {
      const minddYIndex = minddY[k];
      if (yData[minddYIndex] < yThreshold) {
        continue;
      }

      const deltaX = x[minddYIndex];
      const currentDistance = Math.abs(
        deltaX - (intervalL[i].x + intervalR[i].x) / 2,
      );

      if (currentDistance < (intervalR[i].x - intervalL[i].x) / 2) {
        candidates.push({
          height: yData[minddYIndex],
          distance: currentDistance,
          minddYIndex,
          intervalIndex: i,
        });
        lastK = k;
      }

      if (currentDistance >= minDistance) break;
      minDistance = currentDistance;
    }

    if (candidates.length > 0) {
      const scoredCandidates = getScoredCandidates(candidates);
      const { minddYIndex, intervalIndex } = scoredCandidates[0];
      const width = Math.abs(
        intervalR[intervalIndex].x - intervalL[intervalIndex].x,
      );
      peaks.push({
        id: crypto.randomUUID(),
        x: x[minddYIndex],
        y: yData[minddYIndex],
        width,
        index: minddYIndex,
        ddY: ddY[minddYIndex],
        inflectionPoints: {
          from: intervalL[intervalIndex],
          to: intervalR[intervalIndex],
        },
      });
    }
  }

  if (realTopDetection) {
    optimizeTop({ x, y: yData }, peaks);
  }

  peaks.forEach((peak) => {
    if (!maxCriteria) {
      peak.y *= -1;
      peak.ddY = peak.ddY * -1;
    }
  });

  peaks.sort((a, b) => {
    return a.x - b.x;
  });

  return peaks;
}

function getScoredCandidates(candidates: PeakCandidate[]) {
  const { min: minD, max: maxD } = xMinMaxValues(
    candidates.map((c) => c.distance),
  );
  const { min: minY, max: maxY } = xMinMaxValues(
    candidates.map((c) => c.height),
  );
  const yFactor = 1 / (maxY - minY);
  const dFactor = 1 / (maxD - minD);
  return candidates
    .map((cand) => {
      const { height, distance } = cand;
      const yScore = (height - minY) * yFactor;
      const dScore = (distance - minD) * dFactor;
      return { ...cand, score: 0.7 * dScore + 0.3 * yScore };
    })
    .sort((a, b) => a.score - b.score);
}

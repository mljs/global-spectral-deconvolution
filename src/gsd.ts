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
import { autoAlgorithm } from './algorithms/autoAlgorithm.ts';
import { firstDerivative } from './algorithms/firstDerivative.ts';
import { secondDerivative } from './algorithms/secondDerivative.ts';
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
   * Peaks under the `noiseLevel` (or above it in case of `maxCriteria=false`) are ignored.
   * When omitted, the noise level is estimated from the spectrum for equally-spaced x,
   * and set to `0` otherwise.
   * @default undefined
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
  /**
   * Algorithm used for peak detection:
   * - 'first': Uses the first derivative to detect peaks, detecting only
   *            the peaks which first derivative cross the zero.
   * - 'second': Uses the second derivative to detect peaks (inflection points).
   * - 'auto': Automatically selects the peaks by checking the zero crossing of the first derivative
   *           or the local minima in the second derivative.
   * @default 'second'
   */
  peakDetectionAlgorithm?: 'first' | 'second' | 'auto';
}

export type GSDPeakID = MakeMandatory<GSDPeak, 'id'>;

/**
 * Global spectra deconvolution.
 * @param data - Object with `x` and `y` arrays. `x` must be monotone increasing.
 * @param options - Peak detection options.
 * @returns The detected peaks, sorted by ascending `x`.
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
    peakDetectionAlgorithm = 'second',
  } = options;
  const { x } = data;
  let { y } = data;
  if (xIsMonotonic(x) !== 1) {
    throw new Error('GSD only accepts monotone increasing x values');
  }
  // Copy so the `maxCriteria` / clipping loops below don't mutate the caller's array.
  y = y.slice();

  // If the max difference between delta x is less than 5%, then,
  // we can assume it to be equally spaced variable
  const isEquallySpaced = xIsEquallySpaced(x);

  if (noiseLevel === undefined) {
    if (isEquallySpaced) {
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

  const xValue = isEquallySpaced ? x[1] - x[0] : x;

  const yData = smoothY
    ? sgg(y, xValue, {
        ...sgOptions,
        derivative: 0,
      })
    : y;

  const { min: minY, max: maxY } = xMinMaxValues(yData);
  if (minY > maxY || minY === maxY) return [];

  const dY = sgg(y, xValue, {
    ...sgOptions,
    derivative: 1,
  });

  const ddY = sgg(y, xValue, {
    ...sgOptions,
    derivative: 2,
  });

  const yThreshold = Math.max(noiseLevel, minY + (maxY - minY) * minMaxRatio);

  const dX = x[1] - x[0];

  const peakData = { x, y, yData, dY, ddY, dX, yThreshold };
  let peaks: GSDPeakID[] = [];
  if (peakDetectionAlgorithm === 'first') {
    peaks = firstDerivative(peakData);
  } else if (peakDetectionAlgorithm === 'second') {
    peaks = secondDerivative(peakData);
  } else {
    peaks = autoAlgorithm(peakData);
  }

  if (realTopDetection) {
    optimizeTop({ x, y: yData }, peaks);
  }

  for (const peak of peaks) {
    if (!maxCriteria) {
      peak.y *= -1;
      peak.ddY = peak.ddY * -1;
    }
  }

  peaks.sort((a, b) => {
    return a.x - b.x;
  });

  return peaks;
}

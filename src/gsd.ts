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
  /**
   * @default 'second'
   */
  peakDetectionAlgorithm?: 'first' | 'second' | 'auto';
}

export type GSDPeakID = MakeMandatory<GSDPeak, 'id'>;

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
    peakDetectionAlgorithm = 'second',
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

  const yThreshold = minY + (maxY - minY) * minMaxRatio;

  const dX = x[1] - x[0];

  const peakData = { x, y, yData, dY, ddY, dX, yThreshold };
  let peaks: GSDPeakID[] = [];
  if (peakDetectionAlgorithm === 'first') {
    peaks = firstDerivative(peakData);
  } else if (peakDetectionAlgorithm === 'second') {
    peaks = secondDerivative(peakData);
  } else {
    peaks = secondDerivative(peakData);
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

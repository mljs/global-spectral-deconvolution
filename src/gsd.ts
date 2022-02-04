import type { DataXY } from 'cheminfo-types';
import SG from 'ml-savitzky-golay-generalized';

import { Peak1D } from './Peak1D';
import { getNoiseLevel } from './utils/getNoiseLevel';
import { isEquallySpaced } from './utils/isEquallySpaced';

interface LastType {
  x: number;
  index: number;
}

export interface GSDOptions {
  noiseLevel?: number;
  sgOptions?: {
    windowSize: number;
    polynomial: number;
  };
  smoothY?: boolean;
  heightFactor?: number;
  maxCriteria?: boolean;
  minMaxRatio?: number;
  derivativeThreshold?: number;
  factor?: number;
}

/**
 * Global spectra deconvolution
 * @param {object} data - Object data with x and y arrays
 * @param {Array<number>} [data.x] - Independent variable
 * @param {Array<number>} [data.y] - Dependent variable
 * @param {object} [options={}] - Options object
 * @param {object} [options.sgOptions] - Options object for Savitzky-Golay filter. See https://github.com/mljs/savitzky-golay-generalized#options
 * @param {number} [options.sgOptions.windowSize = 9] - points to use in the approximations
 * @param {number} [options.sgOptions.polynomial = 3] - degree of the polynomial to use in the approximations
 * @param {number} [options.minMaxRatio = 0.00025] - Threshold to determine if a given peak should be considered as a noise
 * @param {number} [options.broadRatio = 0.00] - If `broadRatio` is higher than 0, then all the peaks which second derivative
 * smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.
 * @param {number} [options.noiseLevel = 0] - Noise threshold in spectrum units
 * @param {boolean} [options.maxCriteria = true] - Peaks are local maximum(true) or minimum(false)
 * @param {boolean} [options.smoothY = true] - Select the peak intensities from a smoothed version of the independent variables

 * @param {number} [options.heightFactor = 0] - Factor to multiply the calculated height (usually 2)
 * @param {number} [options.derivativeThreshold = -1] - Filters based on the amplitude of the first derivative
 * @return {Array<object>}
 */

export function gsd(data: DataXY, options: GSDOptions = {}): Peak1D[] {
  let {
    noiseLevel,
    sgOptions = {
      windowSize: 9,
      polynomial: 3,
    },
    smoothY = true,
    maxCriteria = true,
    minMaxRatio = 0.00025,
    derivativeThreshold = -1,
  } = options;

  let { y, x } = data;
  y = y.slice();

  // If the max difference between delta x is less than 5%, then,
  // we can assume it to be equally spaced variable
  let equallySpaced = isEquallySpaced(x);

  if (maxCriteria === false) {
    for (let i = 0; i < y.length; i++) {
      y[i] *= -1;
    }
  }

  if (noiseLevel === undefined) {
    noiseLevel = equallySpaced ? getNoiseLevel(y) : 0;
  }

  for (let i = 0; i < y.length; i++) {
    y[i] -= noiseLevel;
  }
  for (let i = 0; i < y.length; i++) {
    if (y[i] < 0) {
      y[i] = 0;
    }
  }

  let yData = y;
  let dY: number[], ddY: number[];
  const { windowSize, polynomial } = sgOptions;

  if (equallySpaced) {
    if (smoothY) {
      yData = SG(y, x[1] - x[0], {
        windowSize,
        polynomial,
        derivative: 0,
      });
    }
    dY = SG(y, x[1] - x[0], {
      windowSize,
      polynomial,
      derivative: 1,
    });
    ddY = SG(y, x[1] - x[0], {
      windowSize,
      polynomial,
      derivative: 2,
    });
  } else {
    if (smoothY) {
      yData = SG(y, x, {
        windowSize,
        polynomial,
        derivative: 0,
      });
    }
    dY = SG(y, x, {
      windowSize,
      polynomial,
      derivative: 1,
    });
    ddY = SG(y, x, {
      windowSize,
      polynomial,
      derivative: 2,
    });
  }

  const xData = x;
  const dX = x[1] - x[0];
  let maxDdy = 0;
  let maxY = 0;
  for (let i = 0; i < yData.length; i++) {
    if (Math.abs(ddY[i]) > maxDdy) {
      maxDdy = Math.abs(ddY[i]);
    }
    if (Math.abs(yData[i]) > maxY) {
      maxY = Math.abs(yData[i]);
    }
  }
  let lastMax: LastType | null = null;
  let lastMin: LastType | null = null;
  let minddY: number[] = [];
  let intervalL: LastType[] = [];
  let intervalR: LastType[] = [];

  // By the intermediate value theorem We cannot find 2 consecutive maximum or minimum
  for (let i = 1; i < yData.length - 1; ++i) {
    // filter based on derivativeThreshold
    if (Math.abs(dY[i]) > derivativeThreshold) {
      // Minimum in first derivative
      if (
        (dY[i] < dY[i - 1] && dY[i] <= dY[i + 1]) ||
        (dY[i] <= dY[i - 1] && dY[i] < dY[i + 1])
      ) {
        lastMin = {
          x: xData[i],
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
          x: xData[i],
          index: i,
        };
        if (dX < 0 && lastMin !== null) {
          intervalL.push(lastMax);
          intervalR.push(lastMin);
        }
      }
    }

    // Minimum in second derivative
    if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
      minddY.push(i);
    }
  }

  let lastK = -1;
  let possible: number;
  let deltaX: number;
  let distanceJ: number;
  let minDistance: number;
  let gettingCloser: boolean;

  const peaks: Peak1D[] = [];
  const indexes: number[] = [];
  for (const minddYIndex of minddY) {
    deltaX = xData[minddYIndex];
    possible = -1;
    let k = lastK + 1;
    minDistance = Number.MAX_VALUE;
    distanceJ = 0;
    gettingCloser = true;
    while (possible === -1 && k < intervalL.length && gettingCloser) {
      distanceJ = Math.abs(deltaX - (intervalL[k].x + intervalR[k].x) / 2);

      // Still getting closer?
      if (distanceJ < minDistance) {
        minDistance = distanceJ;
      } else {
        gettingCloser = false;
      }
      if (distanceJ < Math.abs(intervalL[k].x - intervalR[k].x) / 2) {
        possible = k;
        lastK = k;
      }
      ++k;
    }

    if (possible !== -1) {
      if (Math.abs(yData[minddYIndex]) > minMaxRatio * maxY) {
        let width = Math.abs(intervalR[possible].x - intervalL[possible].x);
        peaks.push({
          x: deltaX,
          y: maxCriteria
            ? yData[minddYIndex] + noiseLevel
            : -yData[minddYIndex] - noiseLevel,
          width: width,
          index: minddYIndex,
        });
      }
    }
  }

  peaks.sort((a, b) => {
    return a.x - b.x;
  });

  return peaks;
}

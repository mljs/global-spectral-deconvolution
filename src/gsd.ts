import type { DataXY } from 'cheminfo-types';
import { sgg, SGGOptions } from 'ml-savitzky-golay-generalized';
import { xIsEquallySpaced } from 'ml-spectra-processing';

import { GSDPeak } from './GSDPeak';
import { optimizeTop } from './utils/optimizeTop';

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
   * Threshold to determine if a given peak should be considered as a noise
   * @default 0.00025
   */
  minMaxRatio?: number;
  /**
   * Filters based on the amplitude of the first derivative
   * @default -1
   */
  derivativeThreshold?: number;
  /**
   * Use a quadratic optimizations with the peak and its 3 closest neighbors
   * @default false
   */
  realTopDetection?: boolean;
}

/**
 * Global spectra deconvolution
 * @param  data - Object data with x and y arrays
 * @param {number} [options.broadRatio = 0.00] - If `broadRatio` is higher than 0, then all the peaks which second derivative
 * smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.

 */

export function gsd(data: DataXY, options: GSDOptions = {}): GSDPeak[] {
  let {
    sgOptions = {
      windowSize: 9,
      polynomial: 3,
    },
    smoothY = false,
    maxCriteria = true,
    minMaxRatio = 0.00025,
    derivativeThreshold = -1,
    realTopDetection = false,
  } = options;

  let { x, y } = data;
  y = y.slice();

  // If the max difference between delta x is less than 5%, then,
  // we can assume it to be equally spaced variable
  let equallySpaced = xIsEquallySpaced(x);

  if (maxCriteria === false) {
    for (let i = 0; i < y.length; i++) {
      y[i] *= -1;
    }
  }

  let yData = y;
  let dY, ddY;
  const { windowSize, polynomial } = sgOptions;

  if (equallySpaced) {
    if (smoothY) {
      yData = sgg(y, x[1] - x[0], {
        windowSize,
        polynomial,
        derivative: 0,
      });
    }
    dY = sgg(y, x[1] - x[0], {
      windowSize,
      polynomial,
      derivative: 1,
    });
    ddY = sgg(y, x[1] - x[0], {
      windowSize,
      polynomial,
      derivative: 2,
    });
  } else {
    if (smoothY) {
      yData = sgg(y, x, {
        windowSize,
        polynomial,
        derivative: 0,
      });
    }
    dY = sgg(y, x, {
      windowSize,
      polynomial,
      derivative: 1,
    });
    ddY = sgg(y, x, {
      windowSize,
      polynomial,
      derivative: 2,
    });
  }

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

  interface XIndex {
    x: number;
    index: number;
  }

  let lastMax: XIndex | null = null;
  let lastMin: XIndex | null = null;
  let minddY: number[] = [];
  let intervalL: XIndex[] = [];
  let intervalR: XIndex[] = [];

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

    // Minimum in second derivative
    if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
      minddY.push(i);
    }
  }

  let lastK = -1;

  const peaks: GSDPeak[] = [];
  for (const minddYIndex of minddY) {
    let deltaX = x[minddYIndex];
    let possible = -1;
    let k = lastK + 1;
    let minDistance = Number.POSITIVE_INFINITY;
    let currentDistance = 0;
    while (possible === -1 && k < intervalL.length) {
      currentDistance = Math.abs(
        deltaX - (intervalL[k].x + intervalR[k].x) / 2,
      );

      if (currentDistance < Math.abs(intervalL[k].x - intervalR[k].x) / 2) {
        possible = k;
        lastK = k;
      }
      ++k;

      // Still getting closer?
      if (currentDistance >= minDistance) {
        break;
      }
      minDistance = currentDistance;
    }

    if (possible !== -1) {
      if (Math.abs(yData[minddYIndex]) > minMaxRatio * maxY) {
        let width = Math.abs(intervalR[possible].x - intervalL[possible].x);
        peaks.push({
          x: deltaX,
          y: yData[minddYIndex],
          width: width,
          index: minddYIndex,
          ddY: ddY[minddYIndex],
          inflectionPoints: {
            from: intervalL[possible],
            to: intervalR[possible],
          },
        });
      }
    }
  }

  if (realTopDetection) {
    optimizeTop({ x, y: yData }, peaks);
  }

  peaks.forEach((peak) => {
    if (!maxCriteria) {
      peak.y = -peak.y;
      peak.ddY = peak.ddY * -1;
    }
  });

  peaks.sort((a, b) => {
    return a.x - b.x;
  });

  return peaks;
}

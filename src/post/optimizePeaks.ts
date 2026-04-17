import type { DataXY, FromTo } from 'cheminfo-types';
import type { Shape1D } from 'ml-peak-shape-generator';
import type { OptimizationOptions } from 'ml-spectra-fitting';

import type { Peak } from './optimizePeaksWithLogs.ts';
import { optimizePeaksWithLogs } from './optimizePeaksWithLogs.ts';

export interface OptimizePeaksOptions {
  /**
   * Constant baseline subtracted from the spectrum before fitting.
   * @default undefined
   */
  baseline?: number;
  /**
   * Range over which the optimization is applied. Values default to
   * `firstPeak.x - firstPeak.width * factorLimits` and
   * `lastPeak.x + lastPeak.width * factorLimits` when omitted.
   * @default {}
   */
  fromTo?: Partial<FromTo>;
  /**
   * Shape to use for optimization.
   * @default { kind: 'gaussian' }
   */
  shape?: Shape1D;
  /**
   * Multiplier applied to peak widths when deciding whether adjacent peaks
   * should be grouped and optimized together.
   * @default 1
   */
  groupingFactor?: number;
  /**
   * Width multiplier used to derive the default `from` / `to` bounds.
   * @default 2
   */
  factorLimits?: number;
  /**
   * Kind and options of the algorithm used to optimize parameters.
   * @default { kind: 'lm', options: { timeout: 10 } }
   */
  optimization?: OptimizationOptions;
}

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (fwhm)
 * and the ratio of gaussian contribution (mu) if it's required.
 * @param data - An object containing the x and y data to be fitted.
 * @param peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param options - Optimization options.
 * @returns The optimized peaks.
 */
export function optimizePeaks<T extends Peak>(
  data: DataXY,
  peakList: T[],
  options: OptimizePeaksOptions = {},
) {
  return optimizePeaksWithLogs(data, peakList, options).optimizedPeaks;
}

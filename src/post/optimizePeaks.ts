import type { DataXY } from 'cheminfo-types';
import { FromTo } from 'cheminfo-types';
import { Shape1D } from 'ml-peak-shape-generator';
import type { OptimizationOptions } from 'ml-spectra-fitting';

import { Peak, optimizePeaksWithLogs } from './optimizePeaksWithLogs';

export interface OptimizePeaksOptions {
  /**
   * baseline
   */
  baseline?: number;
  /**
   * range to apply the optimization
   */
  fromTo?: Partial<FromTo>;
  /**
   * Shape to use for optimization
   * @default {kind:'gaussian'}
   */
  shape?: Shape1D;
  /**
   * Number of times we should multiply the width determining if the peaks have to be grouped and therefore optimized together
   * @default 1
   */
  groupingFactor?: number;
  /**
   * Define the min / max values
   * @default 2
   */
  factorLimits?: number;
  /**
   * it's specify the kind and options of the algorithm use to optimize parameters.
   */
  optimization?: OptimizationOptions;
}

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (fwhm)
 * and the ratio of gaussian contribution (mu) if it's required. It currently supports three kind of shapes: gaussian, lorentzian and pseudovoigt
 * @param data - An object containing the x and y data to be fitted.
 * @param peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 */
export function optimizePeaks<T extends Peak>(
  data: DataXY,
  peakList: T[],
  options: OptimizePeaksOptions = {},
) {
  return optimizePeaksWithLogs(data, peakList, options).optimizedPeaks;
}

import type { DataXY } from 'cheminfo-types';
import type { Shape1D } from 'ml-peak-shape-generator';
import { optimize } from 'ml-spectra-fitting';
import type { OptimizationOptions } from 'ml-spectra-fitting';
import { xGetFromToIndex } from 'ml-spectra-processing';

import { Peak1DOptimized } from '../Peak1DOptimized';
import { Peak1DWithShape } from '../Peak1DWithShape';

import { groupPeaks } from './groupPeaks';

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (width)
 * and the ratio of gaussian contribution (mu) if it's required. It supports three kind of shapes: gaussian, lorentzian and pseudovoigt
 * @param data - An object containing the x and y data to be fitted.
 * @param peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 */
export interface OptimizePeaksOptions {
  /**
   * Number of times the width determining if the peaks have to be grouped and therefore optimized together
   * @default 1
   */
  factorWidth?: number;
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

export function optimizeShape(
  data: DataXY,
  peakList: Peak1DWithShape[],
  options: OptimizePeaksOptions = {},
): Peak1DOptimized[] {
  const {
    factorWidth = 1,
    factorLimits = 2,
    optimization = {
      kind: 'lm',
      options: {
        timeout: 10,
      },
    },
  }: OptimizePeaksOptions = options;

  /*
  The optimization algorithm will take some group of peaks.
  We can not simply optimize everything because there would be too many variables to optimize
  and it would be too time consuming.
*/
  let groups = groupPeaks(peakList, factorWidth);

  let results: Peak1DOptimized[] = [];

  groups.forEach((peaks) => {
    const firstPeak = peaks[0];
    const lastPeak = peaks[peaks.length - 1];

    const from = firstPeak.x - firstPeak.width * factorLimits;
    const to = lastPeak.x + lastPeak.width * factorLimits;
    const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
    // Multiple peaks

    const x =
      data.x instanceof Float64Array
        ? data.x.subarray(fromIndex, toIndex)
        : data.x.slice(fromIndex, toIndex);
    const y =
      data.y instanceof Float64Array
        ? data.y.subarray(fromIndex, toIndex)
        : data.y.slice(fromIndex, toIndex);

    if (x.length > 5) {
      let { peaks: optimizedPeaks } = optimize({ x, y }, peaks, {
        shape,
        optimization,
      });
      results = results.concat(optimizedPeaks);
      // eslint-disable-next-line curly
    } else results = results.concat(peaks);
  });

  return results;
}

import type { DataXY } from 'cheminfo-types';
import { PeakXYWidth } from 'cheminfo-types';
import { getShape1D, Shape1D } from 'ml-peak-shape-generator';
import { optimize } from 'ml-spectra-fitting';
import type { OptimizationOptions } from 'ml-spectra-fitting';
import { xGetFromToIndex } from 'ml-spectra-processing';

import { GSDPeakOptimized } from '../GSDPeakOptimized';
import { appendShapeAndFWHM } from '../utils/appendShapeAndFWHM';
import { groupPeaks } from '../utils/groupPeaks';

export interface OptimizePeaksOptions {
  /**
   * Shape to use for optimization
   * @default {kind:'gaussian'}
   */
  shape?: Shape1D;
  /**
   * Number of times the width determining if the peaks have to be grouped and therefore optimized together
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
export function optimizePeaks(
  data: DataXY,
  peakList: PeakXYWidth[],
  options: OptimizePeaksOptions = {},
): GSDPeakOptimized[] {
  const {
    shape = { kind: 'gaussian' },
    groupingFactor = 1,
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
  let groups = groupPeaks(peakList, { factor: groupingFactor });

  let results: GSDPeakOptimized[] = [];

  groups.forEach((peakGroup) => {
    // In order to make optimization we will add fwhm and shape on all the peaks
    const peaks = appendShapeAndFWHM(peakGroup, { shape });

    const firstPeak = peaks[0];
    const lastPeak = peaks[peaks.length - 1];

    const from = firstPeak.x - firstPeak.width * factorLimits;
    const to = lastPeak.x + lastPeak.width * factorLimits;
    const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });

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
      for (let i = 0; i < peaks.length; i++) {
        results.push({
          x: optimizedPeaks[i].x,
          y: optimizedPeaks[i].y,
          shape: peaks[i].shape,
          fwhm: optimizedPeaks[i].fwhm || 0, // todo remove || 0 it should never happen after update spectra-fitting
          width: getShape1D(peaks[i].shape).fwhmToWidth(optimizedPeaks[i].fwhm),
        });
      }
    } else {
      results = results.concat(peaks);
    }
  });

  return results;
}

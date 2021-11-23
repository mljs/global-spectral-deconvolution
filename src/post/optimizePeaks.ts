import type { DataXY } from 'cheminfo-types';
import type { Shape1D } from 'ml-peak-shape-generator';
import { getShape1D } from 'ml-peak-shape-generator';
import { optimize } from 'ml-spectra-fitting';
import type { IOptimizationOptions } from 'ml-spectra-fitting';
import { xGetFromToIndex } from 'ml-spectra-processing';

import type { Peak1D } from '../gsd';

import { groupPeaks } from './groupPeaks';

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (width)
 * and the ratio of gaussian contribution (mu) if it's required. It supports three kind of shapes: gaussian, lorentzian and pseudovoigt
 * @param data - An object containing the x and y data to be fitted.
 * @param peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 */
export interface IOptimizePeaksOptions {
  /**
   * times of width to group peaks.
   * @default 1
   */
  factorWidth?: number;
  /**
   * times of width to use to optimize peaks
   * @default 2
   */
  factorLimits?: number;
  /**
   * it's specify the kind of shape used to fitting.
   */
  shape?: Shape1D;
  /**
   * it's specify the kind and options of the algorithm use to optimize parameters.
   */
  optimization?: IOptimizationOptions;
}

export function optimizePeaks(
  data: DataXY,
  peakList: Peak1D[],
  options: IOptimizePeaksOptions = {},
): Peak1D[] {
  const {
    factorWidth = 1,
    factorLimits = 2,
    shape = {
      kind: 'gaussian',
    },
    optimization = {
      kind: 'lm',
      options: {
        timeout: 10,
      },
    },
  }: IOptimizePeaksOptions = options;

  if (data.x[0] > data.x[1]) {
    data.x.reverse();
    data.y.reverse();
  }

  const checkPeakList = (peaks: Peak1D[], shape: Shape1D) => {
    const shape1D = getShape1D(shape);

    for (let peak of peaks) {
      if (peak.fwhm) {
        peak.width = shape1D.fwhmToWidth(peak.fwhm);
      } else {
        peak.fwhm = shape1D.widthToFWHM(peak.width);
      }
    }

    return peaks;
  };

  checkPeakList(peakList, shape);

  let groups = groupPeaks(peakList, factorWidth);

  let results: Peak1D[] = [];

  groups.forEach((peaks) => {
    const firstPeak = peaks[0];
    const lastPeak = peaks[peaks.length - 1];

    const from = firstPeak.x - firstPeak.width * factorLimits;
    const to = lastPeak.x + lastPeak.width * factorLimits;
    const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
    // Multiple peaks
    const currentRange = {
      x: data.x.slice(fromIndex, toIndex),
      y: data.y.slice(fromIndex, toIndex),
    };
    if (currentRange.x.length > 5) {
      let { peaks: optimizedPeaks } = optimize(currentRange, peaks, {
        shape,
        optimization,
      });
      results = results.concat(optimizedPeaks);
      // eslint-disable-next-line curly
    } else results = results.concat(peaks);
  });

  return checkPeakList(results, shape);
}

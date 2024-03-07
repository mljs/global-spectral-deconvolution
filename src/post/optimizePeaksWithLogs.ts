import type { DataXY, PeakXYWidth } from 'cheminfo-types';
import { getShape1D } from 'ml-peak-shape-generator';
import { optimize } from 'ml-spectra-fitting';
import { xGetFromToIndex } from 'ml-spectra-processing';

import { GSDPeakOptimized } from '../GSDPeakOptimized';
import { MakeMandatory } from '../utils/MakeMandatory';
import { addMissingShape } from '../utils/addMissingShape';
import { groupPeaks } from '../utils/groupPeaks';

import { OptimizePeaksOptions } from './optimizePeaks';

export interface Peak extends PeakXYWidth {
  id?: string;
}

export type GSDPeakOptimizedID = MakeMandatory<GSDPeakOptimized, 'id'>;

type GSDPeakOptimizedIDOrNot<T extends Peak> = T extends {
  id: string;
}
  ? GSDPeakOptimizedID
  : GSDPeakOptimized;

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (fwhm)
 * and the ratio of gaussian contribution (mu) if it's required. It currently supports three kind of shapes: gaussian, lorentzian and pseudovoigt
 * @param data - An object containing the x and y data to be fitted.
 * @param peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 */
export function optimizePeaksWithLogs<T extends Peak>(
  data: DataXY,
  peakList: T[],
  options: OptimizePeaksOptions = {},
): { logs: any[]; optimizedPeaks: Array<GSDPeakOptimizedIDOrNot<T>> } {
  const {
    fromTo = {},
    baseline,
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
  const groups = groupPeaks(peakList, { factor: groupingFactor });
  const logs: any[] = [];
  const results: Array<GSDPeakOptimizedIDOrNot<T>> = [];
  groups.forEach((peakGroup) => {
    const start = Date.now();
    // In order to make optimization we will add fwhm and shape on all the peaks
    const peaks = addMissingShape(peakGroup, { shape });

    const firstPeak = peaks[0];
    const lastPeak = peaks[peaks.length - 1];

    const {
      from = firstPeak.x - firstPeak.width * factorLimits,
      to = lastPeak.x + lastPeak.width * factorLimits,
    } = fromTo;

    const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });

    const x =
      data.x instanceof Float64Array
        ? data.x.subarray(fromIndex, toIndex)
        : data.x.slice(fromIndex, toIndex);
    const y =
      data.y instanceof Float64Array
        ? data.y.subarray(fromIndex, toIndex)
        : data.y.slice(fromIndex, toIndex);

    const log = {
      range: { from, to },
      parameters: optimization,
      groupSize: peakGroup.length,
      time: Date.now() - start,
    };

    if (x.length > 5) {
      const {
        iterations,
        error,
        peaks: optimizedPeaks,
      } = optimize({ x, y }, peaks, {
        shape,
        baseline,
        optimization,
      });

      for (let i = 0; i < peaks.length; i++) {
        results.push({
          ...optimizedPeaks[i],
          width: getShape1D(peaks[i].shape).fwhmToWidth(
            optimizedPeaks[i].shape.fwhm,
          ),
        } as GSDPeakOptimizedIDOrNot<T>);
      }
      logs.push({
        ...log,
        iterations,
        error,
        message: 'optimization successful',
      });
    } else {
      results.push(...(peaks as Array<GSDPeakOptimizedIDOrNot<T>>));
      logs.push({
        ...log,
        iterations: 0,
        message: 'x length too small for optimization',
      });
    }
  });

  return { logs, optimizedPeaks: results };
}

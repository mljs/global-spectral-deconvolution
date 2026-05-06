import type { DataXY, PeakXYWidth } from 'cheminfo-types';
import { getShape1D } from 'ml-peak-shape-generator';
import { optimize } from 'ml-spectra-fitting';
import { xGetFromToIndex } from 'ml-spectra-processing';

import type { GSDPeakOptimized } from '../GSDPeakOptimized.ts';
import type { MakeMandatory } from '../utils/MakeMandatory.ts';
import { addMissingShape } from '../utils/addMissingShape.ts';
import { groupPeaks } from '../utils/groupPeaks.ts';

import type { OptimizePeaksOptions } from './optimizePeaks.ts';

export interface Peak extends PeakXYWidth {
  /**
   * Optional stable identifier preserved through the optimization.
   * @default undefined
   */
  id?: string;
}

export type GSDPeakOptimizedID = MakeMandatory<GSDPeakOptimized, 'id'>;

type GSDPeakOptimizedIDOrNot<T extends Peak> = T extends {
  id: string;
}
  ? GSDPeakOptimizedID
  : GSDPeakOptimized;

export interface OptimizePeaksLog {
  /** x range over which this group of peaks was optimized. */
  range: { from: number; to: number };
  /** Optimization parameters used for this group. */
  parameters: unknown;
  /** Number of peaks in the group. */
  groupSize: number;
  /** Time spent on this group, in milliseconds. */
  time: number;
  /** Number of iterations run by the optimizer (`0` when optimization was skipped). */
  iterations: number;
  /** Final error reported by the optimizer. Absent when optimization was skipped. */
  error?: number;
  /** Human-readable outcome (e.g. `optimization successful`). */
  message: string;
}

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (fwhm)
 * and the ratio of gaussian contribution (mu) if it's required.
 * It currently supports three kind of shapes: gaussian, lorentzian and pseudovoigt.
 * Returns both the optimized peaks and per-group diagnostic logs.
 * @param data - An object containing the x and y data to be fitted.
 * @param peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param options - Optimization options.
 * @returns An object with the optimized peaks and the per-group logs.
 */
export function optimizePeaksWithLogs<T extends Peak>(
  data: DataXY,
  peakList: T[],
  options: OptimizePeaksOptions = {},
): {
  logs: OptimizePeaksLog[];
  optimizedPeaks: Array<GSDPeakOptimizedIDOrNot<T>>;
} {
  const {
    fromTo = {},
    shape = { kind: 'gaussian' },
    groupingFactor = 1,
    factorLimits = 2,
    parameters,
    optimization = {
      kind: 'lm',
      options: {
        timeout: 10,
      },
    },
  } = options;

  // Optimize peaks in groups: fitting everything at once would be too slow and
  // have too many free parameters.
  const groups = groupPeaks(peakList, { factor: groupingFactor });
  const logs: OptimizePeaksLog[] = [];
  const results: Array<GSDPeakOptimizedIDOrNot<T>> = [];
  for (const peakGroup of groups) {
    const start = Date.now();
    const peaks = addMissingShape(peakGroup, { shape });

    const firstPeak = peaks[0];
    const lastPeak = peaks.at(-1) as (typeof peaks)[number];

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
      parameters: { optimization, parameters },
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
        parameters,
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
  }

  return { logs, optimizedPeaks: results };
}

import type { Shape1D } from 'ml-peak-shape-generator';
import type { OptimizationOptions } from 'ml-spectra-fitting';

import type { GSDPeak } from '../GSDPeak.ts';
import type { GSDPeakOptimized } from '../GSDPeakOptimized.ts';
import { addMissingIDs } from '../utils/addMissingIDs.ts';
import { addMissingShape } from '../utils/addMissingShape.ts';

import type { GSDPeakOptimizedID } from './optimizePeaksWithLogs.ts';
import { optimizePeaksWithLogs } from './optimizePeaksWithLogs.ts';

export interface JoinBroadPeaksOptions {
  /**
   * Ratio (relative to the maximum `|ddY|`) below which a peak is treated as
   * part of a broad signal.
   * @default 0.0025
   */
  broadRatio?: number;
  /**
   * Maximum `x` distance between two consecutive peaks for them to still be
   * considered part of the same broad signal.
   * @default 0.25
   */
  broadWidth?: number;
  /**
   * Shape used for fitting the broad peak.
   * @default { kind: 'gaussian' }
   */
  shape?: Shape1D;
  /**
   * Kind and options of the algorithm used to optimize parameters.
   * @default { kind: 'lm', options: { timeout: 10 } }
   */
  optimization?: OptimizationOptions;
}

export type GSDPeakOptionalShape = GSDPeak & { shape?: Shape1D };

/**
 * Join peaks that seem to belong to a broad signal into a single broad peak.
 * @param peakList - Detected peaks, possibly containing fragments of a broad signal.
 * @param options - Join options.
 * @returns The peak list with broad fragments fitted as a single peak.
 */
export function joinBroadPeaks(
  peakList: GSDPeakOptionalShape[],
  options: JoinBroadPeaksOptions = {},
): GSDPeakOptimizedID[] {
  const {
    shape = { kind: 'gaussian' },
    optimization = { kind: 'lm', options: { timeout: 10 } },
    broadWidth = 0.25,
    broadRatio = 0.0025,
  } = options;

  let max = 0;
  let maxI = 0;
  let count = 1;
  const broadLines: GSDPeakOptionalShape[] = [];

  if (peakList.length < 2) {
    return addMissingIDs(
      addMissingShape(peakList.map(getGSDPeakOptimizedStructure), { shape }),
    );
  }

  let maxDdy = Math.abs(peakList[0].ddY);
  for (let i = 1; i < peakList.length; i++) {
    const absDdy = Math.abs(peakList[i].ddY);
    if (absDdy > maxDdy) maxDdy = absDdy;
  }

  const newPeaks: GSDPeakOptimized[] = [];
  for (const peak of peakList) {
    if (Math.abs(peak.ddY) <= broadRatio * maxDdy) {
      broadLines.push(peak);
    } else {
      newPeaks.push(getGSDPeakOptimizedStructure(peak));
    }
  }

  // Sentinel: forces the final group to be flushed by the `else` branch below.
  //@ts-expect-error Sentinel peak, x=+Infinity guarantees the distance check fails.
  broadLines.push({ x: Number.MAX_VALUE, y: 0 });
  let candidates: { x: number[]; y: number[] } = {
    x: [broadLines[0].x],
    y: [broadLines[0].y],
  };
  let indexes: number[] = [0];
  for (let i = 1; i < broadLines.length; i++) {
    if (Math.abs(broadLines[i - 1].x - broadLines[i].x) < broadWidth) {
      candidates.x.push(broadLines[i].x);
      candidates.y.push(broadLines[i].y);
      if (broadLines[i].y > max) {
        max = broadLines[i].y;
        maxI = i;
      }
      indexes.push(i);
      count++;
    } else {
      if (count > 2) {
        const initialWidth = Math.abs(
          (candidates.x.at(-1) as number) - candidates.x[0],
        );
        const { logs, optimizedPeaks } = optimizePeaksWithLogs(
          candidates,
          [
            {
              id: crypto.randomUUID(),
              x: broadLines[maxI].x,
              y: max,
              width: initialWidth,
              parameters: {
                width: { max: initialWidth * 4, min: initialWidth * 0.8 },
              },
            },
          ],
          { shape: { kind: 'pseudoVoigt' }, optimization },
        );
        max = 0;
        maxI = 0;
        const log = logs.find((l) => l.message === 'optimization successful');
        if (log?.error !== undefined && log.error < 0.2) {
          newPeaks.push(optimizedPeaks[0]);
        } else {
          pushBackPeaks(broadLines, indexes, newPeaks);
        }
      } else {
        pushBackPeaks(broadLines, indexes, newPeaks);
      }

      candidates = { x: [broadLines[i].x], y: [broadLines[i].y] };
      indexes = [i];
      max = broadLines[i].y;
      maxI = i;
      count = 1;
    }
  }
  newPeaks.sort((a, b) => a.x - b.x);

  return addMissingIDs(newPeaks, { output: newPeaks });
}

function pushBackPeaks(
  broadLines: GSDPeakOptionalShape[],
  indexes: number[],
  peaks: GSDPeakOptimized[],
) {
  for (const index of indexes) {
    peaks.push(getGSDPeakOptimizedStructure(broadLines[index]));
  }
}
function getGSDPeakOptimizedStructure(peak: GSDPeakOptionalShape) {
  const { id, shape, x, y, width } = peak;

  const newPeak = {
    x,
    y,
    width,
    shape,
  } as GSDPeakOptimized;

  if (id) newPeak.id = id;

  return newPeak;
}

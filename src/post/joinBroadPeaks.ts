import { v4 as generateID } from '@lukeed/uuid';
import type { Shape1D } from 'ml-peak-shape-generator';
import { OptimizationOptions } from 'ml-spectra-fitting';

import { GSDPeak } from '../GSDPeak';
import { GSDPeakOptimized } from '../GSDPeakOptimized';
import { addMissingIDs } from '../utils/addMissingIDs';
import { addMissingShape } from '../utils/addMissingShape';

import {
  GSDPeakOptimizedID,
  optimizePeaksWithLogs,
} from './optimizePeaksWithLogs';

export interface JoinBroadPeaksOptions {
  /**
   * broadRatio
   * @default 0.0025
   */
  broadRatio?: number;
  /**
   * width limit to join peaks.
   * @default 0.25
   */
  broadWidth?: number;
  /**
   * it's specify the kind of shape used to fitting.
   */
  shape?: Shape1D;
  /**
   * it's specify the kind and options of the algorithm use to optimize parameters.
   */
  optimization?: OptimizationOptions;
}

/**
 * This function tries to join the peaks that seems to belong to a broad signal in a single broad peak.
 */

export type GSDPeakOptionalShape = GSDPeak & { shape?: Shape1D };

export function joinBroadPeaks<T extends GSDPeakOptionalShape>(
  peakList: T[],
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
  const broadLines: T[] = [];

  if (peakList.length < 2) {
    return addMissingIDs(
      addMissingShape(peakList.map(getGSDPeakOptimizedStructure), { shape }),
    );
  }

  let maxDdy = peakList[0].ddY;
  for (let i = 1; i < peakList.length; i++) {
    if (Math.abs(peakList[i].ddY) > maxDdy) maxDdy = Math.abs(peakList[i].ddY);
  }

  const newPeaks: GSDPeakOptimized[] = [];
  for (const peak of peakList) {
    if (Math.abs(peak.ddY) <= broadRatio * maxDdy) {
      broadLines.push(peak);
    } else {
      newPeaks.push(getGSDPeakOptimizedStructure(peak));
    }
  }

  //@ts-expect-error Push a feke peak
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
          candidates.x[candidates.x.length - 1] - candidates.x[0],
        );
        const { logs, optimizedPeaks } = optimizePeaksWithLogs(
          candidates,
          [
            {
              id: generateID(),
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
        [max, maxI] = [0, 0];
        const log = logs.find((l) => l.message === 'optimization successful');
        if (log) {
          const { error } = log;
          if (error < 0.2) {
            newPeaks.push(optimizedPeaks[0]);
          } else {
            pushBackPeaks(broadLines, indexes, newPeaks);
          }
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
  newPeaks.sort((a, b) => {
    return a.x - b.x;
  });

  return addMissingIDs(newPeaks, { output: newPeaks });
}

function pushBackPeaks(broadLines, indexes, peaks) {
  for (const index of indexes) {
    peaks.push(getGSDPeakOptimizedStructure(broadLines[index]));
  }
}
function getGSDPeakOptimizedStructure<T extends GSDPeakOptionalShape>(peak: T) {
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

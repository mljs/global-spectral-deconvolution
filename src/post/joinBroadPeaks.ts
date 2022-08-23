import type { Shape1D } from 'ml-peak-shape-generator';
import { OptimizationOptions } from 'ml-spectra-fitting';

import { GSDPeak } from '../GSDPeak';
import { GSDPeakOptimized } from '../GSDPeakOptimized';
import { MakeOptional } from '../utils/MakeOptional';
import { addMissingShape } from '../utils/addMissingShape';

import { optimizePeaks } from './optimizePeaks';

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

export type GSDPeakOptionalShape = MakeOptional<GSDPeak, 'shape'>;

export function joinBroadPeaks<T extends GSDPeakOptionalShape>(
  peakList: T[],
  options: JoinBroadPeaksOptions = {},
): GSDPeakOptimized[] {
  let {
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
    return addMissingShape(peakList, { shape }).map(
      getGSDPeakOptimizedStructure,
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
        let fitted = optimizePeaks(
          candidates,
          [
            {
              x: broadLines[maxI].x,
              y: max,
              width: candidates.x[0] - candidates.x[candidates.x.length - 1],
            },
          ],
          { shape, optimization },
        );
        newPeaks.push(fitted[0]);
      } else {
        // Put back the candidates to the peak list
        for (const index of indexes) {
          newPeaks.push(getGSDPeakOptimizedStructure(broadLines[index]));
        }
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

  return newPeaks;
}

function getGSDPeakOptimizedStructure<T extends GSDPeakOptionalShape>(peak: T) {
  const { id, shape, x, y, width } = peak;

  let newPeak = {
    x,
    y,
    width,
    shape,
  } as GSDPeakOptimized;

  if (id) newPeak.id = id;

  return newPeak;
}

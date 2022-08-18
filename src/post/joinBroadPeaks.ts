import { v4 as generateID } from '@lukeed/uuid';
import type { Shape1D } from 'ml-peak-shape-generator';
import { OptimizationOptions } from 'ml-spectra-fitting';

import { GSDPeak } from '../GSDPeak';
import { GSDPeakOptimized } from '../GSDPeakOptimized';
import { addMissingShape } from '../utils/addMissingShape';
import { MakeOptional } from '../utils/MakeOptional';

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
type GSDPeakOptimizedOptionalShape = MakeOptional<GSDPeakOptimized, 'shape'>;

type GSDPeakOptimizedWithID = GSDPeakOptimized & { id: string };
type GSDPeakOptimizedWithShapeID = GSDPeakOptimizedWithID & { shape: Shape1D };

type WithIDOrNot<T extends GSDPeakOptimizedOptionalShape> = T extends {
  id: string;
}
  ? GSDPeakOptimizedWithShapeID
  : GSDPeakOptimized;

export function joinBroadPeaks<T extends GSDPeakOptionalShape>(
  peakList: T[],
  options: JoinBroadPeaksOptions = {},
): WithIDOrNot<T>[] {
  let {
    shape = { kind: 'gaussian' },
    optimization = { kind: 'lm', options: { timeout: 10 } },
    broadWidth = 0.25,
    broadRatio = 0.0025,
  } = options;

  let max = 0;
  let maxI = 0;
  let count = 1;
  const broadLines: GSDPeakOptimized[] = [];
  const peaks = addMissingShape(peakList, { shape });

  if (peaks.length < 2) return peaks as WithIDOrNot<T>[];

  let maxDdy = peakList[0].ddY;
  for (let i = 1; i < peakList.length; i++) {
    if (Math.abs(peakList[i].ddY) > maxDdy) maxDdy = Math.abs(peakList[i].ddY);
  }

  for (let i: number = peaks.length - 1; i >= 0; i--) {
    if (Math.abs(peaks[i].ddY) <= broadRatio * maxDdy) {
      broadLines.push(peaks.splice(i, 1)[0]);
    }
  }

  //@ts-expect-error Push a feke peak
  broadLines.push({ x: Number.MAX_VALUE, y: 0 });

  let candidates: { x: number[]; y: number[] } = {
    x: [broadLines[0].x],
    y: [broadLines[0].y],
  };
  let indexes: number[] = [0];
  const newPeaks: GSDPeakOptimized[] = [];
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
              id: generateID(),
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
        indexes.forEach((index) => {
          const { id, shape, x, y, width } = broadLines[index];

          let newPeak = {
            x,
            y,
            width,
            shape,
          } as GSDPeakOptimized;

          if (id) newPeak.id = id;

          newPeaks.push(newPeak);
        });
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

  return newPeaks as WithIDOrNot<T>[];
}

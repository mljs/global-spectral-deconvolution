import type { Shape1D } from 'ml-peak-shape-generator';
import { OptimizationOptions } from 'ml-spectra-fitting';

import { GSDPeakOptimized, optimizePeaks } from '..';
import { GSDPeak } from '../GSDPeak';
import { appendShapeAndFWHM } from '../utils/appendShapeAndFWHM';

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

export function joinBroadPeaks(
  peakList: GSDPeak[],
  options: JoinBroadPeaksOptions = {},
): GSDPeak[] {
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
  const peaks = appendShapeAndFWHM(peakList, { shape });

  if (peaks.length < 2) return peaks;

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
        //@ts-expect-error type is equal as expected
        peaks.push(fitted[0]);
      } else {
        // Put back the candidates to the peak list
        indexes.forEach((index) => {
          // @ts-expect-error todo 2
          peaks.push(broadLines[index]);
        });
      }

      candidates = { x: [broadLines[i].x], y: [broadLines[i].y] };
      indexes = [i];
      max = broadLines[i].y;
      maxI = i;
      count = 1;
    }
  }
  peaks.sort((a, b) => {
    return a.x - b.x;
  });

  return peaks;
}

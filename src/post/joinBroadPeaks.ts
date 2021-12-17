import type { DataXY } from 'cheminfo-types';
import type { Shape1D } from 'ml-peak-shape-generator';
import SG from 'ml-savitzky-golay-generalized';
import type { OptimizationOptions } from 'ml-spectra-fitting';
import { xFindClosestIndex } from 'ml-spectra-processing';

import { optimizePeaks } from '..';
import type { Peak1D } from '../gsd';

import { checkAscending } from './utils/checkAscending';

/**
 * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
 * @param peaks - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 */

interface GetSoftMaskOptions {
  sgOptions: {
    windowSize: number;
    polynomial: number;
  };
  /**
   * broadRatio
   * @default 0.0025
   */
  broadRatio: number;
}

export interface JoinBroadPeaksOptions extends Partial<GetSoftMaskOptions> {
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
  broadMask?: boolean[];
}

export function joinBroadPeaks(
  input: DataXY,
  peakList: Peak1D[],
  options: JoinBroadPeaksOptions = {},
): Peak1D[] {
  let {
    broadMask,
    shape = { kind: 'gaussian' },
    optimization = { kind: 'lm', options: { timeout: 10 } },
    sgOptions = {
      windowSize: 9,
      polynomial: 3,
    },
    broadRatio = 0.0025,
    broadWidth = 0.25,
  } = options;

  let max = 0;
  let maxI = 0;
  let count = 1;
  const broadLines: Peak1D[] = [];
  const peaks: Peak1D[] = JSON.parse(JSON.stringify(peakList));
  const { data } = checkAscending(input);
  const mask = !broadMask
    ? getSoftMask(data, peaks, { sgOptions, broadRatio })
    : broadMask;

  if (mask.length !== peaks.length) {
    throw new Error('mask length does not match the length of peaksList');
  }

  for (let i: number = peaks.length - 1; i >= 0; i--) {
    if (mask[i]) {
      broadLines.push(peaks.splice(i, 1)[0]);
    }
  }

  // Push a feke peak
  broadLines.push({
    index: Number.MAX_VALUE,
    x: Number.MAX_VALUE,
    y: 0,
    width: 0,
  });

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
        let optimizedPeaks = optimizePeaks(
          candidates,
          [
            {
              index: broadLines[maxI].index,
              x: broadLines[maxI].x,
              y: max,
              width: candidates.x[0] - candidates.x[candidates.x.length - 1],
              shape,
            },
          ],
          { shape, optimization },
        );
        peaks.push(optimizedPeaks[0]);
      } else {
        // Put back the candidates to the signals list
        indexes.forEach((index) => {
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

function getSoftMask(
  data: DataXY,
  peakList: Peak1D[],
  options: GetSoftMaskOptions,
) {
  const { sgOptions, broadRatio } = options;

  const { windowSize, polynomial } = sgOptions;

  const { x: xData, y: yData } = data;

  const ddY = SG(yData, xData[1] - xData[0], {
    windowSize,
    polynomial,
    derivative: 2,
  });

  let maxDdy = 0;
  for (const ddYIndex of ddY) {
    if (Math.abs(ddYIndex) > maxDdy) maxDdy = Math.abs(ddYIndex);
  }

  const broadMask: boolean[] = [];
  for (let peak of peakList) {
    const { x: xValue } = peak;
    const index = xFindClosestIndex(xData, xValue, { sorted: true });
    broadMask.push(Math.abs(ddY[index]) <= broadRatio * maxDdy);
  }

  return broadMask;
}

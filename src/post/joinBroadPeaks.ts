import { optimize } from 'ml-spectra-fitting';
import type { Shape1D } from 'ml-peak-shape-generator';
import type { Peak1D } from '../gsd';
import type { DataXY } from 'cheminfo-types';

import { xFindClosestIndex } from 'ml-spectra-processing';

import SG from 'ml-savitzky-golay-generalized';

/**
 * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
 * @param {Array} peaks - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param {object} [options = {}] - options
 * @param {number} [options.width=0.25] - width limit to join peaks.
 * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
 * @param {string} [options.shape.kind = 'gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
 * @param {object} [options.optimization = {}] - it's specify the kind and options of the algorithm use to optimize parameters.
 * @param {string} [options.optimization.kind = 'lm'] - kind of algorithm. By default it's levenberg-marquardt.
 * @param {number} [options.optimization.options.timeout = 10] - maximum time running before break in seconds.
 * @param {object} [options.optimization.options = {}] - options for the specific kind of algorithm.
 */

interface GetSoftMaskOptions {
  sgOptions: {
    windowSize: number;
    polynomial: number;
  };
  broadRatio: number;
}

interface OptionsType extends Partial<GetSoftMaskOptions> {
  width?: number;
  shape?: Shape1D;
  optimization?: { kind: string; timeout: number };
  mask?: Boolean[];
}

export function joinBroadPeaks(
  data: DataXY,
  peakList: Peak1D[],
  options: OptionsType = {},
): Peak1D[] {
  let {
    mask,
    shape = { kind: 'gaussian' },
    optimization = { kind: 'lm', timeout: 10 },
    sgOptions = {
      windowSize: 9,
      polynomial: 3,
    },
    broadRatio = 0.0025,
  } = options;
  let { width = 0.25 } = options;

  let max = 0;
  let maxI = 0;
  let count = 1;
  const broadLines: Peak1D[] = [];
  const peaks: Peak1D[] = JSON.parse(JSON.stringify(peakList));
  const broadMask = !mask
    ? getSoftMask(data, peaks, { sgOptions, broadRatio })
    : mask;

  if (broadMask.length !== peaks.length) {
    throw new Error('mask length does not match the length of peaksList');
  }

  for (let i: number = peaks.length - 1; i >= 0; i--) {
    if (broadMask[i]) {
      broadLines.push(peaks.splice(i, 1)[0]);
    }
  }

  // Push a feke peak
  broadLines.push({ x: Number.MAX_VALUE, y: 0, width: 0 });

  let candidates: { x: number[]; y: number[] } = {
    x: [broadLines[0].x],
    y: [broadLines[0].y],
  };
  let indexes: number[] = [0];
  for (let i = 1; i < broadLines.length; i++) {
    if (Math.abs(broadLines[i - 1].x - broadLines[i].x) < width) {
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
        let fitted = optimize(
          candidates,
          [
            {
              x: broadLines[maxI].x,
              y: max,
              width: candidates.x[0] - candidates.x[candidates.x.length - 1],
              shape,
            },
          ],
          { shape, optimization },
        );
        let { peaks: peak } = fitted;
        peaks.push(peak[0]);
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

  const yData = new Float64Array(data.y);
  const xData = new Float64Array(data.x);

  if (xData[1] - xData[0] < 0) {
    yData.reverse();
    xData.reverse();
  }

  const ddY = SG(yData, xData[1] - xData[0], {
    windowSize,
    polynomial,
    derivative: 2,
  });

  let maxDdy = 0;
  for (let i = 0; i < ddY.length; i++) {
    if (Math.abs(ddY[i]) > maxDdy) maxDdy = Math.abs(ddY[i]);
  }

  const broadMask: boolean[] = [];
  for (let peak of peakList) {
    const { x: xValue } = peak;
    const index = xFindClosestIndex(xData, xValue, { sorted: true });
    broadMask.push(Math.abs(ddY[index]) <= broadRatio * maxDdy);
  }

  return broadMask;
}

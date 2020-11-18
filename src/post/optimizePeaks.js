import { optimize } from 'ml-spectra-fitting';

import { groupPeaks } from './groupPeaks';

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (width)
 * and the ratio of gaussian contribution (mu) if it's required. It supports three kind of shapes: gaussian, lorentzian and pseudovoigt
 * @param {object} data - An object containing the x and y data to be fitted.
 * @param {Array} peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param {object} [options = {}] -
 * @param {number} [options.factorWidth = 1] - times of width to group peaks.
 * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
 * @param {string} [options.shape.kind = 'gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
 * @param {object} [options.optimization = {}] - it's specify the kind and options of the algorithm use to optimize parameters.
 * @param {string} [options.optimization.kind = 'lm'] - kind of algorithm. By default it's levenberg-marquardt.
 * @param {object} [options.optimization.options = {}] - options for the specific kind of algorithm.
 */

export function optimizePeaks(data, peakList, options = {}) {
  const {
    factorWidth = 1,
    shape = {
      kind: 'gaussian',
    },
    optimization = {
      kind: 'lm',
    },
  } = options;

  let { x, y } = data;

  let groups = groupPeaks(peakList, factorWidth);

  for (const peaks of groups) {
    let firstPeak = peaks[0];
    let lastPeak = peaks[peaks.length - 1];

    // Multiple peaks
    let sampling = sampleFunction(
      firstPeak.x - firstPeak.width,
      lastPeak.x + lastPeak.width,
      x,
      y,
      lastIndex,
    );
    if (sampling.x.length > 5) {
      let { peaks: optimizedPeaks } = optimize(sampling, peaks, {
        shape,
        optimization,
      });
    }
  }
  return groups.flat();
}

function sampleFunction(from, to, x, y, lastIndex) {
  let nbPoints = x.length;
  let sampleX = [];
  let sampleY = [];
  let direction = Math.sign(x[1] - x[0]); // Direction of the derivative
  if (direction === -1) {
    lastIndex[0] = x.length - 1;
  }

  let delta = Math.abs(to - from) / 2;
  let mid = (from + to) / 2;
  let stop = false;
  let index = lastIndex[0];
  while (!stop && index < nbPoints && index >= 0) {
    if (Math.abs(x[index] - mid) <= delta) {
      sampleX.push(x[index]);
      sampleY.push(y[index]);
      index += direction;
    } else {
      // It is outside the range.
      if (Math.sign(mid - x[index]) === 1) {
        // We'll reach the mid going in the current direction
        index += direction;
      } else {
        // There is not more peaks in the current range
        stop = true;
      }
    }
  }
  lastIndex[0] = index;
  return { x: sampleX, y: sampleY };
}

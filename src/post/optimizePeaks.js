import { optimize } from 'ml-spectra-fitting';

/**
 * Optimize the position (x), max intensity (y), full width at half maximum (width)
 * and the ratio of gaussian contribution (mu) if it's required. It supports three kind of shapes: gaussian, lorentzian and pseudovoigt
 * @param {object} data - An object containing the x and y data to be fitted.
 * @param {Array} peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param {object} [options = {}] -
 * @param {string} [options.kind = 'gaussian'] - kind of shape used to fitting, lorentzian, gaussian and pseudovoigt are supported.
 * @param {number} [options.factorWidth = 4] - times of width to group peaks.
 * @param {object} [options.joinPeaks = true] - if true the peaks could be grouped if the separation between them are inside of a range of factorWidth * width
 * @param {object} [options.optimizationOptions] - options of ml-levenberg-marquardt optimization package.
 */

export function optimizePeaks(data, peakList, options = {}) {
  const {
    factorWidth = 1,
    joinPeaks = true,
    shape = {
      kind: 'gaussian',
    },
    optimizationOptions = {
      damping: 1.5,
      maxIterations: 100,
      errorTolerance: 10e-5,
    },
  } = options;

  let { x, y } = data;

  let lastIndex = [0];
  let groups = groupPeaks(peakList, factorWidth, joinPeaks);

  let result = [];
  let sampling;
  for (let i = 0; i < groups.length; i++) {
    let peaks = groups[i].group;
    if (peaks.length > 1) {
      // Multiple peaks
      sampling = sampleFunction(
        groups[i].limits[0] - groups[i].limits[1],
        groups[i].limits[0] + groups[i].limits[1],
        x,
        y,
        lastIndex,
      );
      if (sampling.x.length > 5) {
        let { peaks: optPeaks } = optimize(sampling, peaks, {
          shape,
          lmOptions: optimizationOptions,
        });
        for (let j = 0; j < optPeaks.length; j++) {
          optPeaks[j].index = peaks.index;
          result.push(optPeaks[j]);
        }
      }
    } else {
      // Single peak
      peaks = peaks[0];
      sampling = sampleFunction(
        peaks.x - factorWidth * peaks.width,
        peaks.x + factorWidth * peaks.width,
        x,
        y,
        lastIndex,
      );

      if (sampling.x.length > 5) {
        let fitResult = optimize(sampling, [peaks], {
          shape,
          lmOptions: optimizationOptions,
        });
        let { peaks: optPeaks } = fitResult;
        optPeaks[0].index = peaks.index;
        result.push(optPeaks[0]);
      }
    }
  }
  return result;
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

function groupPeaks(peakList, nL, joinPeaks) {
  let group = [];
  let groups = [];
  let limits = [peakList[0].x, nL * peakList[0].width];
  let upperLimit, lowerLimit;
  // Merge forward
  for (let i = 0; i < peakList.length; i++) {
    // If the 2 things overlaps
    if (
      joinPeaks &&
      Math.abs(peakList[i].x - limits[0]) < nL * peakList[i].width + limits[1]
    ) {
      // Add the peak to the group
      group.push(peakList[i]);
      // Update the group limits
      upperLimit = limits[0] + limits[1];
      if (peakList[i].x + nL * peakList[i].width > upperLimit) {
        upperLimit = peakList[i].x + nL * peakList[i].width;
      }
      lowerLimit = limits[0] - limits[1];
      if (peakList[i].x - nL * peakList[i].width < lowerLimit) {
        lowerLimit = peakList[i].x - nL * peakList[i].width;
      }
      limits = [
        (upperLimit + lowerLimit) / 2,
        Math.abs(upperLimit - lowerLimit) / 2,
      ];
    } else {
      groups.push({ limits: limits, group: group });
      group = [peakList[i]];
      limits = [peakList[i].x, nL * peakList[i].width];
    }
  }
  groups.push({ limits: limits, group: group });
  // Merge backward
  for (let i = groups.length - 2; i >= 0; i--) {
    // The groups overlaps
    if (
      Math.abs(groups[i].limits[0] - groups[i + 1].limits[0]) <
      (groups[i].limits[1] + groups[i + 1].limits[1]) / 2
    ) {
      for (let j = 0; j < groups[i + 1].group.length; j++) {
        groups[i].group.push(groups[i + 1].group[j]);
      }
      upperLimit = groups[i].limits[0] + groups[i].limits[1];
      if (groups[i + 1].limits[0] + groups[i + 1].limits[1] > upperLimit) {
        upperLimit = groups[i + 1].limits[0] + groups[i + 1].limits[1];
      }
      lowerLimit = groups[i].limits[0] - groups[i].limits[1];
      if (groups[i + 1].limits[0] - groups[i + 1].limits[1] < lowerLimit) {
        lowerLimit = groups[i + 1].limits[0] - groups[i + 1].limits[1];
      }

      groups[i].limits = [
        (upperLimit + lowerLimit) / 2,
        Math.abs(upperLimit - lowerLimit) / 2,
      ];

      groups.splice(i + 1, 1);
    }
  }
  return groups;
}

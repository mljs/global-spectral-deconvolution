/**
 * Created by acastillo on 9/6/15.
 */
'use strict';

var optimize = require('ml-optimize-lorentzian');

function sampleFunction(from, to, x, y, lastIndex) {
  var nbPoints = x.length;
  var sampleX = [];
  var sampleY = [];
  var direction = Math.sign(x[1] - x[0]); // Direction of the derivative
  if (direction === -1) {
    lastIndex[0] = x.length - 1;
  }

  var delta = Math.abs(to - from) / 2;
  var mid = (from + to) / 2;
  var stop = false;
  var index = lastIndex[0];
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
    // console.log(sampleX);
  }
  lastIndex[0] = index;
  return [sampleX, sampleY];
}

module.exports = function optimizePeaks(peakList, x, y, n, fnType) {
  var i;
  var j;

  var lastIndex = [0];
  var groups = groupPeaks(peakList, n);
  var result = [];
  var factor = 1;
  if (fnType === 'gaussian') {
    factor = 1.17741;
  } // From https://en.wikipedia.org/wiki/Gaussian_function#Properties
  var sampling, error, opts;
  for (i = 0; i < groups.length; i++) {
    var peaks = groups[i].group;
    if (peaks.length > 1) {
      // Multiple peaks
      // console.log("Pending group of overlaped peaks "+peaks.length);
      // console.log("here1");
      // console.log(groups[i].limits);
      sampling = sampleFunction(
        groups[i].limits[0] - groups[i].limits[1],
        groups[i].limits[0] + groups[i].limits[1],
        x,
        y,
        lastIndex
      );
      // console.log(sampling);
      if (sampling[0].length > 5) {
        error = peaks[0].width / 1000;
        opts = [3, 100, error, error, error, error * 10, error * 10, 11, 9, 1];
        // var gauss = Opt.optimizeSingleGaussian(sampling[0], sampling[1], opts, peaks);
        var optPeaks = [];
        if (fnType === 'gaussian') {
          optPeaks = optimize.optimizeGaussianSum(sampling, peaks, opts);
        } else {
          if (fnType === 'lorentzian') {
            optPeaks = optimize.optimizeLorentzianSum(sampling, peaks, opts);
          }
        }
        // console.log(optPeak);
        for (j = 0; j < optPeaks.length; j++) {
          result.push({
            x: optPeaks[j][0][0],
            y: optPeaks[j][1][0],
            width: optPeaks[j][2][0] * factor
          });
        }
      }
    } else {
      // Single peak
      peaks = peaks[0];
      sampling = sampleFunction(
        peaks.x - n * peaks.width,
        peaks.x + n * peaks.width,
        x,
        y,
        lastIndex
      );
      // console.log("here2");
      // console.log(groups[i].limits);
      if (sampling[0].length > 5) {
        error = peaks.width / 1000;
        opts = [3, 100, error, error, error, error * 10, error * 10, 11, 9, 1];
        // var gauss = Opt.optimizeSingleGaussian(sampling[0], sampling[1], opts, peaks);
        // var gauss = Opt.optimizeSingleGaussian([sampling[0],sampling[1]], peaks, opts);
        var optPeak = [];
        if (fnType === 'gaussian') {
          optPeak = optimize.optimizeSingleGaussian(
            [sampling[0], sampling[1]],
            peaks,
            opts
          );
        } else {
          if (fnType === 'lorentzian') {
            optPeak = optimize.optimizeSingleLorentzian(
              [sampling[0], sampling[1]],
              peaks,
              opts
            );
          }
        }
        // console.log(optPeak);
        result.push({
          x: optPeak[0][0],
          y: optPeak[1][0],
          width: optPeak[2][0] * factor
        }); // From https://en.wikipedia.org/wiki/Gaussian_function#Properties}
      }
    }
  }
  return result;
};

function groupPeaks(peakList, nL) {
  var group = [];
  var groups = [];
  var i, j;
  var limits = [peakList[0].x, nL * peakList[0].width];
  var upperLimit, lowerLimit;
  // Merge forward
  for (i = 0; i < peakList.length; i++) {
    // If the 2 things overlaps
    if (
      Math.abs(peakList[i].x - limits[0]) <
      nL * peakList[i].width + limits[1]
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
        Math.abs(upperLimit - lowerLimit) / 2
      ];
    } else {
      groups.push({ limits: limits, group: group });
      // var optmimalPeak = fitSpectrum(group,limits,spectrum);
      group = [peakList[i]];
      limits = [peakList[i].x, nL * peakList[i].width];
    }
  }
  groups.push({ limits: limits, group: group });
  // Merge backward
  for (i = groups.length - 2; i >= 0; i--) {
    // The groups overlaps
    if (
      Math.abs(groups[i].limits[0] - groups[i + 1].limits[0]) <
      (groups[i].limits[1] + groups[i + 1].limits[1]) / 2
    ) {
      for (j = 0; j < groups[i + 1].group.length; j++) {
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
      // console.log(limits);
      groups[i].limits = [
        (upperLimit + lowerLimit) / 2,
        Math.abs(upperLimit - lowerLimit) / 2
      ];

      groups.splice(i + 1, 1);
    }
  }
  return groups;
}

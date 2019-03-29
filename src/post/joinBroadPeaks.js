'use strict';

var Opt = require('ml-optimize-lorentzian');

/**
 * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
 * @param peakList
 * @param options
 */
module.exports = function joinBroadPeaks(peakList, options = {}) {
  var width = options.width;
  var broadLines = [];
  // Optimize the possible broad lines
  var max = 0;

  var maxI = 0;

  var count = 1;
  for (let i = peakList.length - 1; i >= 0; i--) {
    if (peakList[i].soft) {
      broadLines.push(peakList.splice(i, 1)[0]);
    }
  }
  // Push a feke peak
  broadLines.push({ x: Number.MAX_VALUE });

  var candidates = [[broadLines[0].x, broadLines[0].y]];
  var indexes = [0];

  for (let i = 1; i < broadLines.length; i++) {
    // console.log(broadLines[i-1].x+" "+broadLines[i].x);
    if (Math.abs(broadLines[i - 1].x - broadLines[i].x) < width) {
      candidates.push([broadLines[i].x, broadLines[i].y]);
      if (broadLines[i].y > max) {
        max = broadLines[i].y;
        maxI = i;
      }
      indexes.push(i);
      count++;
    } else {
      if (count > 2) {
        var fitted = Opt.optimizeSingleLorentzian(candidates, {
          x: broadLines[maxI].x,
          y: max,
          width: Math.abs(
            candidates[0][0] - candidates[candidates.length - 1][0]
          )
        });
        peakList.push({
          x: fitted[0][0],
          y: fitted[1][0],
          width: fitted[2][0],
          soft: false
        });
      } else {
        // Put back the candidates to the signals list
        indexes.forEach((index) => {
          peakList.push(broadLines[index]);
        });
      }
      candidates = [[broadLines[i].x, broadLines[i].y]];
      indexes = [i];
      max = broadLines[i].y;
      maxI = i;
      count = 1;
    }
  }

  peakList.sort(function (a, b) {
    return a.x - b.x;
  });

  return peakList;
};

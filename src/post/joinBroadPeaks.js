import { optimizeSingleLorentzian } from 'ml-optimize-lorentzian';

/**
 * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
 * @param peakList
 * @param options
 */
export function joinBroadPeaks(peakList, options = {}) {
  let width = options.width;
  let broadLines = [];
  // Optimize the possible broad lines
  let max = 0;

  let maxI = 0;

  let count = 1;
  for (let i = peakList.length - 1; i >= 0; i--) {
    if (peakList[i].soft) {
      broadLines.push(peakList.splice(i, 1)[0]);
    }
  }
  // Push a feke peak
  broadLines.push({ x: Number.MAX_VALUE });

  let candidates = [[broadLines[0].x, broadLines[0].y]];
  let indexes = [0];

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
        let fitted = optimizeSingleLorentzian(candidates, {
          x: broadLines[maxI].x,
          y: max,
          width: Math.abs(
            candidates[0][0] - candidates[candidates.length - 1][0],
          ),
        });
        let { parameters } = fitted;
        peakList.push({
          x: parameters[0],
          y: parameters[1],
          width: parameters[2],
          soft: false,
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
}

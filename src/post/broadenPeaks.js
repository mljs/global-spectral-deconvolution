'use strict';

/**
 * This method will allow to enlarge peaks and prevent overlap between peaks
 * Because peaks may not be symmetric after we add 2 properties, from and to.
 * @param {Array} peakList
 * @param {object} [options={}]
 * @param {number} [factor=2]
 * @param {boolean} [overlap=false] by default we don't allow overlap
 * @return {Array} peakList
 */
module.exports = function broadenPeaks(peakList, options = {}) {
  const { factor = 2, overlap = false } = options;

  for (let peak of peakList) {
    peak.from = peak.x - (peak.width / 2) * factor;
    peak.to = peak.x + (peak.width / 2) * factor;
  }

  if (!overlap) {
    for (let i = 0; i < peakList.length - 1; i++) {
      let peak = peakList[i];
      let nextPeak = peakList[i + 1];
      if (peak.to > nextPeak.from) {
        peak.to = nextPeak.from = (peak.to + nextPeak.from) / 2;
      }
    }
  }

  for (let peak of peakList) {
    peak.width = peak.to - peak.from;
  }

  return peakList;
};

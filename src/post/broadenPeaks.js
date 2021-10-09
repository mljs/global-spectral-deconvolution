/**
 * This method will allow to enlarge peaks and prevent overlap between peaks
 * Because peaks may not be symmetric after we add 2 properties, from and to.
 * @param {Array} peakList
 * @param {object} [options={}]
 * @param {number} [options.factor=2]
 * @param {boolean} [options.overlap=false] by default we don't allow overlap
 * @return {Array} peakList
 */
export function broadenPeaks(peakList, options = {}) {
  const { factor = 2, overlap = false } = options;

  const peaks = JSON.parse(JSON.stringify(peakList));

  for (let peak of peaks) {
    peak.from = peak.x - (peak.shape.width / 2) * factor;
    peak.to = peak.x + (peak.shape.width / 2) * factor;
  }

  if (!overlap) {
    for (let i = 0; i < peaks.length - 1; i++) {
      let peak = peaks[i];
      let nextPeak = peaks[i + 1];
      if (peak.to > nextPeak.from) {
        peak.to = nextPeak.from = (peak.to + nextPeak.from) / 2;
      }
    }
  }

  for (let peak of peaks) {
    peak.shape.width = peak.to - peak.from;
  }

  return peaks.map((peak) => {
    const { x, y, shape } = peak;
    return { x, y, shape };
  });
}

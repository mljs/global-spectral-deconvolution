import { GSDBroadenPeak } from '../GSDBroadenPeak';
import { GSDPeak } from '../GSDPeak';

/**
 * This method will allow to enlarge peaks while preventing overlap between peaks
 * A typical application in chromatography peak picking.
 * We should not make the hypothesis that x is equidistant
 * Because peaks may not be symmetric after we add 2 properties, from and to.
 * @return {Array} peakList
 */

export function broadenPeaks(
  peakList: GSDPeak[],
  options: {
    /**
     * @default 2
     */
    factor?: number;
    /**
     * by default we don't allow overlap
     * @default false
     */
    overlap?: boolean;
  } = {},
): GSDBroadenPeak[] {
  const { factor = 2, overlap = false } = options;

  const peaks = peakList.map((peak) => {
    const xFrom = peak.x - (peak.x - peak.inflectionPoints.from.x) * factor;
    const xTo = peak.x + (peak.inflectionPoints.to.x - peak.x) * factor;
    return {
      x: peak.x,
      y: peak.y,
      index: peak.index,
      width: xTo - xFrom,
      from: { x: xFrom },
      to: { x: xTo },
    };
  });

  if (!overlap) {
    for (let i = 0; i < peaks.length - 1; i++) {
      let peak = peaks[i];
      let nextPeak = peaks[i + 1];
      if (peak.to.x > nextPeak.from.x) {
        peak.to.x = nextPeak.from.x = (peak.to.x + nextPeak.from.x) / 2;
      }
    }
  }

  for (let peak of peaks) {
    peak.width = peak.to.x - peak.from.x;
  }

  return peaks;
}

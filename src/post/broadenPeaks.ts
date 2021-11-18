import type { Peak1D } from '../gsd';

/**
 * This method will allow to enlarge peaks and prevent overlap between peaks
 * Because peaks may not be symmetric after we add 2 properties, from and to.
 * @return {Array} peakList
 */
interface BroadenPeaksOptions {
  /**
   * @default 2
   */
  factor?: number;
  /**
   * by default we don't allow overlap
   * @default false
   */
  overlap?: boolean;
}

interface InternPeak1D extends Peak1D {
  from: number;
  to: number;
}
export function broadenPeaks(
  peakList: Peak1D[],
  options: BroadenPeaksOptions = {},
): Peak1D[] {
  const { factor = 2, overlap = false } = options;

  const peaks: InternPeak1D[] = JSON.parse(JSON.stringify(peakList));

  peaks.forEach((peak) => {
    peak.from = peak.x - (peak.width / 2) * factor;
    peak.to = peak.x + (peak.width / 2) * factor;
  });

  if (!overlap) {
    for (let i = 0; i < peaks.length - 1; i++) {
      let peak = peaks[i];
      let nextPeak = peaks[i + 1];
      if ((peak.to as number) > (nextPeak.from as number)) {
        peak.to = nextPeak.from =
          ((peak.to as number) + (nextPeak.from as number)) / 2;
      }
    }
  }

  for (let peak of peaks) {
    peak.width = (peak.to as number) - (peak.from as number);
  }

  return peaks.map((peak: Peak1D) => {
    const { x, y, width, shape } = peak;
    const peakResult: Peak1D = { x, y, width };
    if (shape) peakResult.shape = shape;
    return peakResult;
  });
}

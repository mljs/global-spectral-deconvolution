import type { XIndex } from '../XIndex.ts';
import type { GSDPeakID } from '../gsd.ts';

import type { PeakData } from './PeakData.ts';
import { tryMatchOneIntervalWithMinData } from './tryMatchOneIntervalWithMinData.ts';

export interface GetPeakFromIntervalsOptions extends Pick<
  PeakData,
  'yThreshold' | 'ddY' | 'yData' | 'x'
> {
  /** Right boundary (max side) of each peak interval. */
  intervalR: XIndex[];
  /** Left boundary (min side) of each peak interval. */
  intervalL: XIndex[];
  /** Candidate peak-center indices to match against the intervals. */
  minData: number[];
}

/**
 * Build the list of detected peaks by matching each `[left, right]` interval
 * with the best candidate index from `minData`.
 * @param options - Intervals, candidate indices and spectrum data.
 * @returns The detected peaks.
 */
export function getPeakFromIntervals(options: GetPeakFromIntervalsOptions) {
  let lastK = -1;
  const peaks: GSDPeakID[] = [];
  const { x, ddY, yData, yThreshold, intervalR, intervalL, minData } = options;

  for (let i = 0; i < intervalL.length; i++) {
    const intervalWidth = (intervalR[i].x - intervalL[i].x) / 2;
    const intervalCenter = (intervalR[i].x + intervalL[i].x) / 2;
    const { possible, lastIndex } = tryMatchOneIntervalWithMinData({
      x,
      lastK,
      minData,
      yThreshold,
      intervalWidth,
      intervalCenter,
      yData,
    });

    if (possible !== -1) {
      const centerIndex = minData[possible];
      const width = Math.abs(intervalR[i].x - intervalL[i].x);
      peaks.push({
        id: crypto.randomUUID(),
        x: x[centerIndex],
        y: yData[centerIndex],
        width,
        index: centerIndex,
        ddY: ddY[centerIndex],
        inflectionPoints: {
          from: intervalL[i],
          to: intervalR[i],
        },
      });
    }
    lastK = lastIndex;
  }

  return peaks;
}

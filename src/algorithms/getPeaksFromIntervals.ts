import type { XIndex } from '../XIndex.ts';
import type { GSDPeakID } from '../gsd.ts';

import type { PeakData } from './PeakData.ts';
import { tryMatchOneIntervalWithMinData } from './tryMatchOneIntervalWithMinData.ts';

export function getPeakFromIntervals(
  options: Pick<PeakData, 'yThreshold' | 'ddY' | 'yData' | 'x'> & {
    intervalR: XIndex[];
    intervalL: XIndex[];
    minData: number[];
  },
) {
  let lastK = -1;
  const peaks: GSDPeakID[] = [];
  const { x, ddY, yData, yThreshold, intervalR, intervalL, minData } = options;

  for (let i = 0; i < intervalL.length; i++) {
    const intervalWidth = (intervalR[i].x - intervalL[i].x) / 2;
    const intervalCenter = (intervalR[i].x + intervalL[i].x) / 2;
    const { possible = -1, lastIndex } = tryMatchOneIntervalWithMinData({
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

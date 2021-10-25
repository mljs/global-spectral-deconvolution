/**
 * Group peaks based on factor and add group property in peaks
 * @param {array} peakList
 * @param {number} factor
 */

import { PeakType } from '..';

export function groupPeaks(peakList: PeakType[], factor = 1): PeakType[][] {
  if (peakList && peakList.length === 0) return [];

  let peaks: PeakType[] = JSON.parse(JSON.stringify(peakList));
  peaks.sort((a, b) => a.x - b.x);

  let previousPeak: PeakType = {
    x: Number.NEGATIVE_INFINITY,
    shape: { width: 1 },
    y: 0,
  };
  let currentGroup: PeakType[] = [previousPeak];
  let groups: PeakType[][] = [];

  peaks.forEach((peak) => {
    if (
      (peak.x - previousPeak.x) /
        (peak.shape.width + previousPeak.shape.width) <=
      factor / 2
    ) {
      currentGroup.push(peak);
    } else {
      currentGroup = [peak];
      groups.push(currentGroup);
    }
    previousPeak = peak;
  });

  return groups;
}

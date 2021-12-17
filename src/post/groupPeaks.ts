import type { Peak1D } from '../gsd';

/**
 * Group peaks based on factor and add group property in peaks
 */

export interface GroupPeaksOptions {
  factor?: number;
  width?: number;
}

export function groupPeaks(peakList: Peak1D[], factor = 1): Peak1D[][] {
  if (peakList && peakList.length === 0) return [];

  let peaks: Peak1D[] = JSON.parse(JSON.stringify(peakList));
  peaks.sort((a, b) => a.x - b.x);

  let previousPeak: Peak1D = {
    index: -1,
    x: Number.NEGATIVE_INFINITY,
    y: 0,
    width: 1,
  };
  let currentGroup: Peak1D[] = [previousPeak];
  let groups: Peak1D[][] = [];

  peaks.forEach((peak) => {
    if (
      (peak.x - previousPeak.x) / (peak.width + previousPeak.width) <=
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

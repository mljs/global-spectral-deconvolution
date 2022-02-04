import { GSDPeak } from '../GSDPeak';

/**
 * Group peaks based on factor and add group property in peaks
 */

export interface GroupPeaksOptions {
  factor?: number;
  width?: number;
}

export function groupPeaks(peakList: GSDPeak[], factor = 1): GSDPeak[][] {
  if (peakList && peakList.length === 0) return [];

  let peaks: GSDPeak[] = JSON.parse(JSON.stringify(peakList));
  peaks.sort((a, b) => a.x - b.x);

  let previousPeak: GSDPeak = {
    x: Number.NEGATIVE_INFINITY,
    y: 0,
    width: 1,
  };
  let currentGroup: GSDPeak[] = [previousPeak];
  let groups: GSDPeak[][] = [];

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

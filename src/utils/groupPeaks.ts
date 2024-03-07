/**
 * Group peaks based on factor
 * In order to group peaks we only need the x and width value. This means that
 * in the current implementation we don't take into account the asymmetry of peaks
 */

export function groupPeaks<T extends { x: number; width: number }>(
  peaks: T[],
  options: {
    /**
     * In order to group peaks we will use a factor that takes into account the peak width.
     *
     */
    factor?: number;
  } = {},
): T[][] {
  if (peaks && peaks.length === 0) return [];

  const { factor = 1 } = options;

  peaks = JSON.parse(JSON.stringify(peaks));
  peaks.sort((a, b) => a.x - b.x);

  let previousPeak = peaks[0];
  let currentGroup: T[] = [previousPeak];
  const groups: T[][] = [currentGroup];

  for (let i = 1; i < peaks.length; i++) {
    const peak = peaks[i];
    if (
      (peak.x - previousPeak.x) / ((peak.width + previousPeak.width) / 2) <=
      factor
    ) {
      currentGroup.push(peak);
    } else {
      currentGroup = [peak];
      groups.push(currentGroup);
    }
    previousPeak = peak;
  }

  return groups;
}

export interface GroupPeaksOptions {
  /**
   * Multiplier applied to the average width of two adjacent peaks when
   * deciding whether to group them.
   * @default 1
   */
  factor?: number;
}

/**
 * Group peaks based on a width-aware factor.
 * Only `x` and `width` are used, so the current implementation does not take
 * peak asymmetry into account.
 * @param peaks - Peaks with `x` and `width` properties.
 * @param options - Grouping options.
 * @returns Groups of peaks sorted by ascending `x`.
 */
export function groupPeaks<T extends { x: number; width: number }>(
  peaks: T[],
  options: GroupPeaksOptions = {},
): T[][] {
  if (peaks.length === 0) return [];

  const { factor = 1 } = options;

  const sortedPeaks = peaks.toSorted((a, b) => a.x - b.x);

  let previousPeak = sortedPeaks[0];
  let currentGroup: T[] = [previousPeak];
  const groups: T[][] = [currentGroup];

  for (let i = 1; i < sortedPeaks.length; i++) {
    const peak = sortedPeaks[i];
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

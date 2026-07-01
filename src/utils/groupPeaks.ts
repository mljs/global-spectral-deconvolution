import { splitGroup } from './splitGroup.ts';

export interface GroupPeaksOptions {
  /**
   * Multiplier applied to the average width of two adjacent peaks when
   * deciding whether to group them.
   * @default 1
   */
  groupingFactor?: number;
  /**
   * Multiplier used to define an effective influence radius around each peak
   * (scaled by `sqrt(groupingFactor)`) for overlap-based grouping.
   *
   * This captures broad partially-overlapping peaks that are frequently found
   * in NMR spectra and should usually be optimized together.
   * @default 0.8
   */
  overlapFactor?: number;
  /**
   * If provided, any group exceeding this size will be recursively split
   * at the largest normalised gap until all groups satisfy the constraint.
   * @default 15
   */
  maxNumberOfPeaks?: number;
}

/**
 * Group peaks based on a width-aware factor.
 *
 * The grouping criterion is hybrid:
 * 1. Legacy center-distance criterion normalised by mean width.
 * 2. Effective-overlap criterion using influence radii around each peak.
 *
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

  const {
    groupingFactor = 1,
    overlapFactor = 0.8,
    maxNumberOfPeaks = 15,
  } = options;

  const safeGroupingFactor = Math.max(0, groupingFactor);
  const overlapScale = overlapFactor * Math.sqrt(safeGroupingFactor);

  const sortedPeaks = peaks.toSorted((a, b) => a.x - b.x);

  let previousPeak = sortedPeaks[0];
  let currentGroup: T[] = [previousPeak];
  const groups: T[][] = [currentGroup];

  for (let i = 1; i < sortedPeaks.length; i++) {
    const peak = sortedPeaks[i];
    const distance = peak.x - previousPeak.x;
    const averageWidth = (peak.width + previousPeak.width) / 2;

    const normalizedDistance = distance / averageWidth;
    const overlapDistance =
      overlapScale * (previousPeak.width + peak.width) - distance;

    if (
      normalizedDistance <= safeGroupingFactor ||
      (Number.isFinite(overlapDistance) && overlapDistance >= 0)
    ) {
      currentGroup.push(peak);
    } else {
      currentGroup = [peak];
      groups.push(currentGroup);
    }
    previousPeak = peak;
  }

  if (maxNumberOfPeaks !== undefined) {
    return groups.flatMap((group) =>
      group.length > maxNumberOfPeaks
        ? splitGroup(group, maxNumberOfPeaks)
        : [group],
    );
  }

  return groups;
}

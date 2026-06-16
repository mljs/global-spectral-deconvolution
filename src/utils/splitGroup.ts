/**
 * Splits a group of peaks into smaller subgroups whose size is approximately
 * limited by `maxNumberOfPeaks`.
 *
 * If the group contains more peaks than allowed, the function identifies the
 * largest normalized gaps between adjacent peaks and uses them as split points.
 *
 * The gap score is computed as:
 *
 * `score = distanceBetweenCenters / averagePeakWidth`
 *
 * where:
 * - `distanceBetweenCenters = peak[i + 1].x - peak[i].x`
 * - `averagePeakWidth = (peak[i].width + peak[i + 1].width) / 2`
 *
 * Larger scores indicate that two neighboring peaks are well separated
 * relative to their widths, making them good candidates for dividing the
 * fitting problem into independent subgroups.
 *
 * The algorithm:
 * 1. Computes the number of cuts required.
 * 2. Scores every boundary between adjacent peaks.
 * 3. Selects the boundaries with the largest scores.
 * 4. Splits the original group at those boundaries.
 * @param group - Ordered collection of peaks. Peaks should be sorted by
 * increasing `x` position before calling this function.
 * @param maxNumberOfPeaks - Desired maximum number of peaks per subgroup.
 * If the group size is less than or equal to this value, no splitting occurs.
 * @returns An array of peak subgroups. The returned groups preserve the
 * original peak ordering.
 */

export function splitGroup<T extends { x: number; width: number }>(
  group: T[],
  maxNumberOfPeaks: number,
): T[][] {
  const groups: T[][] = [group];

  while (true) {
    const index = groups.findIndex((g) => g.length > maxNumberOfPeaks);

    if (index === -1) break;

    const current = groups[index];
    const cut = findBestCut(current);

    groups.splice(index, 1, current.slice(0, cut), current.slice(cut));
  }

  return groups;
}

function findBestCut(group: Array<{ x: number; width: number }>): number {
  let bestScore = -Infinity;
  const candidates: Array<{ index: number; balance: number }> = [];

  for (let i = 1; i < group.length; i++) {
    const score =
      (group[i].x - group[i - 1].x) /
      ((group[i].width + group[i - 1].width) / 2);

    if (score > bestScore) {
      bestScore = score;
      candidates.length = 0;
    }

    if (score === bestScore) {
      candidates.push({
        index: i,
        balance: Math.abs(i - (group.length - i)),
      });
    }
  }

  let bestScored = candidates[0];
  for (const candidate of candidates) {
    if (candidate.balance < bestScored.balance) {
      bestScored = candidate;
    }
  }

  return bestScored.index;
}

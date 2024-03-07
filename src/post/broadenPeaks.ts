import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

import { GSDBroadenPeak } from '../GSDBroadenPeak';
import { GSDPeak } from '../GSDPeak';

type GSDPeakOptionalShape = GSDPeak & { shape?: Shape1D };

type GSDBroadenPeakWithID = GSDBroadenPeak & { id: string };
type GSDBroadenPeakWithShape = GSDBroadenPeak & { shape: Shape1D };
type GSDBroadenPeakWithShapeID = GSDBroadenPeakWithID & { shape: Shape1D };

export type WithOrWithout<T, ToExtends, TrueType, FalseType> =
  T extends ToExtends ? TrueType : FalseType;

export type WithIDOrShape<T> = T extends { id: string }
  ? WithOrWithout<T, GSDPeak, GSDBroadenPeakWithShapeID, GSDBroadenPeakWithID>
  : WithOrWithout<T, GSDPeak, GSDBroadenPeakWithShape, GSDBroadenPeak>;

/**
 * This method will allow to enlarge peaks while preventing overlap between peaks
 * A typical application in chromatography peak picking.
 * We should not make the hypothesis that x is equidistant
 * Because peaks may not be symmetric after we add 2 properties, from and to.
 * @return {Array} peakList
 */

export function broadenPeaks<T extends GSDPeakOptionalShape>(
  peakList: T[],
  options: {
    /**
     * @default 2
     */
    factor?: number;
    /**
     * by default we don't allow overlap
     * @default false
     */
    overlap?: boolean;
  } = {},
) {
  const { factor = 2, overlap = false } = options;

  const peaks = mapPeaks(peakList, factor);

  if (!overlap) {
    for (let i = 0; i < peaks.length - 1; i++) {
      const peak = peaks[i];
      const nextPeak = peaks[i + 1];
      if (peak.to.x > nextPeak.from.x) {
        // we do it proportional to the width of the peaks
        peak.to.x =
          (peak.width / (nextPeak.width + peak.width)) * (nextPeak.x - peak.x) +
          peak.x;
        nextPeak.from.x = peak.to.x;
      }
    }
  }

  for (const peak of peaks) {
    peak.width = peak.to.x - peak.from.x;
    if (peak.shape) {
      const { shape, width } = peak;
      if (shape.fwhm !== undefined) {
        const shapeFct = getShape1D(shape);
        peak.shape.fwhm = shapeFct.widthToFWHM(width);
      }
    }
  }

  return peaks;
}

function mapPeaks<T extends GSDPeakOptionalShape>(
  peaks: T[],
  factor: number,
): Array<WithIDOrShape<T>> {
  return peaks.map((peak) => {
    const { id, shape } = peak;
    const xFrom = peak.x - (peak.x - peak.inflectionPoints.from.x) * factor;
    const xTo = peak.x + (peak.inflectionPoints.to.x - peak.x) * factor;

    let result = {
      x: peak.x,
      y: peak.y,
      index: peak.index,
      width: xTo - xFrom,
      from: { x: xFrom },
      to: { x: xTo },
    } as GSDBroadenPeak;

    if (id) {
      result = { ...result, id } as GSDBroadenPeakWithID;
    }

    if (shape) {
      result = { ...result, shape } as T extends { id: string }
        ? GSDBroadenPeakWithShapeID
        : GSDBroadenPeakWithShape;
    }

    return result as WithIDOrShape<T>;
  });
}

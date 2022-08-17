import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

import { GSDBroadenPeak } from '../GSDBroadenPeak';
import { GSDPeak } from '../GSDPeak';
import { MakeOptional } from '../utils/MakeOptional';

type GSDPeakOptionalShape = MakeOptional<GSDPeak, 'shape'>;

type GSDBroadenPeakWithID = GSDBroadenPeak & { id: string };
type GSDBroadenPeakWithShape = GSDBroadenPeak & { shape: Shape1D };
type GSDBroadenPeakWithShapeID = GSDBroadenPeakWithID & { shape: Shape1D };

type WithIDOrShape<T extends GSDPeakOptionalShape> = T extends { id: string }
  ? WithIDnShapeOrNot<T>
  : WidthShapeOrNot<T>;

type WidthShapeOrNot<T extends GSDPeakOptionalShape> = T extends GSDPeak
  ? GSDBroadenPeakWithShape
  : GSDBroadenPeak;
type WithIDnShapeOrNot<T extends GSDPeakOptionalShape> = T extends GSDPeak
  ? GSDBroadenPeakWithShapeID
  : GSDBroadenPeakWithShape;
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
): WithIDOrShape<T>[] {
  const { factor = 2, overlap = false } = options;

  const peaks = peakList.map((peak) => {
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

    if (peak.id) {
      result.id = id;
    }

    if (peak.shape) {
      result.shape = shape;
    }

    return result;
  });

  if (!overlap) {
    for (let i = 0; i < peaks.length - 1; i++) {
      let peak = peaks[i];
      let nextPeak = peaks[i + 1];
      if (peak.to.x > nextPeak.from.x) {
        // we do it proportional to the width of the peaks
        peak.to.x = nextPeak.from.x =
          (peak.width / (nextPeak.width + peak.width)) * (nextPeak.x - peak.x) +
          peak.x;
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

  return peaks as WithIDOrShape<T>[];
}

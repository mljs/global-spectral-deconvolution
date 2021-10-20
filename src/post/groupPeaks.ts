import { Shape1D, ShapeKind } from "ml-peak-shape-generator";

/**
 * Group peaks based on factor and add group property in peaks
 * @param {array} peakList
 * @param {number} factor
 */
interface peakType {
  index?: number;
  x: number;
  y?: number;
  shape: shapeType,
  from?: number,
  to?: number
}
interface shapeType {
  kind?: ShapeKind;
  options?: Shape1D;
  height?: number;
  width: number;
  soft?: boolean;
  noiseLevel?: number;
}
export function groupPeaks(peakList:peakType[], factor = 1) {
  if (peakList.length === 0) return [];

  let peaks:peakType[] = JSON.parse(JSON.stringify(peakList));
  peaks.sort((a, b) => a.x - b.x);

  let previousPeak = ({ x: Number.NEGATIVE_INFINITY, shape: { width: 1 } } as peakType);
  let currentGroup = [previousPeak];
  let groups = [];
  for (let peak of peaks) {
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
  }

  return groups;
}

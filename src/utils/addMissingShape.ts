import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

const { parse, stringify } = JSON;
/**
 * add missing property if it does not exist in the peak,
 * if shape exists but fwhm doesn't, it will be calculated from peak.width
 */

export function addMissingShape<T extends { width: number }>(
  peaks: T[],
  options: { shape?: Shape1D; output?: T[] } = {},
): Array<T & { shape: Shape1D }> {
  const { shape = { kind: 'gaussian' }, output = parse(stringify(peaks)) } =
    options;
  const shapeInstance = getShape1D(shape);
  return output.map((peak) => {
    if (hasShape(peak)) {
      if (!('fwhm' in peak.shape)) {
        const shapeInstance = getShape1D(peak.shape);
        peak.shape.fwhm = shapeInstance.widthToFWHM(peak.width);
      }
      return peak;
    }
    return {
      ...peak,
      shape: { fwhm: shapeInstance.widthToFWHM(peak.width), ...shape },
    };
  });
}

function hasShape<T extends { width: number; shape?: Shape1D }>(
  peak,
): peak is T & { width: number; shape: Shape1D } {
  return 'shape' in peak;
}

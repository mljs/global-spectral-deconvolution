import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

const { parse, stringify } = JSON;

/**
 * Append 2 properties to the peaks, shape and fwhm
 */

export function setShape<T extends { width: number }>(
  peaks: T[],
  options: {
    /**
     * Shape to use to calculate FWHM
     * @default "{ kind: 'gaussian' }"
     */
    shape?: Shape1D;
    output?: T[];
  } = {},
): Array<T & { shape: Shape1D }> {
  const {
    shape = { kind: 'gaussian' },
    output = parse(stringify(peaks)) as T[],
  } = options;
  const shapeInstance = getShape1D(shape);
  return output.map((peak) => ({
    ...peak,
    shape: { fwhm: shapeInstance.widthToFWHM(peak.width), ...shape },
  }));
}

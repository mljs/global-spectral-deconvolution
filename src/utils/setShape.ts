import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

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
  } = {},
) {
  let { shape = { kind: 'gaussian' } } = options;
  let shapeInstance = getShape1D(shape);
  return peaks.map((peak) => ({
    ...peak,
    shape: { fwhm: shapeInstance.widthToFWHM(peak.width), ...shape },
  }));
}

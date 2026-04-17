import type { Shape1D } from 'ml-peak-shape-generator';
import { getShape1D } from 'ml-peak-shape-generator';

export interface SetShapeOptions<T> {
  /**
   * Shape to use to calculate FWHM.
   * @default { kind: 'gaussian' }
   */
  shape?: Shape1D;
  /**
   * Destination array.
   * @default structuredClone(peaks)
   */
  output?: T[];
}

/**
 * Append a `shape` property (including `fwhm`) to every peak.
 * @param peaks - Peaks with a `width` property.
 * @param options - Shape options.
 * @returns A peak list where every peak has a `shape` property.
 */
export function setShape<T extends { width: number }>(
  peaks: T[],
  options: SetShapeOptions<T> = {},
): Array<T & { shape: Shape1D }> {
  const { shape = { kind: 'gaussian' }, output = structuredClone(peaks) } =
    options;
  const shapeInstance = getShape1D(shape);
  return output.map((peak) => ({
    ...peak,
    shape: { fwhm: shapeInstance.widthToFWHM(peak.width), ...shape },
  }));
}

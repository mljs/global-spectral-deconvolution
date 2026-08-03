import type { Shape1DWithFWHM } from 'ml-peak-shape-generator';
import { getShape1D } from 'ml-peak-shape-generator';

export interface AddMissingShapeOptions<T> {
  /**
   * Shape used when a peak has none.
   * @default { kind: 'gaussian' }
   */
  shape?: Shape1DWithFWHM;
  /**
   * Destination array.
   * @default structuredClone(peaks)
   */
  output?: T[];
}

/**
 * Add a `shape` property to peaks that do not have one.
 * If a peak already has a `shape` but no `fwhm`, the FWHM is computed from `peak.width`.
 * @param peaks - Peaks with a `width` property.
 * @param options - Shape options.
 * @returns A peak list where every peak has a `shape` property.
 */
export function addMissingShape<T extends { width: number }>(
  peaks: T[],
  options: AddMissingShapeOptions<T> = {},
): Array<T & { shape: Shape1DWithFWHM }> {
  const { shape = { kind: 'gaussian' }, output = structuredClone(peaks) } =
    options;
  const defaultShapeInstance = getShape1D(shape);
  return output.map((peak) => {
    if (hasShape(peak)) {
      if (!('fwhm' in peak.shape)) {
        peak.shape.fwhm = getShape1D(peak.shape).widthToFWHM(peak.width);
      }
      return peak;
    }
    return {
      ...peak,
      shape: {
        fwhm: defaultShapeInstance.widthToFWHM(peak.width),
        ...shape,
      },
    };
  });
}

function hasShape<T extends { width: number; shape?: Shape1DWithFWHM }>(
  peak: T,
): peak is T & { width: number; shape: Shape1DWithFWHM } {
  return 'shape' in peak;
}

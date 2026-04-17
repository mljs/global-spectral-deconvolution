import type { NumberArray } from 'cheminfo-types';

export interface PeakData {
  /** Spectrum x values. */
  x: NumberArray;
  /** Spectrum y values. */
  y: NumberArray;
  /** Spectrum y values used to pick peak intensities (smoothed when `smoothY` is enabled). */
  yData: NumberArray;
  /** First derivative of `y`. */
  dY: NumberArray;
  /** Second derivative of `y`. */
  ddY: NumberArray;
  /** Minimum intensity a candidate peak must exceed. */
  yThreshold: number;
  /** Sign of the x step (positive for increasing x, negative otherwise). */
  dX: number;
}

import type { Shape1DWithFWHM } from 'ml-peak-shape-generator';

export interface GSDPeakOptimized {
  /**
   * Stable identifier assigned to the peak.
   * @default undefined
   */
  id?: string;
  /** x coordinate of the peak. */
  x: number;
  /** y coordinate (intensity) of the peak. */
  y: number;
  /** Width at the level of the inflection points. */
  width: number;
  /** Fitted shape (including `fwhm`). */
  shape: Shape1DWithFWHM;
}

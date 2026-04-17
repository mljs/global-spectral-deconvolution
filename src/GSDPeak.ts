export interface GSDPeak {
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
  /** Index of the peak in the spectrum's `x` and `y` arrays. */
  index: number;
  /**
   * Second derivative at the level of the peak.
   * Used to decide whether a peak is soft/broad.
   */
  ddY: number;
  /** Inflection points (left and right) bounding the peak. */
  inflectionPoints: {
    from: { x: number; index: number };
    to: { x: number; index: number };
  };
}

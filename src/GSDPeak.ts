export interface GSDPeak {
  id?: string;
  x: number;
  y: number;
  /**
   * Width at the level of the inflection points
   */
  width: number;
  /**
   * index in the 'x' and 'y' array of the peak
   */
  index: number;
  /**
   * second derivative at the level of the peak
   * This allows to determine if a peak is soft or not
   */
  ddY: number;

  inflectionPoints: {
    from: { x: number; index: number };
    to: { x: number; index: number };
  };
}

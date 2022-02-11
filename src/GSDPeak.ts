export interface GSDPeak {
  x: number;
  y: number;
  /**
   * Width at the level of the inflection points
   */
  width: number;
  index: number;
  inflectionPoints: {
    from: { x: number; index: number };
    to: { x: number; index: number };
  };
}

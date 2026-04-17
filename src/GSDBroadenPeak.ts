import type { Shape1D } from 'ml-peak-shape-generator';

export interface GSDBroadenPeak {
  /**
   * Stable identifier propagated from the source peak.
   * @default undefined
   */
  id?: string;
  /** x coordinate of the peak. */
  x: number;
  /** y coordinate (intensity) of the peak. */
  y: number;
  /** Broadened width (`to.x - from.x`). */
  width: number;
  /**
   * Shape propagated from the source peak.
   * @default undefined
   */
  shape?: Shape1D;
  /** Index of the peak in the source spectrum. */
  index: number;
  /** Left edge of the broadened peak. */
  from: { x: number };
  /** Right edge of the broadened peak. */
  to: { x: number };
}

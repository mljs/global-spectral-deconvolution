import { Shape1D } from 'ml-peak-shape-generator';

export interface GSDPeakShape {
  x: number;
  y: number;
  width: number;
  fwhm?: number;
  shape?: Shape1D;
}

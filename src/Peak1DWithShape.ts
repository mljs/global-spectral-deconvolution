import { Shape1D } from 'ml-peak-shape-generator';

export interface Peak1DWithShape {
  x: number;
  y: number;
  width: number;
  fwhm?: number;
  shape?: Shape1D;
}

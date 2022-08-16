import { Shape1D } from 'ml-peak-shape-generator';

export interface GSDPeakOptimized {
  id?: string;
  x: number;
  y: number;
  width: number;
  shape: Shape1D;
}

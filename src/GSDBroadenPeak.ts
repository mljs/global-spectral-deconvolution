import { Shape1D } from 'ml-peak-shape-generator';

export interface GSDBroadenPeak {
  id?: string;
  x: number;
  y: number;
  width: number;
  shape?: Shape1D;
  index: number;
  from: { x: number };
  to: { x: number };
}

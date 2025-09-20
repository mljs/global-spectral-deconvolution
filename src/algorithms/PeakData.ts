import type { NumberArray } from 'cheminfo-types';

export interface PeakData {
  x: NumberArray;
  yData: NumberArray;
  dY: NumberArray;
  ddY: NumberArray;
  yThreshold: number;
  dX: number;
}

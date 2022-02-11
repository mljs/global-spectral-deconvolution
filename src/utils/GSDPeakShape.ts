import { Shape1D } from 'ml-peak-shape-generator';

import { GSDPeak } from '../GSDPeak';

export interface GSDPeakShape extends GSDPeak {
  fwhm: number;
  shape: Shape1D;
}

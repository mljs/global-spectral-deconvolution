import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

import { GSDPeak } from '../GSDPeak';
import { GSDPeakShape } from '../GSDPeakShape';

/**
 * Global spectra deconvolution
 * @param {object} [options={}] - Options object
 * @param {object} [options.shape={}] - Object that specified the kind of shape to calculate the FWHM instead of width between inflection points. see https://mljs.github.io/peak-shape-generator/#inflectionpointswidthtofwhm
 * @param {string} [options.shape.kind='gaussian']
 */

export function appendFWHM(
  peaks: GSDPeak[],
  options: {
    /**
     * Shape to use to calculate FWHM
     * @default "{ kind: 'gaussian' }"
     */
    shape?: Shape1D;
  } = {},
): GSDPeakShape[] {
  let { shape = { kind: 'gaussian' } } = options;
  let widthToFWHM = getShape1D(shape).widthToFWHM;
  let newPeaks: GSDPeakShape[] = [];
  for (const peak of peaks) {
    newPeaks.push({ ...peak, fwhm: widthToFWHM(peak.width), shape });
  }
  return newPeaks;
}

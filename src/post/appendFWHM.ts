import { getShape1D, Shape1D } from 'ml-peak-shape-generator';

import { Peak1D } from '../Peak1D';
import { Peak1DWithShape } from '../Peak1DWithShape';

/**
 * Global spectra deconvolution
 * @param {object} [options={}] - Options object
 * @param {object} [options.shape={}] - Object that specified the kind of shape to calculate the FWHM instead of width between inflection points. see https://mljs.github.io/peak-shape-generator/#inflectionpointswidthtofwhm
 * @param {string} [options.shape.kind='gaussian']
 */

export function appendFWHM(
  peaks: Peak1D[],
  options: {
    /**
     * Shape to use to calculate FWHM
     * @default "{ kind: 'gaussian' }"
     */
    shape?: Shape1D;
  } = {},
): Peak1DWithShape[] {
  let { shape = { kind: 'gaussian' } } = options;
  let widthToFWHM = getShape1D(shape).widthToFWHM;
  let newPeaks: Peak1DWithShape[] = [];
  for (const peak of peaks) {
    newPeaks.push({ ...peak, fwhm: widthToFWHM(peak.width), shape });
  }
  return newPeaks;
}

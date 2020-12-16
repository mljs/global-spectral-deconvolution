import { readFileSync } from 'fs';
import { join } from 'path';
import { generateSpectrum } from 'spectrum-generator';

let { gsd, joinBroadPeaks } = require('..');

describe('Global spectra deconvolution simulated broad spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should give 1 broad peak and 1 smaller peak', () => {
    const spectrum = generateSpectrum([
      [530, 0.03, 120],
      [140, 0.0025, 90],
    ]);
    let result = gsd(spectrum, {
      sgOptions: {
        windowSize: 7,
        polynomial: 3,
      },
    });
    joinBroadPeaks(result, { width: 20, shape: { kind: 'gaussian' } });

    expect(result).toHaveLength(2);

    result.forEach((peak) => {
      if (Math.abs(peak.x - 531) < 20) {
        expect(peak.width).toBeGreaterThanOrEqual(90);
        expect(peak.width).toBeLessThan(150);
      }
    });
    result.forEach((peak) => {
      if (Math.abs(peak.x - 140) < 20) {
        expect(peak.width).toBeGreaterThanOrEqual(70);
        expect(peak.width).toBeLessThan(110);
      }
    });
  });
});

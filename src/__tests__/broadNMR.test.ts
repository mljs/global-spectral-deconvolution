import { readFileSync } from 'fs';
import { join } from 'path';

import { gsd, joinBroadPeaks } from '..';

describe('Global spectra deconvolution NMR spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should give 1 broad peak and around 14 other peaks', () => {
    let spectrum = JSON.parse(
      readFileSync(join(__dirname, '/data/broadNMR.json'), 'utf-8'),
    );
    let result = gsd(
      { x: spectrum[0], y: spectrum[1] },
      {
        noiseLevel: 1049200.537996172 / 2,
        minMaxRatio: 0.01,
        broadRatio: 0.0025,
        sgOptions: {
          windowSize: 9,
          polynomial: 3,
        },
      },
    );
    const newResult = joinBroadPeaks(result, {
      width: 0.25,
      shape: { kind: 'lorentzian', width: 0 },
    });
    expect(newResult).toHaveLength(14);
    newResult.forEach((peak) => {
      if (Math.abs(peak.x - 4.31) < 0.01) {
        expect(peak.shape.width).toBeCloseTo(0.39, 2);
      }
    });
  });
});

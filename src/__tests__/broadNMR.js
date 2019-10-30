'use strict';

let fs = require('fs');

let peakPicking = require('..');

describe('Global spectra deconvolution NMR spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should give 1 broad peak and around 14 other peaks', () => {
    let spectrum = JSON.parse(
      fs.readFileSync(`${__dirname}/data/broadNMR.json`, 'utf-8'),
    );
    let result = peakPicking.gsd(spectrum[0], spectrum[1], {
      noiseLevel: 1049200.537996172 / 2,
      minMaxRatio: 0.01,
      broadRatio: 0.0025,
      sgOptions: {
        windowSize: 9,
        polynomial: 3,
      },
    });
    peakPicking.post.joinBroadPeaks(result, { width: 0.25 });
    expect(result).toHaveLength(14);
    result.forEach((peak) => {
      if (Math.abs(peak.x - 4.31) < 0.01) {
        expect(peak.width).toBeCloseTo(0.39, 2);
      }
    });
  });
});

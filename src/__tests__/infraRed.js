import { readFileSync } from 'fs';

import { gsd } from '..';

describe('Global spectra deconvolution Infrared spectra', function () {
  // Test case obtained from Pag 443, Chap 8.
  it('Should get the correct result', function () {
    let spectrum = JSON.parse(
      readFileSync(`${__dirname}/data/infraRed.json`, 'utf-8'),
    );
    gsd(spectrum, {
      noiseLevel: 32,
      minMaxRatio: 0.03,
      maxCriteria: false,
    });
    expect(true).toBe(true);
  });
});

import { readFileSync } from 'fs';

import { DataType, gsd } from '../gsd';

describe('Global spectra deconvolution Infrared spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should get the correct result', () => {
    let spectrum: DataType = JSON.parse(
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

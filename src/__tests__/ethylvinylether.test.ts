import { readFileSync } from 'fs';

import { gsd } from '../gsd';

describe('Global spectra deconvolution NMR spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Ethylvinylether should have 21 peaks', () => {
    let spectrum: number[][] = JSON.parse(
      readFileSync(`${__dirname}/data/ethylvinylether.json`, 'utf-8'),
    );
    let result = gsd(
      { x: spectrum[0].reverse(), y: spectrum[1].reverse() },
      {
        minMaxRatio: 0.03,
        smoothY: false,
        realTopDetection: true,
        sgOptions: { windowSize: 5, polynomial: 3 },
      },
    );
    expect(result).toHaveLength(21);
  });
});

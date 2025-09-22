import { readFileSync } from 'fs';

import { describe, expect, it } from 'vitest';

import { gsd } from '../gsd.ts';

describe('Global spectra deconvolution NMR spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should have 5 peaks', () => {
    const spectrum: { x: number[]; y: number[] } = JSON.parse(
      readFileSync(`${__dirname}/data/broadNotLorentzianShape.json`, 'utf-8'),
    );
    const sgOptions = { windowSize: 7, polynomial: 3 };
    const peaks = gsd(
      { x: spectrum.x, y: spectrum.y },
      {
        minMaxRatio: 0.05,
        noiseLevel: 1500,
        smoothY: false,
        realTopDetection: false,
        maxCriteria: true,
        sgOptions,
      },
    );

    expect(peaks).toHaveLength(3);
    expect(peaks).toMatchObject([
      {
        x: 7.49587013996984,
        y: 89560.7890625,
        width: 0.006723240417656484,
      },
      {
        x: 7.514817453874146,
        y: 203634.84912109375,
        width: 0.007028842254822365,
      },
      {
        x: 7.534375971452784,
        y: 118908.73388671875,
        width: 0.007028842254822365,
      },
    ]);
  });
});

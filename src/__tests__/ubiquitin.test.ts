import { readFileSync } from 'fs';

import type { DataXY } from 'cheminfo-types';
import { parseXY } from 'xy-parser';

import { gsd } from '../gsd';

// var gsd = require("../src/index");
// var optimizePeaks = require("../src/optimize");

describe('Global spectra deconvolution ubiquitin', () => {
  it('HR mass spectra', () => {
    let spectrum = parseXY(
      readFileSync(`${__dirname}/data/ubiquitin.txt`, 'utf-8'),
      { keepInfo: false }
    ) as DataXY;

    let noiseLevel = 0; // Stat.array.max(spectrum[1])*0.015;

    let result = gsd(spectrum, {
      noiseLevel: noiseLevel,
      minMaxRatio: 0.0,
      smoothY: false,
      realTopDetection: true,
      sgOptions: { windowSize: 7, polynomial: 3 },
    });

    expect(result).toHaveLength(6198);
  });
});

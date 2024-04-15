import { readFileSync } from 'fs';

import { describe, expect, it } from 'vitest';
import { parseXY } from 'xy-parser';

import { gsd } from '../gsd';

// var gsd = require("../src/index");
// var optimizePeaks = require("../src/optimize");

describe('Global spectra deconvolution ubiquitin', () => {
  it('HR mass spectra', () => {
    const spectrum = parseXY(
      readFileSync(`${__dirname}/data/ubiquitin.txt`, 'utf-8'),
    );

    const peaks = gsd(spectrum, {
      minMaxRatio: 0.0,
      smoothY: false,
      realTopDetection: true,
      sgOptions: { windowSize: 7, polynomial: 3 },
    });

    expect(peaks[0]).toBeDeepCloseTo({
      id: peaks[0].id,
      x: 200.05527917306466,
      y: 28.795378784444413,
      ddY: -15468134.039875854,
      width: 0.002420000000000755,
      index: 11,
      inflectionPoints: {
        from: { x: 200.054133, index: 9 },
        to: { x: 200.056553, index: 13 },
      },
    });
    expect(peaks).toHaveLength(6198);
  });
});

/**
 * Created by acastillo on 2/2/16.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { gsd, joinBroadPeaks } from '..';

describe('Global spectra deconvolution NMR spectra', () => {
  it('Should give 120 peaks', () => {
    let spectrum: number[][] = JSON.parse(
      readFileSync(join(__dirname, '/data/bigLowS2NSpectrum.json'), 'utf8'),
    );

    let pp = gsd(
      { x: spectrum[0], y: spectrum[1] },
      {
        noiseLevel: 57000.21889405926, // 1049200.537996172/2,
        minMaxRatio: 0.01,
        broadRatio: 0.0025,
        sgOptions: { windowSize: 13, polynomial: 3 },
      },
    );
    pp = joinBroadPeaks(pp, { width: 0.25 });

    expect(pp).toHaveLength(91);
  });
});

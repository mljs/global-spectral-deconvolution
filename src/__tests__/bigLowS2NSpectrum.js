/**
 * Created by acastillo on 2/2/16.
 */
'use strict';

let fs = require('fs');

let peakPicking = require('..');

describe('Global spectra deconvolution NMR spectra', () => {
  it('Should give 120 peaks', () => {
    let spectrum = JSON.parse(
      fs.readFileSync(`${__dirname}/data/bigLowS2NSpectrum.json`, 'utf-8'),
    );

    let pp = peakPicking.gsd(spectrum[0], spectrum[1], {
      noiseLevel: 57000.21889405926, // 1049200.537996172/2,
      minMaxRatio: 0.01,
      broadRatio: 0.0025,
      sgOptions: { windowSize: 13, polynomial: 3 },
    });

    peakPicking.post.joinBroadPeaks(pp, { width: 0.25 });

    expect(pp).toHaveLength(91);
  });
});

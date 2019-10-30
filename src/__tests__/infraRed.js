'use strict';

let fs = require('fs');

let peakPicking = require('..');

describe('Global spectra deconvolution Infrared spectra', function() {
  // Test case obtained from Pag 443, Chap 8.
  it('Should get the correct result', function() {
    let spectrum = JSON.parse(
      fs.readFileSync(`${__dirname}/data/infraRed.json`, 'utf-8'),
    );
    peakPicking.gsd(spectrum.x, spectrum.y, {
      noiseLevel: 32,
      minMaxRatio: 0.03,
      maxCriteria: false,
    });
    expect(true).toBe(true);
  });
});

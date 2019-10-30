'use strict';

const gsd = require('..').gsd;

const { SpectrumGenerator } = require('spectrum-generator');

describe('Global spectra deconvolution with simulated spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should provide the right result ...', () => {
    const sg = new SpectrumGenerator({ start: 0, end: 100, pointsPerUnit: 10 });

    sg.addPeak([20, 100], { width: 5 });
    sg.addPeak([50, 50], { width: 5 });
    sg.addPeak([70, 20], { width: 5 });

    let spectrum = sg.getSpectrum();

    let result = gsd(spectrum.x, spectrum.y, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
    });

    expect(result[0]).toMatchObject({ x: 20, y: 100 });
    expect(result[1]).toMatchObject({ x: 50, y: 50 });
    expect(result[2]).toMatchObject({ x: 70, y: 20 });
  });
});

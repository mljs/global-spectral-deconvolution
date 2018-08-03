'use strict';

var fs = require('fs');

const gsd = require('..').gsd;

function lorentzian(x, x0 = 0, gamma = 1) {
  return (
    (gamma * gamma) / (Math.PI * gamma * (gamma * gamma + (x - x0) * (x - x0)))
  );
}

describe('Global spectra deconvolution simple simulated spectrum', () => {
  // Test case obtained from Pag 443, Chap 8.
  test('Should provide the right result ...', () => {
    var spectrum = JSON.parse(
      fs.readFileSync(`${__dirname}/data//C2.json`, 'utf-8')
    );
    var result = gsd(spectrum[0], spectrum[1], {
      // noiseLevel: 0.001,
      minMaxRatio: 0,
      realTopDetection: true,
      smoothY: false
    });

    expect(result[0].x).toBeCloseTo(24, 2);
    expect(result[0].y).toBeCloseTo(0.09394372786996513, 5);

    expect(result[1].x).toBeCloseTo(25, 2);
    expect(result[1].y).toBeCloseTo(0.0020321396708958394, 5);
  });

  test('Should give 10 peaks', () => {
    const size = 300;
    const fourth = size / 11;
    var times = new Array(size);
    var tic = new Array(size);

    for (var i = 0; i < size; ++i) {
      times[i] = i;
      tic[i] =
        lorentzian(i, fourth) +
        2 * lorentzian(i, 2 * fourth) +
        lorentzian(i, 3 * fourth) +
        2 * lorentzian(i, 4 * fourth) +
        lorentzian(i, 5 * fourth) +
        2 * lorentzian(i, 6 * fourth) +
        lorentzian(i, 7 * fourth) +
        2 * lorentzian(i, 8 * fourth) +
        lorentzian(i, 9 * fourth) +
        2 * lorentzian(i, 10 * fourth);
    }
    var ans = gsd(times, tic, {
      noiseLevel: 0,
      realTopDetection: false,
      smoothY: false,
      sgOptions: { windowSize: 5, polynomial: 3 }
    });

    expect(ans).toHaveLength(10);
  });
});

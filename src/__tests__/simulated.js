import { gsd, optimizePeaks } from '..';

const { generateSpectrum } = require('spectrum-generator');

describe('Global spectra deconvolution with simulated spectra', () => {
  // Test case obtained from Pag 443, Chap 8.
  it('Should provide the right result ...', () => {
    const peaks = [
      { x: 0.1, y: 0.2, width: 0.1 },
      { x: -0.1, y: 0.2, width: 0.3 },
    ];

    const data = generateSpectrum(peaks, { from: -1, to: 1, nbPoints: 101 });
    data.y.reverse();
    data.x.reverse();
    let peakList = gsd(data, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
      heightFactor: 1,
    });

    let optPeaks = optimizePeaks(data, peakList);

    expect(optPeaks[0].x).toBeCloseTo(-0.1, 2);
    expect(optPeaks[0].y).toBeCloseTo(0.2, 2);
    expect(optPeaks[0].width).toBeCloseTo(0.3, 2);
    expect(optPeaks[1].x).toBeCloseTo(0.1, 2);
    expect(optPeaks[1].y).toBeCloseTo(0.2, 2);
    expect(optPeaks[1].width).toBeCloseTo(0.1, 2);
  });
  it('Overlaped peaks', () => {
    const peaks = [
      { x: 0.1, y: 0.4, width: 0.0 },
      { x: 0.101, y: 0.5, width: 0.01 },
      { x: 0.15, y: 0.4, width: 0.01 },
      { x: 0.151, y: 0.3, width: 0.03 },
    ];

    const data = generateSpectrum(peaks, { from: 0, to: 1, nbPoints: 101 });

    let optPeaks = optimizePeaks(data, peaks, {
      factorWidth: 1,
      optimization: { kind: 'lm', options: { maxIterations: 300 } },
    });
    expect(optPeaks[0].x).toBeCloseTo(0.15, 2);
    expect(optPeaks[0].y).toBeCloseTo(0.4, 2);
    expect(optPeaks[0].width).toBeCloseTo(0.01, 2);
  });
});

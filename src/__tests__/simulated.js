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
    let peakList = gsd(data, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
      heightFactor: 1,
    });

    let optimizedPeaks = optimizePeaks(data, peakList);
    expect(optimizedPeaks[0].x).toBeCloseTo(-0.1, 2);
    expect(optimizedPeaks[0].y).toBeCloseTo(0.2, 2);
    expect(optimizedPeaks[0].width).toBeCloseTo(0.3, 2);
    expect(optimizedPeaks[0].group).toBe(0);
    expect(optimizedPeaks[1].x).toBeCloseTo(0.1, 2);
    expect(optimizedPeaks[1].y).toBeCloseTo(0.2, 2);
    expect(optimizedPeaks[1].width).toBeCloseTo(0.1, 2);
    expect(optimizedPeaks[1].group).toBe(1);
  });

  it.only('Overlaped peaks', () => {
    const peaks = [
      { x: 0.1, y: 0.4, width: 0.0 },
      { x: 0.101, y: 0.5, width: 0.01 },
      { x: 0.15, y: 0.4, width: 0.01 },
      { x: 0.151, y: 0.3, width: 0.03 },
    ];

    const data = generateSpectrum(peaks, { from: 0, to: 1, nbPoints: 101 });

    let optimizedPeaks = optimizePeaks(data, peaks, {
      factorWidth: 1,
      optimization: { kind: 'lm', options: { maxIterations: 300 } },
    });

    expect(optimizedPeaks).toHaveLength(4);
    expect(optimizedPeaks[0].group).toBe(0);
    expect(optimizedPeaks[1].group).toBe(0);
    expect(optimizedPeaks[2].group).toBe(1);
    expect(optimizedPeaks[3].group).toBe(1);

    expect(optimizedPeaks[0].x).toBeCloseTo(0.15, 2);
    expect(optimizedPeaks[0].y).toBeCloseTo(0.4, 2);
    expect(optimizedPeaks[0].width).toBeCloseTo(0.01, 2);
  });
});

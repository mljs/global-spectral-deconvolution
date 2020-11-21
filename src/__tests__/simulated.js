import { gsd, optimizePeaks } from '..';

const { generateSpectrum } = require('spectrum-generator');

describe('Global spectra deconvolution with simulated spectra', () => {
  it('Should provide the right result ...', () => {
    const peaks = [
      { x: -0.1, y: 0.2, width: 0.3 },
      { x: 0.1, y: 0.2, width: 0.1 },
    ];

    const data = generateSpectrum(peaks, { from: -1, to: 1, nbPoints: 101 });

    let peakList = gsd(data, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
      heightFactor: 1,
      shape: { kind: 'gaussian' },
    });

    expect(peakList[0].x).toBeCloseTo(-0.1, 2);
    expect(peakList[0].y).toBeCloseTo(0.2, 2);
    expect(peakList[0].width).toBeCloseTo(0.3, 2);
    expect(peakList[1].x).toBeCloseTo(0.1, 2);
    expect(peakList[1].y).toBeCloseTo(0.2, 2);
    expect(peakList[1].width).toBeCloseTo(0.1, 2);

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

  it('Should provide 1 peak', () => {
    const peaks = [{ x: 0.1, y: 0.2, width: 0.12 }];

    const data = generateSpectrum(peaks, {
      from: -0.5,
      to: 0.5,
      nbPoints: 10001,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 10000,
        },
      },
    });

    let peakList = gsd(data, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
      heightFactor: 1,
      shape: { kind: 'gaussian' },
    });

    expect(peakList).toHaveLength(1);
    expect(peakList[0].x).toBeCloseTo(-0.1, 2);
    expect(peakList[0].y).toBeCloseTo(0.2, 2);
    expect(peakList[0].width).toBeCloseTo(0.3, 2);
  });
});

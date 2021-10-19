import { Shape1D, ShapeKind } from 'ml-peak-shape-generator';

import { gsd, optimizePeaks } from '..';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateSpectrum } = require('spectrum-generator');

interface shapeType {
  kind?: ShapeKind;
  options?: Shape1D;
  height?: number;
  width?: number;
  soft?: boolean;
  noiseLevel?: number;
}
describe('Global spectra deconvolution with simulated spectra', () => {
  it('Overlapping peaks', () => {
    const peaks = [
      { x: -0.1, y: 0.2, width: 0.03 },
      { x: 0.1, y: 0.2, width: 0.01 },
    ];

    const data = generateSpectrum(peaks, {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 1001,
      },
      peaks: {
        factor: 6,
      },
    });

    let peakList = gsd(data, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
      heightFactor: 1,
      shape: { kind: 'gaussian' },
    });

    let optimizedPeaks = optimizePeaks(data, peakList);

    expect(peakList[0].x).toBeCloseTo(-0.1, 2);
    expect(peakList[0].y).toBeCloseTo(0.2, 2);
    expect((peakList[0].shape as shapeType).width).toBeCloseTo(0.03, 2);
    expect(peakList[1].x).toBeCloseTo(0.1, 2);
    expect(peakList[1].y).toBeCloseTo(0.2, 2);
    expect((peakList[1].shape as shapeType).width).toBeCloseTo(0.01, 2);


    expect(optimizedPeaks[0].x).toBeCloseTo(-0.1, 2);
    expect(optimizedPeaks[0].y).toBeCloseTo(0.2, 2);
    expect((optimizedPeaks[0].shape as shapeType).width).toBeCloseTo(0.03, 2);
    expect(optimizedPeaks[1].x).toBeCloseTo(0.1, 2);
    expect(optimizedPeaks[1].y).toBeCloseTo(0.2, 2);
    expect((optimizedPeaks[1].shape as shapeType).width).toBeCloseTo(0.01, 2);
  });

  it('Check gaussian shapes with shape specification', () => {
    const peaks = [
      { x: -0.5, y: 1, width: 0.2 },
      { x: 0.5, y: 1, width: 0.1 },
    ];

    const data = generateSpectrum(peaks, {
      generator: { from: -1, to: 1, nbPoints: 10001 },
    });

    let peakList = gsd(data, {
      minMaxRatio: 0,
      realTopDetection: false,
      smoothY: false,
      heightFactor: 1,
      shape: { kind: 'gaussian' },
    });

    expect(peakList[0].x).toBeCloseTo(-0.5, 2);
    expect(peakList[0].y).toBeCloseTo(1, 2);
    expect((peakList[0].shape as shapeType).width).toBeCloseTo(0.2, 2); // inflection points in gaussian are higher tha FWHM
    expect(peakList[1].x).toBeCloseTo(0.5, 2);
    expect(peakList[1].y).toBeCloseTo(1, 2);
    expect((peakList[1].shape as shapeType).width).toBeCloseTo(0.1, 2);

    let optimizedPeaks = optimizePeaks(data, peakList);

    expect(optimizedPeaks[0].x).toBeCloseTo(-0.5, 2);
    expect(optimizedPeaks[0].y).toBeCloseTo(1, 2);
    expect((optimizedPeaks[0].shape as shapeType).width).toBeCloseTo(0.2, 2); // optimization by default expect a gaussian shape
    expect(optimizedPeaks[1].x).toBeCloseTo(0.5, 2);
    expect(optimizedPeaks[1].y).toBeCloseTo(1, 2);
    expect((optimizedPeaks[1].shape as shapeType).width).toBeCloseTo(0.1, 2);
  });

  it('Should provide 1 peak', () => {
    const peaks = [{ x: 0, y: 1, width: 0.12 }];

    const data = generateSpectrum(peaks, {
      generator: {
        from: -0.5,
        to: 0.5,
        nbPoints: 10001,
        shape: {
          kind: 'gaussian',
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
    expect(peakList[0].x).toBeCloseTo(0, 2);
    expect(peakList[0].y).toBeCloseTo(1, 2);
    expect((peakList[0].shape as shapeType).width).toBeCloseTo(0.12, 3);
  });
});

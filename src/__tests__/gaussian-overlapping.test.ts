import type { DataXY } from 'cheminfo-types';
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { gsd } from '../gsd';
import { optimizePeaks } from '../post/optimizePeaks';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateSpectrum } = require('spectrum-generator');

describe('gaussian overlapping', () => {
  it.only('2 peaks detected', () => {
    const expectedPeaks = [
      { x: -0.1, y: 1, width: 0.1 },
      { x: 0.1, y: 1, width: 0.1 },
    ];

    const data: DataXY = generateSpectrum(expectedPeaks, {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 1001,
      },
      peaks: {
        factor: 6, // need a high factor so that we don't detect the end of the simulated peak
      },
    });

    let peaks = gsd(data, {});
    expect(peaks).toBeDeepCloseTo([
      {
        x: -0.1,
        y: 1.0003354626279024,
        width: 0.096,
        index: 450,
      },
      {
        x: 0.1,
        y: 1.0003354626279024,
        width: 0.096,
        index: 550,
      },
    ]);

    let optimizedPeaks = optimizePeaks(data, peaks);
    console.log(optimizedPeaks);
  });

  it('one peak detected', () => {
    const peaks = [
      { x: -0.1, y: 1, width: 0.2 },
      { x: 0.1, y: 1, width: 0.2 },
    ];

    const data: DataXY = generateSpectrum(peaks, {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 1001,
      },
      peaks: {
        factor: 6,
      },
    });

    let peakList = gsd(data, {});

    expect(peakList).toBeDeepCloseTo([
      {
        x: -0.11,
        y: 1.0985206138453019,
        width: 0.384,
        index: 444,
      },
    ]);
  });
});

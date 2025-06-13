import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it } from 'vitest';

import { gsd } from '../gsd.ts';
import { optimizePeaks } from '../post/optimizePeaks.ts';

describe('gaussian overlapping', () => {
  it('2 peaks detected', () => {
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
      peakOptions: {
        factor: 6, // need a high factor so that we don't detect the end of the simulated peak
      },
    });

    const peaks = gsd(data, {});
    expect(peaks).toMatchCloseTo([
      {
        x: -0.1,
        y: 1,
        width: 0.096,
        index: 450,
      },
      {
        x: 0.1,
        y: 1,
        width: 0.096,
        index: 550,
      },
    ]);

    const optimizedPeaks = optimizePeaks(data, peaks, { groupingFactor: 3 });
    expect(optimizedPeaks).toMatchCloseTo([
      {
        x: -0.1,
        y: 1,
        width: 0.1,
      },
      {
        x: 0.1,
        y: 1,
        width: 0.1,
      },
    ]);
  });
});

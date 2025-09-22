import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it } from 'vitest';

import { gsd } from '../gsd.ts';

describe('gaussian overlapping', () => {
  const expectedPeaks = [
    { x: 0.1, y: 0.3, width: 0.05 },
    { x: -0.1, y: 0.3, width: 0.05 },
    { x: 0, y: 1, width: 0.1 },
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

  it('1 peak should detected by first derivative algorithm', () => {
    const peaks = gsd(data, { peakDetectionAlgorithm: 'first' });
    expect(peaks).toHaveLength(1);
    expect(peaks[0].x).toBeCloseTo(0);
    expect(peaks[0].y).toBeCloseTo(1);
  });
  it('3 peak should detected by auto algorithm', () => {
    const peaks = gsd(data, { peakDetectionAlgorithm: 'auto' });
    expect(peaks).toHaveLength(3);
    expect(peaks[1].x).toBeCloseTo(0);
    expect(peaks[1].y).toBeCloseTo(1);
  });
});

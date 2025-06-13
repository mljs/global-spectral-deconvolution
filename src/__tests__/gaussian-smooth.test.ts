import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it } from 'vitest';

import { gsd } from '../gsd.ts';

describe('gaussian simulated peaks', () => {
  it('smooth:true', () => {
    // when smoothY we should take care that the peak is still as the same position but the height will be reduced
    // we have here a low resolution spectrum so the impact is big
    const peaks = [
      { x: -0.5, y: 1, width: 0.05 },
      { x: 0.5, y: 1, width: 0.05 },
    ];

    const data: DataXY = generateSpectrum(peaks, {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 101,
      },
      peakOptions: {
        factor: 6,
      },
    });

    const peakList = gsd(data, {
      smoothY: true,
    });
    expect(peakList).toBeDeepCloseTo([
      {
        id: peakList[0].id,
        x: -0.5,
        y: 0.6945098953985852,
        ddY: -259.83290100626783,
        width: 0.08,
        index: 25,
        inflectionPoints: {
          from: { x: -0.54, index: 23 },
          to: { x: -0.46, index: 27 },
        },
      },
      {
        id: peakList[1].id,
        x: 0.5,
        y: 0.6945098953985852,
        ddY: -259.83290100626783,
        width: 0.08,
        index: 75,
        inflectionPoints: {
          from: { x: 0.46, index: 73 },
          to: { x: 0.54, index: 77 },
        },
      },
    ]);
  });

  // if we optimize this peak however we should find back the original data
});

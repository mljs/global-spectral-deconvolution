import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it } from 'vitest';

import type { GSDPeak } from '../GSDPeak.js';
import { gsd } from '../gsd.ts';
import type { GSDPeakID } from '../gsd.ts';

describe('smooth:false option', () => {
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

  // when smoothY we should take care that the peak is still as the same position but the height will be reduced
  // we have here a low resolution spectrum so the impact is big

  it('positive maxima peaks', () => {
    const peakList = gsd(data);

    const expected: GSDPeak[] = [
      {
        x: -0.5,
        y: 1,
        ddY: -259.83290100626783,
        width: 0.08,
        index: 25,
        inflectionPoints: {
          from: { index: 23, x: -0.54 },
          to: { index: 27, x: -0.46 },
        },
      },
      {
        x: 0.5,
        y: 1,
        ddY: -259.83290100626783,
        width: 0.08,
        index: 75,
        inflectionPoints: {
          from: { index: 73, x: 0.46 },
          to: { index: 77, x: 0.54 },
        },
      },
    ];
    expect(peakList).toBeDeepCloseTo(addMissingID(peakList, expected) as never);
  });

  it('negative maxima peaks', () => {
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => value - 2) },
      {},
    );

    const expected: GSDPeak[] = [
      {
        x: -0.5,
        y: -1,
        ddY: -259.83290100626783,
        width: 0.08,
        index: 25,
        inflectionPoints: {
          from: { index: 23, x: -0.54 },
          to: { index: 27, x: -0.46 },
        },
      },
      {
        x: 0.5,
        y: -1,
        ddY: -259.83290100626783,
        width: 0.08,
        index: 75,
        inflectionPoints: {
          from: { index: 73, x: 0.46 },
          to: { index: 77, x: 0.54 },
        },
      },
    ];
    expect(peakList).toBeDeepCloseTo(addMissingID(peakList, expected) as never);
  });

  it('Negative peaks', () => {
    // we check negative peaks
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: false },
    );
    const expected = [
      {
        x: -0.5,
        y: -1,
        ddY: 259.83290100626783,
        width: 0.08,
        index: 25,
        inflectionPoints: {
          from: { index: 23, x: -0.54 },
          to: { index: 27, x: -0.46 },
        },
      },
      {
        x: 0.5,
        y: -1,
        ddY: 259.83290100626783,
        width: 0.08,
        index: 75,
        inflectionPoints: {
          from: { index: 73, x: 0.46 },
          to: { index: 77, x: 0.54 },
        },
      },
    ];

    expect(peakList).toBeDeepCloseTo(addMissingID(peakList, expected) as never);
  });

  it('minima peaks', () => {
    // we check negative peaks
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => 1 - value) },
      { maxCriteria: false },
    );
    const expected = [
      {
        x: -0.5,
        y: 0,
        ddY: 259.83290100626783,
        width: 0.08,
        index: 25,
        inflectionPoints: {
          from: { index: 23, x: -0.54 },
          to: { index: 27, x: -0.46 },
        },
      },
      {
        x: 0.5,
        y: 0,
        ddY: 259.83290100626783,
        width: 0.08,
        index: 75,
        inflectionPoints: {
          from: { index: 73, x: 0.46 },
          to: { index: 77, x: 0.54 },
        },
      },
    ];

    expect(peakList).toBeDeepCloseTo(addMissingID(peakList, expected) as never);
  });

  it('negative peaks with maxCriteria true', () => {
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: true },
    );
    expect(peakList).toHaveLength(0);
  });
});

function addMissingID(peaks: GSDPeakID[], expected: GSDPeak[]) {
  for (let i = 0; i < expected.length; i++) {
    expected[i].id = peaks[i].id;
  }
  return expected;
}

import type { DataXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it } from 'vitest';

import { gsd } from '../gsd.ts';

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
    noise: {
      percent: 5,
    },
  });

  it('positive maxima peaks but noiseLevel over the peaks', () => {
    const peakList = gsd(data, { noiseLevel: 1.2 });
    expect(peakList).toStrictEqual([]);
  });

  it('positive maxima peaks', () => {
    const peakList = gsd(data, { noiseLevel: 0.5 });
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: 1.131 },
      { x: 0.5, y: 1.05 },
    ]);
  });

  it('negative maxima peaks', () => {
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => value - 2) },
      { noiseLevel: -1.5 },
    );
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: -0.868 },
      { x: 0.5, y: -0.95 },
    ]);
  });

  it('Negative peaks', () => {
    // we check negative peaks
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: false, noiseLevel: -0.5 },
    );
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: -1.131 },
      { x: 0.5, y: -1.05 },
    ]);
  });

  it('Negative peaks with noiseLevel too low', () => {
    // we check negative peaks
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: false, noiseLevel: -1.2 },
    );
    expect(peakList).toStrictEqual([]);
  });

  it('minima peaks', () => {
    // we check negative peaks
    const peakList = gsd(
      { x: data.x, y: data.y.map((value) => 1 - value) },
      { maxCriteria: false, noiseLevel: 0.5 },
    );
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: -0.131 },
      { x: 0.5, y: -0.05 },
    ]);
  });
});

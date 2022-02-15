import type { DataXY } from 'cheminfo-types';
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { gsd } from '../gsd';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateSpectrum } = require('spectrum-generator');

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
    peaks: {
      factor: 6,
    },
    noise: {
      percent: 5,
    },
  });

  it('positive maxima peaks', () => {
    let peakList = gsd(data);
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: 1.131 },
      { x: 0.5, y: 1.05 },
    ]);
  });

  it('negative maxima peaks', () => {
    let peakList = gsd({ x: data.x, y: data.y.map((value) => value - 2) }, {});
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: -0.868 },
      { x: 0.5, y: -0.95 },
    ]);
  });

  it('Negative peaks', () => {
    // we check negative peaks
    let peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: false },
    );
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: -1.131 },
      { x: 0.5, y: -1.05 },
    ]);
  });

  it('minima peaks', () => {
    // we check negative peaks
    let peakList = gsd(
      { x: data.x, y: data.y.map((value) => 1 - value) },
      { maxCriteria: false },
    );
    expect(peakList).toMatchCloseTo([
      { x: -0.5, y: -0.131 },
      { x: 0.5, y: -0.05 },
    ]);
  });
});

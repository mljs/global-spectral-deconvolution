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
  });

  // when smoothY we should take care that the peak is still as the same position but the height will be reduced
  // we have here a low resolution spectrum so the impact is big

  it('positive maxima peaks', () => {
    let peakList = gsd(data);

    let expected = [
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
    expect(peakList).toBeDeepCloseTo(expected);
  });

  it('negative maxima peaks', () => {
    let peakList = gsd({ x: data.x, y: data.y.map((value) => value - 2) }, {});

    let expected = [
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
    expect(peakList).toBeDeepCloseTo(expected);
  });

  it('Negative peaks', () => {
    // we check negative peaks
    let peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: false },
    );
    let expected = [
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

    expect(peakList).toBeDeepCloseTo(expected);
  });

  it('minima peaks', () => {
    // we check negative peaks
    let peakList = gsd(
      { x: data.x, y: data.y.map((value) => 1 - value) },
      { maxCriteria: false },
    );
    let expected = [
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

    expect(peakList).toBeDeepCloseTo(expected);
  });

  it('negative peaks with maxCriteria true', () => {
    let peakList = gsd(
      { x: data.x, y: data.y.map((value) => -value) },
      { maxCriteria: true },
    );
    expect(peakList).toHaveLength(0);
  });
});

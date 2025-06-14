import { describe, expect, it } from 'vitest';

import { broadenPeaks } from '../broadenPeaks.ts';

describe('broadenPeaks', () => {
  it('empty', () => {
    const result = broadenPeaks([]);
    expect(result).toStrictEqual([]);
  });

  it('Default value, factor:2, overlap:false', () => {
    const result = broadenPeaks([
      {
        x: -0.5,
        y: 1,
        ddY: 0,
        width: 0.8,
        index: 25,
        inflectionPoints: {
          from: { index: 23, x: -0.54 },
          to: { index: 27, x: -0.46 },
        },
      },
      {
        x: 0.5,
        y: 1,
        ddY: 0,
        width: 0.08,
        index: 75,
        inflectionPoints: {
          from: { index: 73, x: 0.46 },
          to: { index: 77, x: 0.54 },
        },
      },
    ]);

    expect(result).toBeDeepCloseTo([
      {
        x: -0.5,
        y: 1,
        index: 25,
        width: 0.16,
        from: { x: -0.58 },
        to: { x: -0.42 },
      },
      {
        x: 0.5,
        y: 1,
        index: 75,
        width: 0.16,
        from: { x: 0.42 },
        to: { x: 0.58 },
      },
    ]);
  });

  it('no change, factor:1, overlap:false', () => {
    const result = broadenPeaks(
      [
        {
          x: -0.5,
          y: 1,
          ddY: 0,
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
          ddY: 0,
          width: 0.08,
          index: 75,
          inflectionPoints: {
            from: { index: 73, x: 0.46 },
            to: { index: 77, x: 0.54 },
          },
        },
      ],
      { factor: 1 },
    );
    expect(result).toBeDeepCloseTo([
      {
        x: -0.5,
        y: 1,
        index: 25,
        width: 0.08,
        from: { x: -0.54 },
        to: { x: -0.46 },
      },
      {
        x: 0.5,
        y: 1,
        index: 75,
        width: 0.08,
        from: { x: 0.46 },
        to: { x: 0.54 },
      },
    ]);
  });

  it('factor=10', () => {
    const result = broadenPeaks(
      [
        {
          x: -0.5,
          y: 1,
          ddY: 0,
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
          ddY: 0,
          width: 0.08,
          index: 75,
          inflectionPoints: {
            from: { index: 73, x: 0.46 },
            to: { index: 77, x: 0.54 },
          },
        },
      ],
      { factor: 10 },
    );
    expect(result).toBeDeepCloseTo([
      {
        x: -0.5,
        y: 1,
        index: 25,
        width: 0.8,
        from: { x: -0.9 },
        to: { x: -0.1 },
      },
      {
        x: 0.5,
        y: 1,
        index: 75,
        width: 0.8,
        from: { x: 0.1 },
        to: { x: 0.9 },
      },
    ]);
  });

  it('factor=20', () => {
    const result = broadenPeaks(
      [
        {
          x: -0.5,
          y: 1,
          ddY: 0,
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
          ddY: 0,
          width: 0.08,
          index: 75,
          inflectionPoints: {
            from: { index: 73, x: 0.46 },
            to: { index: 77, x: 0.54 },
          },
        },
      ],
      { factor: 20 },
    );
    expect(result).toBeDeepCloseTo([
      {
        x: -0.5,
        y: 1,
        index: 25,
        width: 1.3,
        from: { x: -1.3 },
        to: { x: 0 },
      },
      {
        x: 0.5,
        y: 1,
        index: 75,
        width: 1.3,
        from: { x: 0 },
        to: { x: 1.3 },
      },
    ]);
  });

  it('factor=20 not same width', () => {
    const result = broadenPeaks(
      [
        {
          x: -0.5,
          y: 1,
          ddY: 0,
          width: 0.1,
          index: 25,
          inflectionPoints: {
            from: { index: 23, x: -0.55 },
            to: { index: 27, x: -0.45 },
          },
        },
        {
          x: 0.5,
          y: 1,
          ddY: 0,
          width: 0.4,
          index: 75,
          inflectionPoints: {
            from: { index: 73, x: 0.3 },
            to: { index: 77, x: 0.7 },
          },
        },
      ],
      { factor: 20 },
    );
    expect(result).toBeDeepCloseTo([
      {
        x: -0.5,
        y: 1,
        index: 25,
        width: 1.2,
        from: { x: -1.5 },
        to: { x: -0.3 },
      },
      {
        x: 0.5,
        y: 1,
        index: 75,
        width: 4.8,
        from: { x: -0.3 },
        to: { x: 4.5 },
      },
    ]);
  });

  it('factor=20 overlap=true', () => {
    const result = broadenPeaks(
      [
        {
          x: -0.5,
          y: 1,
          ddY: 0,
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
          ddY: 0,
          width: 0.08,
          index: 75,
          inflectionPoints: {
            from: { index: 73, x: 0.46 },
            to: { index: 77, x: 0.54 },
          },
        },
      ],
      { factor: 20, overlap: true },
    );
    expect(result).toBeDeepCloseTo([
      {
        x: -0.5,
        y: 1,
        index: 25,
        width: 1.6,
        from: { x: -1.3 },
        to: { x: 0.3 },
      },
      {
        x: 0.5,
        y: 1,
        index: 75,
        width: 1.6,
        from: { x: -0.3 },
        to: { x: 1.3 },
      },
    ]);
  });

  it('3 peaks factor=20', () => {
    const result = broadenPeaks(
      [
        {
          id: '1',
          x: -0.5,
          y: 1,
          ddY: 0,
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
          ddY: 0,
          width: 0.08,
          index: 75,
          inflectionPoints: {
            from: { index: 73, x: 0.46 },
            to: { index: 77, x: 0.54 },
          },
        },
        {
          x: 10.5,
          y: 1,
          ddY: 0,
          width: 0.08,
          index: 575,
          shape: { kind: 'gaussian' },
          inflectionPoints: {
            from: { index: 573, x: 10.46 },
            to: { index: 577, x: 10.54 },
          },
        },
      ],
      { factor: 20 },
    );
    expect(result).toBeDeepCloseTo(
      [
        {
          id: '1',
          x: -0.5,
          y: 1,
          index: 25,
          width: 1.3,
          from: { x: -1.3 },
          to: { x: 0 },
        },
        {
          x: 0.5,
          y: 1,
          index: 75,
          width: 1.3,
          from: { x: 0 },
          to: { x: 1.3 },
        },
        {
          x: 10.5,
          y: 1,
          index: 575,
          shape: { kind: 'gaussian' },
          width: 1.6,
          from: { x: 9.7 },
          to: { x: 11.3 },
        },
      ],
      1,
    );
  });
});

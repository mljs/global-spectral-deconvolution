import { describe, expect, it } from 'vitest';

import { setShape } from '../setShape.ts';

describe('setShape', () => {
  it('gaussian shape', () => {
    const result = setShape([
      {
        x: 5,
        y: 10,
        width: 5,
        index: 1,
      },
      {
        x: 10,
        y: 10,
        width: 10,
        index: 2,
      },
      {
        x: 30,
        y: 10,
        width: 15,
        index: 3,
      },
    ]);
    expect(result).toMatchCloseTo([
      {
        x: 5,
        y: 10,
        width: 5,
        index: 1,
        shape: { kind: 'gaussian', fwhm: 5.8870501125773735 },
      },
      {
        x: 10,
        y: 10,
        width: 10,
        index: 2,
        shape: { kind: 'gaussian', fwhm: 5.8870501125773735 * 2 },
      },
      {
        x: 30,
        y: 10,
        width: 15,
        index: 3,
        shape: { kind: 'gaussian', fwhm: 5.8870501125773735 * 3 },
      },
    ]);
  });
  it('lorentzian shape', () => {
    const result = setShape(
      [
        {
          x: 5,
          y: 10,
          width: 5,
          index: 1,
          inflectionPoints: {
            from: { x: 0, index: 0 },
            to: { x: 0, index: 0 },
          },
        },
        {
          x: 10,
          y: 10,
          width: 10,
          index: 2,
          inflectionPoints: {
            from: { x: 0, index: 0 },
            to: { x: 0, index: 0 },
          },
        },
        {
          x: 30,
          y: 10,
          width: 15,
          index: 3,
          inflectionPoints: {
            from: { x: 0, index: 0 },
            to: { x: 0, index: 0 },
          },
        },
      ],
      { shape: { kind: 'lorentzian' } },
    );
    expect(result).toMatchCloseTo([
      {
        x: 5,
        y: 10,
        width: 5,
        index: 1,
        shape: { kind: 'lorentzian', fwhm: 8.660254037844386 },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
      {
        x: 10,
        y: 10,
        width: 10,
        index: 2,
        shape: { kind: 'lorentzian', fwhm: 8.660254037844386 * 2 },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
      {
        x: 30,
        y: 10,
        width: 15,
        index: 3,
        shape: { kind: 'lorentzian', fwhm: 8.660254037844386 * 3 },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
    ]);
  });
  it('pseudovoigt shape', () => {
    const result = setShape(
      [
        {
          x: 5,
          y: 10,
          width: 5,
          index: 1,
          inflectionPoints: {
            from: { x: 0, index: 0 },
            to: { x: 0, index: 0 },
          },
        },
      ],
      { shape: { kind: 'pseudoVoigt', mu: 0.5 } },
    );
    expect(result).toMatchCloseTo([
      {
        x: 5,
        y: 10,
        width: 5,
        index: 1,
        shape: { kind: 'pseudoVoigt', fwhm: 5.443525056288687, mu: 0.5 },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
    ]);
  });
});

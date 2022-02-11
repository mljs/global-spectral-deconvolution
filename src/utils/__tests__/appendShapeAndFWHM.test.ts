import { toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { appendShapeAndFWHM } from '../appendShapeAndFWHM';

expect.extend({ toMatchCloseTo });

describe('appendShapeAndFWHM', () => {
  it('gaussian shape', () => {
    let result = appendShapeAndFWHM([
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
        fwhm: 5.8870501125773735,
        shape: { kind: 'gaussian' },
      },
      {
        x: 10,
        y: 10,
        width: 10,
        index: 2,
        fwhm: 5.8870501125773735 * 2,
        shape: { kind: 'gaussian' },
      },
      {
        x: 30,
        y: 10,
        width: 15,
        index: 3,
        fwhm: 5.8870501125773735 * 3,
        shape: { kind: 'gaussian' },
      },
    ]);
  });
  it('lorentzian shape', () => {
    let result = appendShapeAndFWHM(
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
        fwhm: 8.660254037844386,
        shape: { kind: 'lorentzian' },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
      {
        x: 10,
        y: 10,
        width: 10,
        index: 2,
        fwhm: 8.660254037844386 * 2,
        shape: { kind: 'lorentzian' },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
      {
        x: 30,
        y: 10,
        width: 15,
        index: 3,
        fwhm: 8.660254037844386 * 3,
        shape: { kind: 'lorentzian' },
        inflectionPoints: { from: { x: 0, index: 0 }, to: { x: 0, index: 0 } },
      },
    ]);
  });
});

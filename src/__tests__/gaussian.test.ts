import type { DataXY } from 'cheminfo-types';
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { gsd } from '../gsd';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateSpectrum } = require('spectrum-generator');

test('smooth:false option', () => {
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

  let peakList = gsd(data, {});
  expect(peakList).toBeDeepCloseTo([
    {
      x: -0.5,
      y: 1,
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
      width: 0.08,
      index: 75,
      inflectionPoints: {
        from: { index: 73, x: 0.46 },
        to: { index: 77, x: 0.54 },
      },
    },
  ]);
});

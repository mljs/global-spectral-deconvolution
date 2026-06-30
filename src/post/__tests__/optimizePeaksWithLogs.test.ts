import { generateSpectrum } from 'spectrum-generator';
import { expect, test } from 'vitest';

import { optimizePeaksWithLogs } from '../optimizePeaksWithLogs.ts';

test('Should throw because execution time is over timeout', () => {
  const peaks = [{ x: 0, y: 1, width: 0.12 }];

  const data = generateSpectrum(peaks, {
    generator: {
      from: -0.5,
      to: 0.5,
      nbPoints: 101,
      shape: {
        kind: 'gaussian',
      },
    },
  });

  const result = optimizePeaksWithLogs(data, [
    {
      x: 0.01,
      y: 0.9,
      width: 0.11,
    },
  ]);

  expect(result.logs).toHaveLength(1);

  const log = result.logs[0];

  expect(log.message).toBe('optimization successful');
  expect(log.groupSize).toBe(1);
  expect(log.parameters).toMatchObject({
    optimization: {
      kind: 'lm',
      options: { timeout: 10 },
    },
    parameters: undefined,
  });
  expect(log.iterations).toStrictEqual(expect.any(Number));
  // The final error can vary between platforms/optimizer versions; assert it's small
  expect(log.error).toBeCloseTo(0, 6);
  expect(result.optimizedPeaks).toMatchCloseTo([
    {
      x: 0,
      y: 1,
      width: 0.12,
      shape: {
        kind: 'gaussian',
        fwhm: 0.14128970668640126,
      },
    },
  ]);

  const options = {
    optimization: {
      kind: 'lm' as const,
      options: {
        timeout: 0,
      },
    },
  };

  expect(() =>
    optimizePeaksWithLogs(data, [{ x: 0.1, y: 0.9, width: 0.11 }], options),
  ).toThrow('The execution time is over to 0 seconds');
});

test('passes maxNumberOfPeaks to groupPeaks and splits large groups', () => {
  const peaks = [
    { x: 0, y: 1, width: 0.12 },
    { x: 0.5, y: 0.8, width: 0.12 },
  ];

  const data = generateSpectrum(peaks, {
    generator: {
      from: -1,
      to: 1.5,
      nbPoints: 201,
      shape: {
        kind: 'gaussian',
      },
    },
  });

  const result = optimizePeaksWithLogs(data, peaks, {
    groupingFactor: 10,
    maxNumberOfPeaks: 1,
  });

  expect(result.logs).toHaveLength(2);
  expect(result.logs.map((log) => log.groupSize)).toStrictEqual([1, 1]);
});

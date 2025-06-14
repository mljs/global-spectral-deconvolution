import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it } from 'vitest';

import { optimizePeaksWithLogs } from '../optimizePeaksWithLogs.ts';

describe('optimizePeaksWithLogs', () => {
  it('Should throw because execution time is over timeout', () => {
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
    expect(result.logs).toMatchObject([
      {
        iterations: 100,
        error: 0.000017852931247867768,
        parameters: { kind: 'lm', options: { timeout: 10 } },
        message: 'optimization successful',
        groupSize: 1,
      },
    ]);
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
});

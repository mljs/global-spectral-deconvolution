import { generateSpectrum } from 'spectrum-generator';

import { optimizePeaks } from '../optimizePeaks';

describe('optimizePeaks', () => {
  it('Should throw because execution time is over timeout', () => {
    const peaks = [{ x: 0, y: 1, width: 0.12 }];

    const data = generateSpectrum(peaks, {
      from: -0.5,
      to: 0.5,
      nbPoints: 101,
      shape: {
        kind: 'gaussian',
      },
    });

    const options = {
      optimization: {
        kind: 'lm',
        options: {
          timeout: 0,
        },
      },
    };
    expect(() =>
      optimizePeaks(data, [{ x: 0.1, y: 0.9, width: 0.11 }], options),
    ).toThrow('The execution time is over to 0 seconds');
  });
});

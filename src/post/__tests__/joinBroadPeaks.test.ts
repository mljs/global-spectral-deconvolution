import { generateSpectrum } from 'spectrum-generator';

import { gsd } from '../../gsd';
import { joinBroadPeaks } from '../joinBroadPeaks';

describe('joinBroadPeaks', () => {
  it('mix broad and not broad peaks', () => {
    const data = generateSpectrum(
      [
        { x: 0.25, y: 10, width: 0.08 },
        { x: 0.4, y: 40, width: 0.005 },
        { x: 0.39, y: 40, width: 0.005 },
      ],
      {
        generator: {
          from: 0,
          to: 0.5,
          nbPoints: 1024,
        },
        noise: { seed: 10, percent: 0.1 },
      },
    );

    const peaks = gsd(data);
    const newPeaks = joinBroadPeaks(peaks, {
      broadRatio: 0.03,
      broadWidth: 0.25,
    });

    expect(peaks.length).toBeGreaterThan(3);
    expect(newPeaks).toHaveLength(3);
  });
});

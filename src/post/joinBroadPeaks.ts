import { Shape1D, ShapeKind } from 'ml-peak-shape-generator';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { optimize } =require( 'ml-spectra-fitting');

/**
 * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
 * @param {Array} peaks - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param {object} [options = {}] - options
 * @param {number} [options.width=0.25] - width limit to join peaks.
 * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
 * @param {string} [options.shape.kind = 'gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
 * @param {object} [options.optimization = {}] - it's specify the kind and options of the algorithm use to optimize parameters.
 * @param {string} [options.optimization.kind = 'lm'] - kind of algorithm. By default it's levenberg-marquardt.
 * @param {number} [options.optimization.options.timeout = 10] - maximum time running before break in seconds.
 * @param {object} [options.optimization.options = {}] - options for the specific kind of algorithm.
 */
interface peakType {
  index?: number;
  x: number;
  y?: number;
  shape: shapeType,
  from?: number,
  to?: number
}
interface shapeType {
  kind?: ShapeKind;
  options?: Shape1D;
  height?: number;
  width: number;
  soft?: boolean;
  noiseLevel?: number;
}
interface optionsType{
  width?:number,
  shape?:shapeType,
  optimization?: { kind: string, timeout: number }
}
export function joinBroadPeaks(peakList:peakType[], options:optionsType = {}) {
  let {
    width = 0.25,
    shape = { kind: 'gaussian' },
    optimization = { kind: 'lm', timeout: 10 },
  } = options;
  let broadLines:peakType[] = [];
  // Optimize the possible broad lines
  let max = 0;
  let maxI = 0;
  let count = 1;

  const peaks:peakType[] = JSON.parse(JSON.stringify(peakList));
  for (let i = peaks.length - 1; i >= 0; i--) {
    if (peaks[i].shape.soft) {
      broadLines.push(peaks.splice(i, 1)[0]);
    }
  }
  // Push a feke peak
  broadLines.push({ x: Number.MAX_VALUE ,shape:{ width : 0}});

  let candidates = { x: [broadLines[0].x], y: [broadLines[0].y] };
  let indexes:number[] = [0];
  for (let i = 1; i < broadLines.length; i++) {
    if (Math.abs(broadLines[i - 1].x - broadLines[i].x) < width) {
      candidates.x.push(broadLines[i].x);
      candidates.y.push(broadLines[i].y);
      if (broadLines[i].y as number > max) {
        max = broadLines[i].y as number;
        maxI = i;
      }
      indexes.push(i);
      count++;
    } else {
      if (count > 2) {
        let fitted = optimize(
          candidates,
          [
            {
              x: broadLines[maxI].x,
              y: max,
              shape: {
                width: Math.abs(
                  candidates.x[0] - candidates.x[candidates.x.length - 1],
                ),
              },
            },
          ],
          { shape, optimization },
        );
        let { peaks: peak } = fitted;
        peak[0].index = Math.floor(
          indexes.reduce((a, b) => a + b, 0) / indexes.length,
        );
        peak[0].shape.soft = false;
        peaks.push(peak[0]);
      } else {
        // Put back the candidates to the signals list
        indexes.forEach((index) => {
          peaks.push(broadLines[index]);
        });
      }
      candidates = { x: [broadLines[i].x], y: [broadLines[i].y] };
      indexes = [i];
      max = broadLines[i].y as number;
      maxI = i;
      count = 1;
    }
  }
  peaks.sort((a, b) => {
    return a.x - b.x;
  });

  return peaks;
}

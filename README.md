# ml-gsd

[![NPM version](https://img.shields.io/npm/v/ml-gsd.svg)](https://www.npmjs.com/package/ml-gsd)
[![npm download](https://img.shields.io/npm/dm/ml-gsd.svg)](https://www.npmjs.com/package/ml-gsd)
[![test coverage](https://img.shields.io/codecov/c/github/mljs/global-spectral-deconvolution.svg)](https://codecov.io/gh/mljs/global-spectral-deconvolution)
[![license](https://img.shields.io/npm/l/ml-gsd.svg)](https://github.com/mljs/global-spectral-deconvolution/blob/main/LICENSE)

Global spectral deconvolution and peak optimizer.

## Installation

```console
npm i ml-gsd
```

This package is ESM-only. CommonJS consumers need Node.js >= 22.12 or any 24.x
or later, where `require()` of a synchronous ES module is supported.

## [API documentation](https://mljs.github.io/global-spectral-deconvolution/)

`gsd` is using an algorithm that is searching for inflection points to determine the position and width of peaks. The width is defined as the distance between the 2 inflection points. Depending the shape of the peak this width may differ from 'fwhm' (Full Width Half Maximum).

Preprocessing of the data involves the following parameters

- `maxCriteria`: search either for maxima or minima. We will invert the data and the results if searching for a minima
- `noiseLevel`: specifies the noise level. All the peaks below this value (or above in case of maxCriteria=false) are ignored. By default the noiseLevel will be set to the median + 3 x sd. This is a good value when not too many peaks are present in the spectrum.
- `sgOptions`: Savitzky-Golay filter that is used to smooth the data for the calculation of the derivatives
- `smoothY`: If this value is true the SG filter is not only applied during the calculation of the derivatives but also on the original data

### gsd({x:[], y:[]}, options)

The result of GSD is an array of GSDPeak:

- x: position of the peak on the x axis
- y: the height of the peak
- width: width at the level of the inflection points
- index: index in the 'x' and 'y' array of the peak
- ddY: second derivative value at the level of the peak. Allows to identify 'large' peaks
- inflectionPoints: an object with the position of the inflection points
  - from: { x, index }
  - to: { x, index }

### Parameters

#### minMaxRatio=0.00025 (0-1)

Threshold to determine if a given peak should be considered as a noise, bases on its relative height compared to the highest peak.

#### maxAbsoluteRatio=0 (0-1)

Use an absolute threshold based on a fraction of the maximum absolute Y value. When set to a value in (0,1] the threshold will be `maxAbsoluteRatio * maxAbsoluteValue(y)`. When `0` (default) this option is ignored and `noiseLevel` is used. Value must be between 0 and 1.

#### maxCriteria=true [true||false]

Peaks are local maximum(true) or minimum(false)

#### smoothY=true [true||false]

Select the peak intensities from a smoothed version of the independent variables?

#### realTopDetection=false [true||false]

Use a quadratic optimizations with the peak and its 3 closest neighbors to determine the true x,y values of the peak?

#### sgOptions={windowSize: 5, polynomial: 3}

Savitzky-Golay parameters. windowSize should be odd; polynomial is the degree of the polynomial to use in the approximations. It should be bigger than 2.

#### ids=true [true||false]

Give every peak a random `id`. Minting one costs more than finding the peak did — on a mass-spectrometry imaging run picking millions of peaks it is around 20% of the whole deconvolution — so a caller that reads only the coordinates should pass `ids: false`, and the `id` property is then left off the peaks entirely.

### Post methods

#### GSD.broadenPeaks(peakList, {factor=2, overlap=false})

We enlarge the peaks and add the properties from and to.
By default we enlarge of a factor 2 and we don't allow overlap.

#### GSD.optimizePeaks(data, peakList, options)

Optimize the position (x), max intensity (y), full width at half maximum (fwhm) and the ratio of gaussian contribution (mu) if it's required. It currently supports three kind of shapes: gaussian, lorentzian and pseudovoigt

## Example

```js
import { IsotopicDistribution } from 'mf-global';
import { gsd, optimizePeaks } from 'ml-gsd';

// generate a sample spectrum of the form {x:[], y:[]}
const data = new IsotopicDistribution('C').getGaussian();

const peaks = gsd(data, {
  minMaxRatio: 0.00025, // Threshold to determine if a given peak should be considered as a noise
  realTopDetection: true, // Correction of the x and y coordinates using a quadratic optimizations
  maxCriteria: true, // Are we looking for maxima or minima
  smoothY: false, // should we smooth the spectra and return smoothed peaks ? Default false.
  sgOptions: { windowSize: 7, polynomial: 3 }, // Savitzky-Golay smoothing parameters for first and second derivative calculation
  ids: true, // Give each peak a random id. Pass false when you only read the coordinates
});
console.log(peaks);
/*
  array of peaks containing {x, y, width, ddY, inflectionPoints}
  - width = distance between inflection points
  - ddY = second derivative on the top of the peak
 */

const optimized = optimizePeaks(data, peaks);
console.log(optimized);
/*
[
  {
    x: 11.999999999607912,
    y: 0.9892695155316565,
    shape: { fwhm: 0.010000209739248308, kind: 'gaussian' },
    id: '80b85a44-e14f-4bfd-a317-78a0b27feb39',
    width: 0.008493396138996155
  },
  {
    x: 13.003354834677824,
    y: 0.010699670320385445,
    shape: { fwhm: 0.010000209728620733, kind: 'gaussian' },
    id: '4deb729b-c44c-4713-b7c7-f630621fc44d',
    width: 0.008493396129969924
  }
]
*/
```

## License

[MIT](./LICENSE)

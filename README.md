# global-spectral-deconvolution and peak optimizer

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

## Global Spectra Deconvolution

`gsd`is using an algorithm that is searching for inflection points to determine the position and width of peaks. The width is defined as the distance between the 2 inflection points. Depending the shape of the peak this width may differ from 'fwhm' (Full Width Half Maximum).

Preprocessing of the data involves the following parameters

- `maxCriteria`: search either for maxima or minima. We will invert the data and the results if searching for a minima
- `noiseLevel`:
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

## Parameters

#### minMaxRatio=0.00025 (0-1)

Threshold to determine if a given peak should be considered as a noise, bases on its relative height compared to the highest peak.

#### noiseLevel=0 (-inf, inf)

Noise threshold in spectrum units

#### maxCriteria=true [true||false]

Peaks are local maximum(true) or minimum(false)

#### smoothY=true [true||false]

Select the peak intensities from a smoothed version of the independent variables?

#### realTopDetection=false [true||false]

Use a quadratic optimizations with the peak and its 3 closest neighbors to determine the true x,y values of the peak?

#### sgOptions={windowSize: 5, polynomial: 3}

Savitzky-Golay parameters. windowSize should be odd; polynomial is the degree of the polynomial to use in the approximations. It should be bigger than 2.

#### heightFactor=0

Factor to multiply the calculated height (usually 2).

#### derivativeThreshold=0

Filters based on the amplitude of the first derivative

## Post methods

### GSD.broadenPeaks(peakList, {factor=2, overlap=false})

We enlarge the peaks and add the properties from and to.
By default we enlarge of a factor 2 and we don't allow overlap.

### GSD.joinBroadPeaks

#### broadRatio=0.00 (0-1)

If `broadRatio` is higher than 0, then all the peaks which second derivative smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.

### GSD.optimizePeaks

## Example

```js
import { IsotopicDistribution } from 'mf-global';
import { gsd, optimizePeaks } from 'ml-gad';

// generate a sample spectrum of the form {x:[], y:[]}
const data = new IsotopicDistribution('C').getGaussian();

let peaks = gsd(data, {
  noiseLevel: 0, // if 0, automatic noise detection
  minMaxRatio: 0.00025, // Threshold to determine if a given peak should be considered as a noise
  realTopDetection: true, // Correction of the x and y coordinates using a quadratic optimizations
  maxCriteria: true, // Are we looking for maxima or minima
  smoothY: false, // should we smooth the spectra and return smoothed peaks ? Default false.
  sgOptions: { windowSize: 7, polynomial: 3 }, // Savitzky-Golay smoothing parameters for first and second derivative calculation
});
console.log(peaks);
/*
  array of peaks containing {x, y, width, ddY, inflectionPoints}
  - width = distance between inflection points
  - ddY = second derivative on the top of the peak
 */

let optimized = optimizePeaks(data, peaks);
console.log(optimized);
/*
[
  {
    x: 11.99999999960885,
    y: 0.9892695646808637,
    shape: { kind: 'gaussian' },
    fwhm: 0.010000209455943584,
    width: 0.008493395898379276
  },
  {
    x: 13.003354834590702,
    y: 0.010699637653261198,
    shape: { kind: 'gaussian' },
    fwhm: 0.010000226962299321,
    width: 0.008493410766908847
  }
]
*/
```

i

## [API documentation](http://mljs.github.io/global-spectral-deconvolution/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-gsd.svg
[npm-url]: https://npmjs.org/package/ml-gsd
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/global-spectral-deconvolution.svg
[codecov-url]: https://codecov.io/gh/mljs/global-spectral-deconvolution
[ci-image]: https://github.com/mljs/global-spectral-deconvolution/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/mljs/global-spectral-deconvolution/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/ml-gsd.svg
[download-url]: https://npmjs.org/package/ml-gsd

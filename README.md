# global-spectral-deconvolution

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

Global Spectra Deconvolution + Peak optimizer

## [API documentation](http://mljs.github.io/global-spectral-deconvolution/)

## Parameters

#### minMaxRatio=0.00025 (0-1)
Threshold to determine if a given peak should be considered as a noise, bases on its relative height compared to the highest peak.

#### broadRatio=0.00  (0-1)
If `broadRatio` is higher than 0, then all the peaks which second derivative smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.

#### noiseLevel=0 (-inf, inf)
Noise threshold in spectrum units

#### maxCriteria=true  [true||false]
Peaks are local maximum(true) or minimum(false)

#### smoothY=true [true||false]
Select the peak intensities from a smoothed version of the independent variables?

#### realTopDetection=false [true||false]
Use a quadratic optimizations with the peak and its 3 closest neighbors to determine the true x,y values of the peak?

#### sgOptions={windowSize: 5, polynomial: 3}
Savitzky-Golay parameters. windowSize should be odd; polynomial is the degree of the polynomial to use in the approximations. It should be bigger than 2.

#### heightFactor=0
Factor to multiply the calculated height (usually 2).

#### boundaries=false
Return also the inflection points of the peaks

#### derivativeThreshold=0
Filters based on the amplitude of the first derivative

## Example
```js
var CC = require('chemcalc');
var Stat = require('ml-stat');
var peakPicking = require('ml-gsd');


var spectrum = CC.analyseMF("Cl2.Br2", {isotopomers:'arrayXXYY', fwhm:0.01, gaussianWidth: 11});
var xy = spectrum.arrayXXYY;
var x = xy[0];
var y = xy[1];
//Just a fake noiseLevel
var noiseLevel = Stat.array.median(y.filter(function(a) {return (a > 0)})) * 3;

var options = {
  noiseLevel: noiseLevel,
  minMaxRatio:0,
  broadRatio:0,
  smoothY:false,
  realTopDetection:true
};
var result = peakPicking.gsd(x, y, options);
result = peakPicking.post.optimizePeaks(result, x, y, 1, "gaussian");
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-gsd.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ml-gsd
[travis-image]: https://img.shields.io/travis/mljs/global-spectral-deconvolution/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/global-spectral-deconvolution
[david-image]: https://img.shields.io/david/mljs/global-spectral-deconvolution.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/global-spectral-deconvolution
[download-image]: https://img.shields.io/npm/dm/ml-gsd.svg?style=flat-square
[download-url]: https://npmjs.org/package/ml-gsd

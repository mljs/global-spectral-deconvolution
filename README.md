# global-spectral-deconvolution

Global Spectra Deconvolution + Peak optimizer

##Parameters

#### minMaxRatio=0.00025 (0-1)
Threshold to determine if a given peak should be considered as a noise, bases on its relative height compared to the higest peak.

#### broadRatio=0.00  (0-1)
If broadRatio is higher than 0, then all the peaks which second derivative smaller than broadRatio*maxAbsSecondDerivative will be marked with the soft mask equal to true.

#### noiseLevel=0 (-inf, inf)
Noise threshold in spectrum units

#### maxCriteria=true  [true||false]
Peaks are local maximum(true) or minimum(false)

#### smoothY=true [true||false]
Select the peak intensities from a smoothed version of the independent variables?

#### realTopDetection=false [true||false]
Use a cuadratic optmizations with the peak and its 3 closest neighbors to determine the true x,y values of the peak?

#### sgOptions={windowSize: 5, polynomial: 3}
Savitzky-Golay paramters. windowSize should be odd; polynomial is the degree of the polinomial to use in the approximations. > 2

## Example
```
var CC = require('chemcalc');
var Stat = require('ml-stat');
var peakPicking = require("../src/index");


var spectrum=CC.analyseMF("Cl2.Br2", {isotopomers:'arrayXXYY', fwhm:0.01, gaussianWidth: 11});
var xy=spectrum.arrayXXYY;
var x=xy[0];
var y=xy[1];
//Just a fake noiseLevel
var noiseLevel=Stat.array.median(y.filter(function(a) {return (a>0)}))*3;

var result=peakPicking.gsd(x, y,  {noiseLevel: noiseLevel, minMaxRatio:0, broadRatio:0,smoothY:false,realTopDetection:true});
result = peakPicking.post.optimizePeaks(result,x,y,1,"gaussian");
```

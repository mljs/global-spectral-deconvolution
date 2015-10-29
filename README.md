# global-spectral-deconvolution

Global Spectra Deconvolution + Peak optimizer

## Example
``
var CC = require('chemcalc');
var Stat = require('ml-stat');
var peakPicking = require("../src/index");


var spectrum=CC.analyseMF("Cl2.Br2", {isotopomers:'arrayXXYY', fwhm:0.01, gaussianWidth: 11});
var xy=spectrum.arrayXXYY;
var x=xy[0];
var y=xy[1];
//Just a fake noiseLevel
var noiseLevel=Stat.array.median(y.filter(function(a) {return (a>0)}))*3;

var result=peakPicking.gsd(x, y,  {noiseLevel: noiseLevel, minMaxRatio:0, broadRatio:0,smoothY:false});
result = peakPicking.optimize(result,x,y,1,"gaussian");`
```

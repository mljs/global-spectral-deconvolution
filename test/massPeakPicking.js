'use strict';

var CC = require('chemcalc');
var Stat = require('ml-stat');
var peakPicking = require("../src/index");


var spectrum=CC.analyseMF("Cl2.Br2", {isotopomers:'arrayXXYY', fwhm:0.01, gaussianWidth: 11});
var xy=spectrum.arrayXXYY;
var x=xy[0];
var y=xy[1];
//console.log(y);
var noiseLevel=Stat.array.median(y.filter(function(a) {return (a>0)}))*3;

var result=peakPicking.gsd(x, y,  {noiseLevel: noiseLevel, minMaxRatio:0, broadRatio:0,smoothY:false});
console.log("Before optmization");
console.log(result);
result = peakPicking.optimize(result,x,y,1,"gaussian");
console.log("After optmization");
console.log(result);

describe.only('Check the peak picking of a simulated mass spectrum', function () {

    it('Check result', function () {

    });
});


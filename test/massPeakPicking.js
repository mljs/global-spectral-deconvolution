'use strict';

var CC = require('chemcalc');
var Stat = require('ml-stat');
var gsdLight = require("../src/gsdLight");


var spectrum=CC.analyseMF("Cl2.Br2", {isotopomers:'arrayXXYY', fwhm:0.01, gaussianWidth: 11});
var xy=spectrum.arrayXXYY;
var x=xy[0];
var y=xy[1];

/*for(var i=0;i< 400;i++){
    console.log(x[i]+" "+y[i]);
}
*/
//console.log(y);
var noiseLevel=Stat.array.median(y.filter(function(a) {return (a>0)}))*3;

//console.log(y);
var result=gsdLight(x, y, {noiseLevel: 0, functionType:"gaussian"});

console.log(result);
console.log(result.length);

describe.only('Check the peak picking of a simulated mass spectrum', function () {

    it('Check result', function () {

    });
});


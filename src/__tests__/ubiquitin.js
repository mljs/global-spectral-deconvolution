'use strict';

var fs = require('fs');

var peakPicking = require('..');

// var gsd = require("../src/index");
// var optimizePeaks = require("../src/optimize");
var { parseXY } = require('xy-parser');
var Opt = require('ml-optimize-lorentzian');

describe('Global spectra deconvolution HR mass spectra', () => {
  var spectrum = parseXY(
    fs.readFileSync(`${__dirname}/data/ubiquitin.txt`, 'utf-8'),
    { arrayType: 'xxyy' }
  );
  // var d = new Date();
  // var n = d.getTime();
  // var spectrum=parser.parse(fs.readFileSync('./ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
  // d = new Date();
  // console.log("Parsing time: "+(d.getTime()-n));
  var noiseLevel = 0; // Stat.array.max(spectrum[1])*0.015;

  var result = peakPicking.gsd(spectrum[0], spectrum[1], {
    noiseLevel: noiseLevel,
    minMaxRatio: 0.0,
    broadRatio: 0,
    smoothY: false,
    realTopDetection: true,
    sgOptions: { windowSize: 7, polynomial: 3 }
  });

  // console.log(result);
  // d = new Date();
  // console.log("Parsing + gsd time: "+(d.getTime()-n));
  var newResult = Opt.optimizeGaussianTrain(spectrum, result, {
    percentage: 0.2
  });
  expect(newResult[0].opt).toBe(true);
  expect(newResult).toHaveLength(result.length);
  // d = new Date();
  // console.log("Parsing + gsd + optimization time: "+(d.getTime()-n));

  // for(var i=0;i<result.length;i++){
  // if(result[i].width<0.05)
  //    console.log(result[i].x+" "+result[i].y+" "+result[i].width);
  // }
  // console.log(result.length);*/

  // Test case obtained from Pag 443, Chap 8.
  test('Should provide the right result ...', () => {
    // var result = gsd(spectrum[0],spectrum[1], 0.001, 0.1);
    // console.log(result);
  });
});

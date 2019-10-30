'use strict';

let fs = require('fs');

// var gsd = require("../src/index");
// var optimizePeaks = require("../src/optimize");
let { parseXY } = require('xy-parser');
let Opt = require('ml-optimize-lorentzian');

let peakPicking = require('..');

describe('Global spectra deconvolution HR mass spectra', () => {
  let spectrum = parseXY(
    fs.readFileSync(`${__dirname}/data/ubiquitin.txt`, 'utf-8'),
    { arrayType: 'xxyy' },
  );
  // var d = new Date();
  // var n = d.getTime();
  // var spectrum=parser.parse(fs.readFileSync('./ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
  // d = new Date();
  // console.log("Parsing time: "+(d.getTime()-n));
  let noiseLevel = 0; // Stat.array.max(spectrum[1])*0.015;

  let result = peakPicking.gsd(spectrum[0], spectrum[1], {
    noiseLevel: noiseLevel,
    minMaxRatio: 0.0,
    broadRatio: 0,
    smoothY: false,
    realTopDetection: true,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });

  // console.log(result);
  // d = new Date();
  // console.log("Parsing + gsd time: "+(d.getTime()-n));
  let newResult = Opt.optimizeGaussianTrain(spectrum, result, {
    percentage: 0.2,
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
  it.todo('Should provide the right result ...');
});

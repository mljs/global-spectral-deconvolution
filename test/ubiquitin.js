'use strict';

var fs = require('fs');
//var gsd = require("..");
var gsd = require("../src/gsdLight");
var parser = require('xy-parser');

var Stat = require('ml-stat');




describe('Global spectra deconvolution2', function () {

    //var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var noiseLevel=Stat.array.median(spectrum[1].filter(function(a) {return (a>0)}));
    //console.log("noiseLevel "+noiseLevel);
    var result = gsd(spectrum[0],spectrum[1], {noiseLevel: noiseLevel, minMaxRatio:0, broadRatio:0, functionType:"gaussian"});

    for(var i=0;i<result.length;i++){
        console.log(result[i].x+" "+result[i].width+" "+result[i].y);
    }
    console.log(result.length);
    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {
        //var result = gsd(spectrum[0],spectrum[1], 0.001, 0.1);
        //console.log(result);

    });
});



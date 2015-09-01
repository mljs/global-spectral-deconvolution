'use strict';

var fs = require('fs');
var gsd = require("../src/gsdLight");
var parser = require('xy-parser');
var Stat = require('ml-stat');





describe('Global spectra deconvolution', function () {


    //var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var x=spectrum[0];
    var y=spectrum[1];

    var noiseLevel=Stat.array.median(y.filter(function(a) {return (a>0)}))*3;


    var result = gsd(spectrum[0],spectrum[1], {noiseLevel: noiseLevel});


    console.log(result);
    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {


        var result = gsd(spectrum[0],spectrum[1], 0.001, 0.1);
        console.log(result);

    });
});



'use strict';

var fs = require('fs');
var gsd = require("..");
var parser = require('xy-parser');






describe('Global spectra deconvolution', function () {

    //var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var result = gsd(spectrum[0],spectrum[1], {noiseLevel: 0.001, minMaxRatio:0,broadRatio:0});


    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {


        var result = gsd(spectrum[0],spectrum[1], 0.001, 0.1);
        console.log(result);

    });
});



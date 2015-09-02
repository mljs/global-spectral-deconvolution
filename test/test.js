'use strict';

var fs = require('fs');
var gsd = require("..");





describe('Global spectra deconvolution', function () {

    var spectrum=JSON.parse(fs.readFileSync('./test//C2.json', 'utf-8'));




    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {


        var result = gsd(spectrum[0],spectrum[1], {noiseLevel: 0.001, minMaxRatio:0});
        //console.log(result);

    });
});



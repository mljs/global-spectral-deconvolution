'use strict';

var fs = require('fs');
var gsd = require("..");
var parser = require('xy-parser');

var spectrum=parser.parse(fs.readFileSync('./test//ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});



describe('Global spectra deconvolution', function () {

    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {


        var result = gsd(spectrum[0],spectrum[1], 0.001, 0.1);
        console.log(result);

    });
});



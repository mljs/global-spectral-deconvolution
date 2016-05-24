'use strict';

var fs = require('fs');
var peakPicking = require("../src/index");

describe('Global spectra deconvolution NMR spectra', function () {

    // Test case obtained from Pag 443, Chap 8.
    it('Ethylvinylether should have 21 peaks', function () {
        var spectrum=JSON.parse(fs.readFileSync('./test//ethylvinylether.json', 'utf-8'));
        var result = peakPicking.gsd(spectrum[0],spectrum[1],
            {//noiseLevel: 1049200.537996172,
                minMaxRatio: 0.03,
                smoothY:false,
                realTopDetection:true,
                sgOptions:{windowSize:5, polynomial:3}
            });
        //console.log(spectrum[1][13223]);
        //console.log(result);
        result.length.should.equal(21);
    });
});
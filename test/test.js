'use strict';

var fs = require('fs');
var peakPicking = require("../src/index");

describe('Global spectra deconvolution simple simulated spectrum', function () {

    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {
        var spectrum=JSON.parse(fs.readFileSync('./test//C2.json', 'utf-8'));
        var result = peakPicking.gsd(spectrum[0],spectrum[1], {noiseLevel: 0.001, minMaxRatio:0});

        result[0].x.should.approximately(24,0.02);
        result[0].y.should.approximately(0.09394372786996513,0.0005);
        //result[0].width.should.approximately(0.008,5e-4);

        result[1].x.should.approximately(25,0.02);
        result[1].y.should.approximately(0.0020321396708958394,0.0005);
        //result[1].width.should.approximately(0.006,5e-4);

    });
});



'use strict';

var fs = require('fs');
var peakPicking = require("../src/index");

describe('Global spectra deconvolution NMR spectra', function () {

    // Test case obtained from Pag 443, Chap 8.
    it('Should give 1 broad peak and around 14 other peaks', function () {
        var spectrum=JSON.parse(fs.readFileSync('./test/broadNMR.json', 'utf-8'));
        var result = peakPicking.gsd(spectrum[0],spectrum[1], {noiseLevel: 1049200.537996172/2,
                minMaxRatio:0.01,
                broadRatio:0.0025,
                sgOptions:{windowSize: 9,
                    polynomial: 3}
            }
        );
        var last = peakPicking.post.joinBroadPeaks(result,{width:0.25});
        result.length.should.approximately(15,1);
        result.map(function(peak){
            if(Math.abs(peak.x-4.31)<0.01){
                peak.width.should.approximately(0.39,0.02);
            }
        });
    });
});
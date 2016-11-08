'use strict';

var CC = require('chemcalc');
var Stat = require('ml-stat');
var peakPicking = require('..');


var spectrum = CC.analyseMF('Cl2.Br2', {isotopomers: 'arrayXXYY', fwhm: 0.01, gaussianWidth: 11});
var xy = spectrum.arrayXXYY;
var x = xy[0];
var y = xy[1];
var max = Stat.array.max(y);
var noiseLevel = Stat.array.median(y.filter((a) => (a > 0))) * 3;
/*
69.938 100
71.935 63.99155
73.932 10.2373
157.837 51.39931
159.835 100
161.833 48.63878

*/

describe('Check the peak picking of a simulated mass spectrum', function () {

    it('Check result', function () {
        var result = peakPicking.gsd(x, y,  {noiseLevel: noiseLevel, minMaxRatio: 0, broadRatio: 0, smoothY: false, realTopDetection: true});
        result = peakPicking.post.optimizePeaks(result, x, y, 1, 'gaussian');

        result[0].x.should.approximately(69.938, 0.02);
        result[0].y.should.approximately(max, 0.01);
        result[0].width.should.approximately(0.01, 5e-4);

        result[1].x.should.approximately(71.935, 0.02);
        result[1].y.should.approximately(63.99155 * max / 100, 0.01);
        result[1].width.should.approximately(0.01, 5e-4);

        result[2].x.should.approximately(73.932, 0.02);
        result[2].y.should.approximately(10.2373 * max / 100, 0.01);
        result[2].width.should.approximately(0.01, 5e-4);

        result[3].x.should.approximately(157.837, 0.02);
        result[3].y.should.approximately(51.39931 * max / 100, 0.01);
        result[3].width.should.approximately(0.01, 5e-4);

        result[4].x.should.approximately(159.835, 0.02);
        result[4].y.should.approximately(max, 0.01);
        result[4].width.should.approximately(0.01, 5e-4);

        result[5].x.should.approximately(161.833, 0.02);
        result[5].y.should.approximately(48.63878 * max / 100, 0.01);
        result[5].width.should.approximately(0.01, 5e-4);
    });
});


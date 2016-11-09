'use strict';

var fs = require('fs');
const gsd = require('..').gsd;

function lorentzian(x, x0 = 0, gamma = 1) {
    return (gamma * gamma) / (Math.PI * gamma * (gamma * gamma + (x - x0) * (x - x0)));
}

describe('Global spectra deconvolution simple simulated spectrum', function () {

    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {
        var spectrum = JSON.parse(fs.readFileSync('./test//C2.json', 'utf-8'));
        var result = gsd(spectrum[0], spectrum[1], {//noiseLevel: 0.001,
            minMaxRatio: 0,
            realTopDetection: true,
            smoothY: false
        });

        result[0].x.should.approximately(24, 0.02);
        result[0].y.should.approximately(0.09394372786996513, 0.00005);
        //result[0].width.should.approximately(0.008,5e-4);

        result[1].x.should.approximately(25, 0.02);
        result[1].y.should.approximately(0.0020321396708958394, 0.00005);
        //result[1].width.should.approximately(0.006,5e-4);

    });

    it('Should give 10 peaks', function () {
        const size = 300;
        const fourth = size / 11;
        var times = new Array(size);
        var tic = new Array(size);
        console.log("here2");

        for (var i = 0; i < size; ++i) {
            times[i] = i;
            tic[i] = lorentzian(i, fourth) + 2* lorentzian(i, 2*fourth) + lorentzian(i, 3*fourth) + 2* lorentzian(i, 4*fourth) + lorentzian(i, 5*fourth)+ 2* lorentzian(i, 6*fourth) + lorentzian(i, 7*fourth)+ 2* lorentzian(i, 8*fourth) + lorentzian(i, 9*fourth)+ 2* lorentzian(i, 10*fourth);
        }
        var ans = gsd(times, tic, {
            noiseLevel: 0,
            realTopDetection: false,
            smoothY: false,
            sgOptions: {windowSize: 5, polynomial: 3}
        });

        ans.length.should.equal(10);

    });
});


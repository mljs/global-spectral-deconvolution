'use strict';


var gsd = require("..");


describe('Global spectra deconvolution', function () {

    // Test case obtained from Pag 443, Chap 8.
    it('Should provide the right result ...', function () {


        var result = gsd([1,2,3,4,5],[1,1,2,1,1], 0.2, 2);

        console.log(result);

    });
});



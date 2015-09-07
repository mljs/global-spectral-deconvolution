'use strict';

var fs = require('fs');

var gsd = require("../src/gsdLight");
var optimizePeaks = require("../src/optimize");
var parser = require('xy-parser');
var Stat = require('ml-stat');




//describe('Global spectra deconvolution2', function () {


    //var spectrum=parser.parse(fs.readFileSync('./test/ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    var d = new Date();
    var n = d.getTime();
    var spectrum=parser.parse(fs.readFileSync('./ubiquitin.txt', 'utf-8'), {arrayType: 'xxyy'});
    d = new Date();
    console.log("Parsing time: "+(d.getTime()-n));
    var noiseLevel=Stat.array.median(spectrum[1].filter(function(a) {return (a>0)}));
    //console.log("noiseLevel "+noiseLevel);
    /*var x = [];
    var y = [];
    for(var i=2900;i<2923;i++){
        x.push(spectrum[0][i]);
        y.push(spectrum[1][i]);
    }
    spectrum[0]=x;
    spectrum[1]=y;
    console.log(spectrum);*/
    var result = gsd(spectrum[0],spectrum[1], {noiseLevel: 0, minMaxRatio:0, broadRatio:0});
    //console.log(result);
    d = new Date();
    console.log("Parsing + gsd time: "+(d.getTime()-n));
    /*var resultX = [];
    for(var i=0;i<result.length;i++){
        if(Math.abs(result[i].x-239.15)<0.2)
            resultX.push(result[i]);
    }
    result = resultX;
    console.log(resultX);*/
    result = optimizePeaks(result,spectrum[0],spectrum[1],2);
    d = new Date();
    console.log("Parsing + gsd + optimization time: "+(d.getTime()-n));
    //console.log(result);

    for(var i=0;i<1500;i++){
        //if(result[i].width<0.05)
        console.log(result[i].x+" "+result[i].width);
    }
    console.log(result.length);

    // Test case obtained from Pag 443, Chap 8.
   /* it('Should provide the right result ...', function () {
        //var result = gsd(spectrum[0],spectrum[1], 0.001, 0.1);
        //console.log(result);

    });*/
//});



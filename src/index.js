'use strict';

var OL=require('ml-optimize-lorentzian');

/*
This function only works if the distance on X is always the same
options:
* rangeX = ?????? (16/spectrum.observeFrequencyX();)
*
 */

function gsd(x, y, options){
    var options=options || {};
    options.abc=1234;
    if (options.minMaxRatio===undefined) options.minMaxRatio=0.00025;
    if (options.broadRatio===undefined) options.broadRatio=0.0025;
    if (options.noiseLevel===undefined) options.noiseLevel=0;
    if (options.maxCriteria===undefined) options.maxCriteria=true;

    //TODO Find a better way to do it.
    if (options.functionType === undefined) options.functionType = "lorentzian";
    //Lorentzian by default
    var widthCorrection = 1.04720;// From http://mathworld.wolfram.com/LorentzianFunction.html
    if(options.functionType === "gaussian")
        widthCorrection = 1.17741; // From https://en.wikipedia.org/wiki/Gaussian_function#Properties

    //Lets remove the noise for better performance
    // but for this we need to make a copy of the data !
    // for big arrays the faters seems to be: http://jsperf.com/clone-array-slice-vs-while-vs-for/3
    if (options.noiseLevel>0) {
        y=[].concat(y);
        for (var i=0; i<y.length; i++){
            if(Math.abs(y[i])<options.noiseLevel) {
                y[i]=0;
            }
        }
    }


    var dx = x[1]-x[0];
    // fill convolution frequency axis
    var X = [];//x[2:(x.length-2)];

    // fill Savitzky-Golay polynomes
    var size= x.length-4;
    var Y = new Array(size);
    var dY = new Array(size);
    var ddY = new Array(size);
    var counter=0;

    for (var j = 2; j < size+2; j++) {
        Y[j-2]=(1/35.0)*(-3*y[j-2] + 12*y[j-1] + 17*y[j] + 12*y[j+1] - 3*y[j+2]);
        X[j-2]=x[j];
        dY[j-2]=(1/(12*dx))*(y[j-2] - 8*y[j-1] + 8*y[j+1] - y[j+2]);
        ddY[j-2]=(1/(7*dx*dx))*(2*y[j-2] - y[j-1] - 2*y[j] - y[j+1] + 2*y[j+2]);
    }
    //console.log(Y);
    // pushs max and min points in convolution functions

    var maxDdy=0;
    var maxY = 0;
    //console.log(Y.length);
    for (var i = 0; i < Y.length ; i++){
        if(Math.abs(ddY[i])>maxDdy){
            maxDdy = Math.abs(ddY[i]);
        }
        if(Math.abs(Y[i])>maxY){
            maxY = Math.abs(Y[i]);
        }
    }
    //console.log(maxY+"x"+maxDy+"x"+maxDdy);
    var minddY = new Array();
    var broadMask = new Array();
    var intervals = new Array();
    var lastMax = null;
    var lastMin = null;
    console.log("dx "+dx);
    for (var i = 1; i < Y.length -1 ; i++){
        if ((dY[i] < dY[i-1]) && (dY[i] <= dY[i+1])||
            (dY[i] <= dY[i-1]) && (dY[i] < dY[i+1])) {
            lastMin = X[i];
            //console.log("min "+lastMin);
            if(dx>0&&lastMax!=null){
                intervals.push( [lastMax , lastMin] );
            }
        }

        if ((dY[i] >= dY[i-1]) && (dY[i] > dY[i+1])||
            (dY[i] > dY[i-1]) && (dY[i] >= dY[i+1])) {
            lastMax = X[i];
            //console.log("max "+lastMax);
            if(dx<0&&lastMin!=null){
                intervals.push( [lastMax , lastMin] );
            }
        }
        if(options.maxCriteria){
            if ((ddY[i] < ddY[i-1]) && (ddY[i] < ddY[i+1])) {
                minddY.push( [X[i], Y[i], i] );  // TODO should we change this to have 3 arrays ? Huge overhead creating arrays
                if(Math.abs(ddY[i])>options.broadRatio*maxDdy){ // TODO should this be a parameter =
                    broadMask.push(false);
                }
                else{
                    broadMask.push(true);
                }
            }
        }
        else{
            if ((ddY[i] > ddY[i-1]) && (ddY[i] > ddY[i+1])) {
                minddY.push( [X[i], Y[i], i] );  // TODO should we change this to have 3 arrays ? Huge overhead creating arrays
                if(Math.abs(ddY[i])>options.broadRatio*maxDdy){ // TODO should this be a parameter =
                    broadMask.push(false);
                }
                else{
                    broadMask.push(true);
                }
            }
        }
    }
    //console.log(minddY);
    // creates a list with (frequency, linewith, height)
    dx = Math.abs(dx);
    //var signalsS = new Array();
    var signals = new Array();
    var broadLines=[[Number.MAX_VALUE,0,0]];

    //Y.sort(function(a, b){return b-a});
    //console.log(Y[0]);
    for (var j = 0; j < minddY.length; j++){
        var f = minddY[j];
        var frequency = f[0];
        var possible = new Array();
        for (var k=0;k<intervals.length;k++){
            var i = intervals[k];
            //if (frequency > i[0] && frequency < i[1])
            if(Math.abs(frequency-(i[0]+i[1])/2)<Math.abs(i[0]-i[1])/2)
                possible.push(i);
        }
        //console.log("possible "+possible.length);
        if (possible.length > 0)
            if (possible.length == 1)
            {
                var inter = possible[0];
                var linewidth = Math.abs(inter[1] - inter[0])*widthCorrection;
                var height = f[1];
                if (Math.abs(height) > options.minMaxRatio*maxY){
                    if(!broadMask[j]){
                        signals.push([frequency, height, linewidth]);
                        //signalsS.push([frequency, height]);
                    }
                    else{
                        broadLines.push([frequency, height, linewidth]);
                    }
                }
            }
            else
            {
                //TODO: nested peaks
                //console.log("Nested "+possible);
            }
    }

    //console.log(x.length)
    //console.log(broadLines.length)
    //console.log(signalsS);
    //Optimize the possible broad lines
    var max=0, maxI=0,count=0;
    var candidates = [],broadLinesS=[];
    var isPartOf = false;

    for(var i=broadLines.length-1;i>0;i--){
        //console.log(broadLines[i][0]+" "+rangeX+" "+Math.abs(broadLines[i-1][0]-broadLines[i][0]));
        if(Math.abs(broadLines[i-1][0]-broadLines[i][0])<rangeX){

            candidates.push(broadLines[i]);
            if(broadLines[i][1]>max){
                max = broadLines[i][1];
                maxI = i;
            }
            count++;
        }
        else{
            isPartOf = true;
            if(count>30){ // TODO, an options ?
                isPartOf = false;
                /*for(var j=0;j<signals.length;j++){
                 if(Math.abs(broadLines[maxI][0]-signals[j][0])<rangeX)
                 isPartOf = true;
                 }
                 console.log("Was part of "+isPartOf);*/
            }
            if(isPartOf){
                for(var j=0;j<candidates.length;j++){
                    signals.push([candidates[j][0], candidates[j][1], dx]);
                }
            }
            else{
                var fitted =  [];//this.optimizeLorentzian(candidates);
                //console.log(fitted);
                signals.push(fitted);
                //signalsS.push([fitted[0], fitted[1]]);
                //console.log(fitted[0]+" "+fitted[2]+" "+fitted[1]);
                //broadLinesS.push([fitted[0], fitted[1]]);
            }
            candidates = [];
            max = 0;
            maxI = 0;
            count = 0;
        }
    }
    signals.sort(function (a, b) {
        return a[0] - b[0];
    });

    return signals;
}

module.exports=gsd;


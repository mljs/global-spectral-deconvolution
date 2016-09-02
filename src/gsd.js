var Opt = require("ml-optimize-lorentzian");
var stats = require("ml-stat");
var extend = require('extend');
var SG = require('ml-savitzky-golay-generalized');

var sgDefOptions = {
    windowSize: 9,
    polynomial: 3
};


function gsd(x, yIn, options){
    //options = extend({}, defaultOptions, options);
    var options=Object.create(options || {});
    if (options.minMaxRatio===undefined) options.minMaxRatio=0.00025;
    if (options.broadRatio===undefined) options.broadRatio=0.00;
    if (options.noiseLevel===undefined) options.noiseLevel=undefined;
    if (options.noiseFactor===undefined) options.noiseFactor=3;
    if (options.maxCriteria===undefined) options.maxCriteria=true;
    if (options.smoothY===undefined) options.smoothY=true;
    if (options.realTopDetection===undefined) options.realTopDetection=false;

    var sgOptions = extend({}, sgDefOptions, options.sgOptions);
    const y = [].concat(yIn);

    var i, j, k;

    if(options.noiseLevel === undefined){
        //We have to know if x is equally spaced
        var maxDx = 0, minDx = Number.MAX_VALUE, tmp;
        for(i = 0;i < x.length - 1; i++) {
            tmp = Math.abs(x[i+1] - x[i]);
            if(tmp < minDx) {
                minDx = tmp;
            }
            if(tmp > maxDx) {
                maxDx = tmp;
            }
        }

        if((maxDx-minDx)/maxDx < 0.05) {
            options.noiseLevel = getNoiseLevel(y);
        }
        else {
            options.noiseLevel = 0;
        }
    }
    const yCorrection = {m:1, b:options.noiseLevel};
    if(!options.maxCriteria) {
        yCorrection.m =-1;
        yCorrection.b*=-1;
    }

    for (i = 0; i < y.length; i++) {
        y[i] = yCorrection.m*y[i]-yCorrection.b;
    }

    for (i = 0; i < y.length; i++) {
        if (y[i] < 0) {
            y[i] = 0;
        }
    }
    //If the max difference between delta x is less than 5%, then, we can assume it to be equally spaced variable
    var Y = y;
    var dY, ddY;
    if((maxDx-minDx)/maxDx < 0.05) {
        if(options.smoothY)
            Y = SG(y, x[1]-x[0], {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:0});
        dY = SG(y, x[1]-x[0], {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:1});
        ddY = SG(y, x[1]-x[0], {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:2});
    }
    else {
        if(options.smoothY)
            Y = SG(y, x, {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:0});
        dY = SG(y, x, {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:1});
        ddY = SG(y, x, {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:2});
    }

    const X = x;
    const dx = x[1] - x[0];
    var maxDdy = 0;
    var maxY = 0;
    for (i = 0; i < Y.length ; i++) {
        if(Math.abs(ddY[i]) > maxDdy) {
            maxDdy = Math.abs(ddY[i]);
        }
        if(Math.abs(Y[i]) > maxY) {
            maxY = Math.abs(Y[i]);
        }
    }

    var minddY = [];
    var intervalL = [];
    var intervalR = [];
    var lastMax = null;
    var lastMin = null;
    var broadMask = new Array();
    //By the intermediate value theorem We cannot find 2 consecutive maxima or minima
    for (i = 1; i < Y.length -1 ; i++){
        //console.log(dY[i]);
        if ((dY[i] < dY[i-1]) && (dY[i] <= dY[i+1]) ||
            (dY[i] <= dY[i-1]) && (dY[i] < dY[i+1])) {
            lastMin = X[i];
            if(dx > 0 && lastMax != null) {
                intervalL.push(lastMax);
                intervalR.push(lastMin);

            }
        }

        if ((dY[i] >= dY[i-1]) && (dY[i] > dY[i+1]) ||
            (dY[i] > dY[i-1]) && (dY[i] >= dY[i+1])) {
            lastMax = X[i];
            if(dx < 0 && lastMin != null) {
                intervalL.push(lastMax);
                intervalR.push(lastMin);
            }
        }
        if ((ddY[i] < ddY[i-1]) && (ddY[i] < ddY[i+1])) {
            minddY.push(i);//( [X[i], Y[i], i] );  // TODO should we change this to have 3 arrays ? Huge overhead creating arrays
            if(Math.abs(ddY[i]) > options.broadRatio*maxDdy) { // TODO should this be a parameter =
                broadMask.push(false);
            }
            else {
                broadMask.push(true);
            }
        }
    }

    var signals = [];
    var lastK = 0;
    var possible, frequency, distanceJ, minDistance, gettingCloser;
    for (j = 0; j < minddY.length; j++) {
        frequency = X[minddY[j]];
        possible = -1;
        k = lastK + 1;
        minDistance = Number.MAX_VALUE;
        distanceJ = 0;
        gettingCloser=true;
        while(possible == -1 && k < intervalL.length && gettingCloser) {
            distanceJ = Math.abs(frequency-(intervalL[k]+intervalR[k])/2);
            //Still getting closer?
            if(distanceJ < minDistance) {
                minDistance = distanceJ;
            }
            else{
                gettingCloser = false;
            }
            if( distanceJ < Math.abs(intervalL[k]-intervalR[k])/2) {
                possible = k;
                lastK = k;
            }
            k++;
        }
        if (possible != -1) {
            if (Math.abs(Y[minddY[j]]) > options.minMaxRatio*maxY) {
                signals.push({
                    i:minddY[j],
                    x: frequency,
                    y: (Y[minddY[j]]+yCorrection.b)/yCorrection.m,
                    width:Math.abs(intervalR[possible] - intervalL[possible]),//widthCorrection
                    soft:broadMask[j]
                })
            }
        }
    }


    if(options.realTopDetection) {
        realTopDetection(signals,X,Y);
    }

    //Correct the values to fit the original spectra data
    for(j = 0;j < signals.length; j++) {
        signals[j].base = options.noiseLevel;
    }

    signals.sort(function (a, b) {
        return a.x - b.x;
    });

    return signals;

}

function getNoiseLevel(y) {
    var mean = 0, stddev = 0;
    var length = y.length, i = 0;
    for(i = 0; i < length; i++) {
        mean += y[i];
    }
    mean/=length;
    var averageDeviations = new Array(length);
    for (i = 0; i < length; i++)
        averageDeviations[i] = Math.abs(y[i] - mean);
    averageDeviations.sort();
    if (length % 2 == 1) {
        stddev = averageDeviations[(length-1)/2] / 0.6745;
    } else {
        stddev = 0.5*(averageDeviations[length/2]+averageDeviations[length/2-1]) / 0.6745;
    }

    return stddev;
}

function realTopDetection(peakList, x, y) {
    var alpha, beta, gamma, p,currentPoint;
    for(var j = 0; j < peakList.length; j++) {
        currentPoint = peakList[j].i;//peakList[j][2];
        //The detected peak could be moved 1 or 2 unit to left or right.
        if(y[currentPoint-1] >= y[currentPoint-2]
            && y[currentPoint-1] >= y[currentPoint]) {
            currentPoint--;
        }
        else {
            if(y[currentPoint+1] >= y[currentPoint]
                && y[currentPoint+1] >= y[currentPoint+2]) {
                currentPoint++;
            }
            else{
                if(y[currentPoint-2] >= y[currentPoint-3]
                    && y[currentPoint-2] >= y[currentPoint-1]) {
                    currentPoint-=2;
                }
                else {
                    if(y[currentPoint+2] >= y[currentPoint+1]
                        && y[currentPoint+2] >= y[currentPoint+3]) {
                        currentPoint+=2;
                    }
                }
            }
        }
        if(y[currentPoint-1] > 0 && y[currentPoint+1] > 0
            && y[currentPoint] >= y[currentPoint-1]
            && y[currentPoint] >= y[currentPoint+1]) {
            alpha = 20 * Math.log10(y[currentPoint - 1]);
            beta = 20 * Math.log10(y[currentPoint]);
            gamma = 20 * Math.log10(y[currentPoint + 1]);
            p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
            //console.log("p: "+p);
            //console.log(x[currentPoint]+" "+tmp+" "+currentPoint);
            peakList[j].x = x[currentPoint] + (x[currentPoint]-x[currentPoint-1])*p;
            peakList[j].y = y[currentPoint] - 0.25 * (y[currentPoint - 1]
                - y[currentPoint + 1]) * p;//signal.peaks[j].intensity);
        }
    }
}

module.exports=gsd;

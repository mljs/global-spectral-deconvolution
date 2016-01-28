var Opt = require("ml-optimize-lorentzian");
var stats = require("ml-stat");
var extend = require('extend');
var SG = require('ml-savitzky-golay-generalized');

var sgDefOptions = {
    windowSize: 5,
    polynomial: 3
};


function gsd(x, y, options){
    //options = extend({}, defaultOptions, options);
    var options=Object.create(options || {});
    if (options.minMaxRatio===undefined) options.minMaxRatio=0.00025;
    if (options.broadRatio===undefined) options.broadRatio=0.00;
    if (options.noiseLevel===undefined) options.noiseLevel=0;
    if (options.maxCriteria===undefined) options.maxCriteria=true;
    if (options.smoothY===undefined) options.smoothY=true;
    if (options.realTopDetection===undefined) options.realTopDetection=false;

    var sgOptions = extend({}, sgDefOptions, options.sgOptions);

    //Transform y to use the standard algorithm.
    var yCorrection = {m:1, b:0};
    if(!options.maxCriteria||options.noiseLevel>0){
        y=[].concat(y);
        if(!options.maxCriteria){
            yCorrection = {m:-1, b:stats.array.max(y)};
            for (var i=0; i<y.length; i++){
                y[i]=-y[i]+yCorrection.b;
            }
            options.noiseLevel=-options.noiseLevel+yCorrection.b;
        }
        if (options.noiseLevel>0) {
            for (var i=0; i<y.length; i++){
                if(Math.abs(y[i])<options.noiseLevel) {
                    y[i]=0;
                }
            }
        }
    }

    //We have to know if x is equally spaced
    var maxDx=0, minDx=Number.MAX_VALUE,tmp;
    for(var i=0;i< x.length-1;i++){
        var tmp = Math.abs(x[i+1]-x[i]);
        if(tmp<minDx){
            minDx = tmp;
        }
        if(tmp>maxDx){
            maxDx = tmp;
        }
    }
    //If the max difference between delta x is less than 5%, then, we can assume it to be equally spaced variable
    if((maxDx-minDx)/maxDx<0.05){
        var Y = SG(y, x[1]-x[0], {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:0});
        var dY = SG(y, x[1]-x[0], {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:1});
        var ddY = SG(y, x[1]-x[0], {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:2});
    }
    else{
        var Y = SG(y, x, {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:0});
        var dY = SG(y, x, {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:1});
        var ddY = SG(y, x, {windowSize:sgOptions.windowSize, polynomial:sgOptions.polynomial,derivative:2});
    }
    
    var X = x;
    var dx = x[1]-x[0];
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
    var minddY = [];
    var intervals = [];
    var lastMax = null;
    var lastMin = null;
    var broadMask = new Array();
    //console.log(dx);
    //By the intermediate value theorem We cannot find 2 consecutive maxima or minima
    for (var i = 1; i < Y.length -1 ; i++){
        //console.log(dY[i]);
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
    if(options.realTopDetection){
        realTopDetection(minddY,X,Y);
    }
    //
    //console.log(intervals);
    var signals = [];

    for (var j = 0; j < minddY.length; j++){
        var f = minddY[j];
        var frequency = f[0];
        var possible = [];
        for (var k=0; k<intervals.length; k++){
            var i = intervals[k];
            if(Math.abs(frequency-(i[0]+i[1])/2)<Math.abs(i[0]-i[1])/2)
                possible.push(i);
        }
        //console.log("possible "+possible.length);
        if (possible.length > 0)
            if (possible.length == 1)
            {
                var inter = possible[0];
                var linewidth = Math.abs(inter[1] - inter[0]);
                var height = f[1];
                //console.log(height);
                if (Math.abs(height) > options.minMaxRatio*maxY) {
                    signals.push({
                        x: frequency,
                        y: (height-yCorrection.b)/yCorrection.m,
                        width: linewidth,//*widthCorrection
                        soft:broadMask[j]
                    })
                }
            }
            else
            {
                //TODO: nested peaks
                // console.log("Nested "+possible);
            }
    }

    signals.sort(function (a, b) {
        return a.x - b.x;
    });


    return signals;
}

function realTopDetection(peakList, x, y){
    var listP = [];
    var alpha, beta, gamma, p,currentPoint;
    for(var j=0;j<peakList.length;j++){
        currentPoint = peakList[j][2];
        //The detected peak could be moved 1 or 2 unit to left or right.
        if(y[currentPoint-1]>=y[currentPoint-2]
            &&y[currentPoint-1]>=y[currentPoint]) {
            currentPoint--;
        }
        else{
            if(y[currentPoint+1]>=y[currentPoint]
                &&y[currentPoint+1]>=y[currentPoint+2]) {
                currentPoint++;
            }
            else{
                if(y[currentPoint-2]>=y[currentPoint-3]
                    &&y[currentPoint-2]>=y[currentPoint-1]) {
                    currentPoint-=2;
                }
                else{
                    if(y[currentPoint+2]>=y[currentPoint+1]
                        &&y[currentPoint+2]>=y[currentPoint+3]) {
                        currentPoint+=2;
                    }
                }
            }
        }
        if(y[currentPoint-1]>0&&y[currentPoint+1]>0
            &&y[currentPoint]>=y[currentPoint-1]
            &&y[currentPoint]>=y[currentPoint+1]) {
            alpha = 20 * Math.log10(y[currentPoint - 1]);
            beta = 20 * Math.log10(y[currentPoint]);
            gamma = 20 * Math.log10(y[currentPoint + 1]);
            p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);

            peakList[j][0] = x[currentPoint] + (x[currentPoint]-x[currentPoint-1])*p;
            peakList[j][1] = y[currentPoint] - 0.25 * (y[currentPoint - 1]
                - [currentPoint + 1]) * p;//signal.peaks[j].intensity);
        }
    }
}

module.exports=gsd;

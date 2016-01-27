var Opt = require("ml-optimize-lorentzian");
var stats = require("ml-stat");
function gsd(x, y, options){
    var options=Object.create(options || {});
    if (options.minMaxRatio===undefined) options.minMaxRatio=0.00025;
    if (options.broadRatio===undefined) options.broadRatio=0.00;
    if (options.noiseLevel===undefined) options.noiseLevel=0;
    if (options.maxCriteria===undefined) options.maxCriteria=true;
    if (options.smoothY===undefined) options.smoothY=true;
    if (options.realTopDetection===undefined) options.realTopDetection=false;


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
    // fill convolution frequency axis
    var X = [];//x[2:(x.length-2)];

    // fill Savitzky-Golay polynomes
    var size= x.length-4;
    var Y = new Array(size);
    var dY = new Array(size);
    var ddY = new Array(size);
    //var dX = new Array(size);
    var dx = x[1]-x[0];

    for (var j = 2; j < size+2; j++) {
        dx = x[j]-x[j-1];
        if(options.smoothY)
            Y[j-2]=(1/35.0)*(-3*y[j-2] + 12*y[j-1] + 17*y[j] + 12*y[j+1] - 3*y[j+2]);
        else
            Y[j-2]=y[j];
        X[j-2]=x[j];
        dY[j-2]=(1/(12*dx))*(y[j-2] - 8*y[j-1] + 8*y[j+1] - y[j+2]);
        ddY[j-2]=(1/(7*dx*dx))*(2*y[j-2] - y[j-1] - 2*y[j] - y[j+1] + 2*y[j+2]);
    }

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
    /*if(options.broadRatio>0){
        var broadLines=[[Number.MAX_VALUE,0,0]];
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
                    //for(var j=0;j<signals.length;j++){
                    //    if(Math.abs(broadLines[maxI][0]-signals[j][0])<rangeX)
                    //       isPartOf = true;
                    //    }
                    //console.log("Was part of "+isPartOf);
                }
                if(isPartOf){
                    for(var j=0;j<candidates.length;j++){
                        signals.push([candidates[j][0], candidates[j][1], dx]);
                    }
                }
                else{
                    var fitted =  Opt.optimizeSingleLorentzian(candidates,{x:candidates[maxI][0],
                        width:Math.abs(candidates[0][0]-candidates[candidates.length-1][0])},
                        []);
                    //console.log(fitted);
                    signals.push([fitted[0][0],fitted[0][1],fitted[0][2]]);
                }
                candidates = [];
                max = 0;
                maxI = 0;
                count = 0;
            }
        }
    }*/

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

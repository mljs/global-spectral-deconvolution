
function gsdLight(x, y, options){
    var options=Object.create(options || {});
    if (options.minMaxRatio===undefined) options.minMaxRatio=0.00025;
    if (options.noiseLevel===undefined) options.noiseLevel=0;
    if (options.maxCriteria===undefined) options.maxCriteria=true;


    if (options.noiseLevel>0) {
        y=[].concat(y);
        for (var i=0; i<y.length; i++){
            if(Math.abs(y[i])<options.noiseLevel) {
                y[i]=0;
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
        /*dx = 0;
        dX[j-2] = x[j]-x[j-1];
        for(k=-1;k<=2;k++)
            dx+=x[j-k+1]-x[j-k];
        dx/=4;*/
        dx = x[j]-x[j-1];
        Y[j-2]=(1/35.0)*(-3*y[j-2] + 12*y[j-1] + 17*y[j] + 12*y[j+1] - 3*y[j+2]);
        X[j-2]=x[j];
        dY[j-2]=(1/(12*dx))*(y[j-2] - 8*y[j-1] + 8*y[j+1] - y[j+2]);
        ddY[j-2]=(1/(7*dx*dx))*(2*y[j-2] - y[j-1] - 2*y[j] - y[j+1] + 2*y[j+2]);

        /*if(Math.max(dx,dX[j-2])/Math.min(dx,dX[j-2])>1.00001){

            Y[j-2]=0;

        }*/

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

        if(options.maxCriteria){
            //The peaks are considered the local maximum of the signal. i.e: NMR, MASS
            if ((ddY[i] < ddY[i-1]) && (ddY[i] < ddY[i+1])) {
                minddY.push( [X[i], Y[i], i] );  // TODO should we change this to have 3 arrays ? Huge overhead creating arrays
            }
        }
        else{
            //The peaks are considered the local maximum of the signal. i.e: Absorption IR
            if ((ddY[i] > ddY[i-1]) && (ddY[i] > ddY[i+1])) {
                minddY.push( [X[i], Y[i], i] );  // TODO should we change this to have 3 arrays ? Huge overhead creating arrays
            }
        }

    }
    //console.log(intervals);
    //console.log(minddY);
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
                        y: height,
                        width: linewidth//*widthCorrection
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

module.exports=gsdLight;

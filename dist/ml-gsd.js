/**
 * ml-gsd - Global Spectra Deconvolution
 * @version v0.0.1
 * @link https://github.com/mljs/global-spectra-deconvolution
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.mlGsd=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports.optimize = require("../src/optimize");
module.exports.gsd = require("../src/gsd");

},{"../src/gsd":15,"../src/optimize":16}],2:[function(require,module,exports){
/**
 * Created by acastillo on 8/5/15.
 */
var Matrix = require("ml-matrix");
var math = require("./algebra");

var DEBUG = false;
/** Levenberg Marquardt curve-fitting: minimize sum of weighted squared residuals
 ----------  INPUT  VARIABLES  -----------
 func   = function of n independent variables, 't', and m parameters, 'p',
 returning the simulated model: y_hat = func(t,p,c)
 p      = n-vector of initial guess of parameter values
 t      = m-vectors or matrix of independent variables (used as arg to func)
 y_dat  = m-vectors or matrix of data to be fit by func(t,p)
 weight = weighting vector for least squares fit ( weight >= 0 ) ...
 inverse of the standard measurement errors
 Default:  sqrt(d.o.f. / ( y_dat' * y_dat ))
 dp     = fractional increment of 'p' for numerical derivatives
 dp(j)>0 central differences calculated
 dp(j)<0 one sided 'backwards' differences calculated
 dp(j)=0 sets corresponding partials to zero; i.e. holds p(j) fixed
 Default:  0.001;
 p_min  = n-vector of lower bounds for parameter values
 p_max  = n-vector of upper bounds for parameter values
 c      = an optional matrix of values passed to func(t,p,c)
 opts   = vector of algorithmic parameters
 parameter    defaults    meaning
 opts(1)  =  prnt            3        >1 intermediate results; >2 plots
 opts(2)  =  MaxIter      10*Npar     maximum number of iterations
 opts(3)  =  epsilon_1       1e-3     convergence tolerance for gradient
 opts(4)  =  epsilon_2       1e-3     convergence tolerance for parameters
 opts(5)  =  epsilon_3       1e-3     convergence tolerance for Chi-square
 opts(6)  =  epsilon_4       1e-2     determines acceptance of a L-M step
 opts(7)  =  lambda_0        1e-2     initial value of L-M paramter
 opts(8)  =  lambda_UP_fac   11       factor for increasing lambda
 opts(9)  =  lambda_DN_fac    9       factor for decreasing lambda
 opts(10) =  Update_Type      1       1: Levenberg-Marquardt lambda update
 2: Quadratic update
 3: Nielsen's lambda update equations

 ----------  OUTPUT  VARIABLES  -----------
 p       = least-squares optimal estimate of the parameter values
 X2      = Chi squared criteria
 sigma_p = asymptotic standard error of the parameters
 sigma_y = asymptotic standard error of the curve-fit
 corr    = correlation matrix of the parameters
 R_sq    = R-squared cofficient of multiple determination
 cvg_hst = convergence history

 Henri Gavin, Dept. Civil & Environ. Engineering, Duke Univ. 22 Sep 2013
 modified from: http://octave.sourceforge.net/optim/function/leasqr.html
 using references by
 Press, et al., Numerical Recipes, Cambridge Univ. Press, 1992, Chapter 15.
 Sam Roweis       http://www.cs.toronto.edu/~roweis/notes/lm.pdf
 Manolis Lourakis http://www.ics.forth.gr/~lourakis/levmar/levmar.pdf
 Hans Nielson     http://www2.imm.dtu.dk/~hbn/publ/TR9905.ps
 Mathworks        optimization toolbox reference manual
 K. Madsen, H.B., Nielsen, and O. Tingleff
 http://www2.imm.dtu.dk/pubdb/views/edoc_download.php/3215/pdf/imm3215.pdf
 */
var LM = {

    optimize: function(func,p,t,y_dat,weight,dp,p_min,p_max,c,opts){

        var tensor_parameter = 0;			// set to 1 of parameter is a tensor

        var iteration  = 0;			// iteration counter
        //func_calls = 0;			// running count of function evaluations

        if((typeof p[0])!="object"){
            for(var i=0;i< p.length;i++){
                p[i]=[p[i]];
            }

        }
        //p = p(:); y_dat = y_dat(:);		// make column vectors
        var i,k;
        var eps = 2^-52;
        var Npar   = p.length;//length(p); 			// number of parameters
        var Npnt   = y_dat.length;//length(y_dat);		// number of data points
        var p_old  = Matrix.zeros(Npar,1);		// previous set of parameters
        var y_old  = Matrix.zeros(Npnt,1);		// previous model, y_old = y_hat(t;p_old)
        var X2     = 1e-2/eps;			// a really big initial Chi-sq value
        var X2_old = 1e-2/eps;			// a really big initial Chi-sq value
        var J =  Matrix.zeros(Npnt,Npar);


        if (t.length != y_dat.length) {
            console.log('lm.m error: the length of t must equal the length of y_dat');

            length_t = t.length;
            length_y_dat = y_dat.length;
            var X2 = 0, corr = 0, sigma_p = 0, sigma_y = 0, R_sq = 0, cvg_hist = 0;
            if (!tensor_parameter) {
                return;
            }
        }

        weight = weight||Math.sqrt((Npnt-Npar+1)/(math.multiply(math.transpose(y_dat),y_dat)));
        dp = dp || 0.001;
        p_min   = p_min || math.multiply(Math.abs(p),-100);
        p_max   = p_max || math.multiply(Math.abs(p),100);
        c = c || 1;
        // Algorithmic Paramters
        //prnt MaxIter  eps1  eps2  epx3  eps4  lam0  lamUP lamDN UpdateType
        opts = opts ||[  3,10*Npar, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 1 ];

        var prnt          = opts[0];	// >1 intermediate results; >2 plots
        var MaxIter       = opts[1];	// maximum number of iterations
        var epsilon_1     = opts[2];	// convergence tolerance for gradient
        var epsilon_2     = opts[3];	// convergence tolerance for parameter
        var epsilon_3     = opts[4];	// convergence tolerance for Chi-square
        var epsilon_4     = opts[5];	// determines acceptance of a L-M step
        var lambda_0      = opts[6];	// initial value of damping paramter, lambda
        var lambda_UP_fac = opts[7];	// factor for increasing lambda
        var lambda_DN_fac = opts[8];	// factor for decreasing lambda
        var Update_Type   = opts[9];	// 1: Levenberg-Marquardt lambda update
        // 2: Quadratic update
        // 3: Nielsen's lambda update equations

        if ( tensor_parameter && prnt == 3 ) prnt = 2;


        if(!dp.length || dp.length == 1){
            var dp_array = new Array(Npar);
            for(var i=0;i<Npar;i++)
                dp_array[i]=[dp];
            dp=dp_array;
        }

        // indices of the parameters to be fit
        var idx   = [];
        for(i=0;i<dp.length;i++){
            if(dp[i][0]!=0){
                idx.push(i);
            }
        }

        var Nfit = idx.length;			// number of parameters to fit
        var stop = false;				// termination flag

        var weight_sq = null;
        //console.log(weight);
        if ( !weight.length || weight.length < Npnt )	{
            // squared weighting vector
            //weight_sq = ( weight(1)*ones(Npnt,1) ).^2;
            //console.log("weight[0] "+typeof weight[0]);
            var tmp = math.multiply(Matrix.ones(Npnt,1),weight[0]);
            weight_sq = math.dotMultiply(tmp,tmp);
        }
        else{
            //weight_sq = (weight(:)).^2;
            weight_sq = math.dotMultiply(weight,weight);
        }


        // initialize Jacobian with finite difference calculation
        //console.log("J "+weight_sq);
        var result = this.lm_matx(func,t,p_old,y_old,1,J,p,y_dat,weight_sq,dp,c);
        var JtWJ = result.JtWJ,JtWdy=result.JtWdy,X2=result.Chi_sq,y_hat=result.y_hat,J=result.J;
        //[JtWJ,JtWdy,X2,y_hat,J] = this.lm_matx(func,t,p_old,y_old,1,J,p,y_dat,weight_sq,dp,c);
        //console.log(JtWJ);

        if ( Math.max(Math.abs(JtWdy)) < epsilon_1 ){
            console.log(' *** Your Initial Guess is Extremely Close to Optimal ***')
            console.log(' *** epsilon_1 = ', epsilon_1);
            stop = true;
        }


        switch(Update_Type){
            case 1: // Marquardt: init'l lambda
                lambda  = lambda_0;
                break;
            default:    // Quadratic and Nielsen
                lambda  = lambda_0 * Math.max(math.diag(JtWJ));
                nu=2;
        }
        //console.log(X2);
        X2_old = X2; // previous value of X2
        //console.log(MaxIter+" "+Npar);
        //var cvg_hst = Matrix.ones(MaxIter,Npar+3);		// initialize convergence history
        var h = null;
        while ( !stop && iteration <= MaxIter ) {		// --- Main Loop
            iteration = iteration + 1;
            // incremental change in parameters
            switch(Update_Type){
                case 1:					// Marquardt
                    //h = ( JtWJ + lambda * math.diag(math.diag(JtWJ)) ) \ JtWdy;
                    //h = math.multiply(math.inv(JtWdy),math.add(JtWJ,math.multiply(lambda,math.diag(math.diag(Npar)))));
                    h = math.solve(math.add(JtWJ,math.multiply(math.diag(math.diag(JtWJ)),lambda)),JtWdy);
                    break;
                default:					// Quadratic and Nielsen
                    //h = ( JtWJ + lambda * math.eye(Npar) ) \ JtWdy;

                    h = math.solve(math.add(JtWJ,math.multiply( Matrix.eye(Npar),lambda)),JtWdy);
            }

            /*for(var k=0;k< h.length;k++){
             h[k]=[h[k]];
             }*/
            //console.log("h "+h);
            //h=math.matrix(h);
            //  big = max(abs(h./p)) > 2;
            //this is a big step
            // --- Are parameters [p+h] much better than [p] ?
            var hidx = new Array(idx.length);
            for(k=0;k<idx.length;k++){
                hidx[k]=h[idx[k]];
            }
            var p_try = math.add(p, hidx);// update the [idx] elements

            for(k=0;k<p_try.length;k++){
                p_try[k][0]=Math.min(Math.max(p_min[k][0],p_try[k][0]),p_max[k][0]);
            }
            // p_try = Math.min(Math.max(p_min,p_try),p_max);           // apply constraints

            var delta_y = math.subtract(y_dat, func(t,p_try,c));       // residual error using p_try
            //func_calls = func_calls + 1;
            //X2_try = delta_y' * ( delta_y .* weight_sq );  // Chi-squared error criteria

            var X2_try = math.multiply(math.transpose(delta_y),math.dotMultiply(delta_y,weight_sq));

            if ( Update_Type == 2 ){  			  // Quadratic
                //    One step of quadratic line update in the h direction for minimum X2
                //var alpha =  JtWdy'*h / ( (X2_try - X2)/2 + 2*JtWdy'*h ) ;
                var JtWdy_th = math.multiply(math.transpose(JtWdy),h);
                var alpha =  math.multiply(JtWdy_th,math.inv(math.add(math.multiply(math.subtract(X2_try - X2),1/2)),math.multiply(JtWdy_th,2)));//JtWdy'*h / ( (X2_try - X2)/2 + 2*JtWdy'*h ) ;

                h = math.multiply(alpha, h);
                for(var k=0;k<idx.length;k++){
                    hidx[k]=h[idx[k]];
                }

                p_try = math.add(p ,hidx);                     // update only [idx] elements
                p_try = math.min(math.max(p_min,p_try),p_max);          // apply constraints

                delta_y = math.subtract(y_dat, func(t,p_try,c));      // residual error using p_try
                // func_calls = func_calls + 1;
                //X2_try = delta_y' * ( delta_y .* weight_sq ); // Chi-squared error criteria
                X2_try = math.multiply(math.transpose(delta_y), mat.dotMultiply(delta_y, weight_sq));
            }

            //rho = (X2 - X2_try) / ( 2*h' * (lambda * h + JtWdy) ); // Nielsen
            var rho = (X2-X2_try)/math.multiply(math.multiply(math.transpose(h),2),math.add(math.multiply(lambda, h),JtWdy));
            //console.log("rho "+rho);
            if ( rho > epsilon_4 ) {		// it IS significantly better
                //console.log("Here");
                dX2 = X2 - X2_old;
                X2_old = X2;
                p_old = p;
                y_old = y_hat;
                p = p_try;			// accept p_try

                result = this.lm_matx(func, t, p_old, y_old, dX2, J, p, y_dat, weight_sq, dp, c);
                JtWJ = result.JtWJ,JtWdy=result.JtWdy,X2=result.Chi_sq,y_hat=result.y_hat,J=result.J;
                // decrease lambda ==> Gauss-Newton method

                switch (Update_Type) {
                    case 1:							// Levenberg
                        lambda = Math.max(lambda / lambda_DN_fac, 1.e-7);
                        break;
                    case 2:							// Quadratic
                        lambda = Math.max(lambda / (1 + alpha), 1.e-7);
                        break;
                    case 3:							// Nielsen
                        lambda = math.multiply(Math.max(1 / 3, 1 - (2 * rho - 1) ^ 3),lambda);
                        nu = 2;
                        break;
                }
            }
            else {					// it IS NOT better
                X2 = X2_old;			// do not accept p_try
                if (iteration%(2 * Npar)==0) {	// rank-1 update of Jacobian
                    result = this.lm_matx(func, t, p_old, y_old, -1, J, p, y_dat, weight_sq, dp, c);
                    JtWJ = result.JtWJ,JtWdy=result.JtWdy,dX2=result.Chi_sq,y_hat=result.y_hat,J=result.J;
                }

                // increase lambda  ==> gradient descent method
                switch (Update_Type) {
                    case 1:							// Levenberg
                        lambda = Math.min(lambda * lambda_UP_fac, 1.e7);
                        break;
                    case 2:							// Quadratic
                        lambda = lambda + Math.abs((X2_try - X2) / 2 / alpha);
                        break;
                    case 3:						// Nielsen
                        lambda = lambda * nu;
                        nu = 2 * nu;
                        break;
                }
            }
        }// --- End of Main Loop

        // --- convergence achieved, find covariance and confidence intervals

        // equal weights for paramter error analysis
        weight_sq = math.multiply(math.multiply(math.transpose(delta_y),delta_y), Matrix.ones(Npnt,1));

        weight_sq.apply(function(i,j){
            weight_sq[i][j] = (Npnt-Nfit+1)/weight_sq[i][j];
        });
        //console.log(weight_sq);
        result = this.lm_matx(func,t,p_old,y_old,-1,J,p,y_dat,weight_sq,dp,c);
        JtWJ = result.JtWJ,JtWdy=result.JtWdy,X2=result.Chi_sq,y_hat=result.y_hat,J=result.J;

        /*if nargout > 2				// standard error of parameters
         covar = inv(JtWJ);
         sigma_p = sqrt(diag(covar));
         end

         if nargout > 3				// standard error of the fit
         //  sigma_y = sqrt(diag(J * covar * J'));	// slower version of below
         sigma_y = zeros(Npnt,1);
         for i=1:Npnt
         sigma_y(i) = J(i,:) * covar * J(i,:)';
         end
         sigma_y = sqrt(sigma_y);
         end

         if nargout > 4				// parameter correlation matrix
         corr = covar ./ [sigma_p*sigma_p'];
         end

         if nargout > 5				// coefficient of multiple determination
         R_sq = corrcoef([y_dat y_hat]);
         R_sq = R_sq(1,2).^2;
         end

         if nargout > 6				// convergence history
         cvg_hst = cvg_hst(1:iteration,:);
         end*/

        // endfunction  # ---------------------------------------------------------- LM

        return { p:p, X2:X2};
    },

    lm_FD_J:function(func,t,p,y,dp,c) {
        // J = lm_FD_J(func,t,p,y,{dp},{c})
        //
        // partial derivatives (Jacobian) dy/dp for use with lm.m
        // computed via Finite Differences
        // Requires n or 2n function evaluations, n = number of nonzero values of dp
        // -------- INPUT VARIABLES ---------
        // func = function of independent variables, 't', and parameters, 'p',
        //        returning the simulated model: y_hat = func(t,p,c)
        // t  = m-vector of independent variables (used as arg to func)
        // p  = n-vector of current parameter values
        // y  = func(t,p,c) n-vector initialised by user before each call to lm_FD_J
        // dp = fractional increment of p for numerical derivatives
        //      dp(j)>0 central differences calculated
        //      dp(j)<0 one sided differences calculated
        //      dp(j)=0 sets corresponding partials to zero; i.e. holds p(j) fixed
        //      Default:  0.001;
        // c  = optional vector of constants passed to y_hat = func(t,p,c)
        //---------- OUTPUT VARIABLES -------
        // J  = Jacobian Matrix J(i,j)=dy(i)/dp(j)	i=1:n; j=1:m

        //   Henri Gavin, Dept. Civil & Environ. Engineering, Duke Univ. November 2005
        //   modified from: ftp://fly.cnuce.cnr.it/pub/software/octave/leasqr/
        //   Press, et al., Numerical Recipes, Cambridge Univ. Press, 1992, Chapter 15.

        var m = y.length;			// number of data points
        var n = p.length;			// number of parameters

        dp = dp || math.multiply( Matrix.ones(n, 1), 0.001);

        var ps = p.clone();//JSON.parse(JSON.stringify(p));
        //var ps = $.extend(true, [], p);
        var J = new Matrix(m,n), del =new Array(n);         // initialize Jacobian to Zero

        for (var j = 0;j < n; j++) {
            //console.log(j+" "+dp[j]+" "+p[j]+" "+ps[j]+" "+del[j]);
            del[j] = dp[j]*(1+Math.abs(p[j][0]));  // parameter perturbation
            p[j] = [ps[j][0]+del[j]];	      // perturb parameter p(j)
            //console.log(j+" "+dp[j]+" "+p[j]+" "+ps[j]+" "+del[j]);

            if (del[j] != 0){
                y1 = func(t, p, c);
                //func_calls = func_calls + 1;
                if (dp[j][0] < 0) {		// backwards difference
                    //J(:,j) = math.dotDivide(math.subtract(y1, y),del[j]);//. / del[j];
                    //console.log(del[j]);
                    //console.log(y);
                    var column = math.dotDivide(math.subtract(y1, y),del[j]);
                    for(var k=0;k< m;k++){
                        J[k][j]=column[k][0];
                    }
                    //console.log(column);
                }
                else{
                    p[j][0] = ps[j][0] - del[j];
                    //J(:,j) = (y1 - feval(func, t, p, c)). / (2. * del[j]);
                    var column = math.dotDivide(math.subtract(y1,func(t,p,c)),2*del[j]);
                    for(var k=0;k< m;k++){
                        J[k][j]=column[k][0];
                    }

                }			// central difference, additional func call
            }

            p[j] = ps[j];		// restore p(j)

        }
        //console.log("lm_FD_J: "+ JSON.stringify(J));
        return J;

    },

    // endfunction # -------------------------------------------------- LM_FD_J
    lm_Broyden_J: function(p_old,y_old,J,p,y){
        // J = lm_Broyden_J(p_old,y_old,J,p,y)
        // carry out a rank-1 update to the Jacobian matrix using Broyden's equation
        //---------- INPUT VARIABLES -------
        // p_old = previous set of parameters
        // y_old = model evaluation at previous set of parameters, y_hat(t;p_old)
        // J  = current version of the Jacobian matrix
        // p     = current  set of parameters
        // y     = model evaluation at current  set of parameters, y_hat(t;p)
        //---------- OUTPUT VARIABLES -------
        // J = rank-1 update to Jacobian Matrix J(i,j)=dy(i)/dp(j)	i=1:n; j=1:m
        //console.log(p+" X "+ p_old)
        var h  = math.subtract(p, p_old);

        //console.log("hhh "+h);
        var h_t = math.transpose(h);
        h_t.div(math.multiply(h_t,h));

        //console.log(h_t);
        //J = J + ( y - y_old - J*h )*h' / (h'*h);	// Broyden rank-1 update eq'n
        J = math.add(J, math.multiply(math.subtract(y, math.add(y_old,math.multiply(J,h))),h_t));
        return J;
        // endfunction # ---------------------------------------------- LM_Broyden_J
    },

    lm_matx : function (func,t,p_old,y_old,dX2,J,p,y_dat,weight_sq,dp,c,iteration){
        // [JtWJ,JtWdy,Chi_sq,y_hat,J] = this.lm_matx(func,t,p_old,y_old,dX2,J,p,y_dat,weight_sq,{da},{c})
        //
        // Evaluate the linearized fitting matrix, JtWJ, and vector JtWdy,
        // and calculate the Chi-squared error function, Chi_sq
        // Used by Levenberg-Marquard algorithm, lm.m
        // -------- INPUT VARIABLES ---------
        // func   = function ofpn independent variables, p, and m parameters, p,
        //         returning the simulated model: y_hat = func(t,p,c)
        // t      = m-vectors or matrix of independent variables (used as arg to func)
        // p_old  = n-vector of previous parameter values
        // y_old  = m-vector of previous model ... y_old = y_hat(t;p_old);
        // dX2    = previous change in Chi-squared criteria
        // J   = m-by-n Jacobian of model, y_hat, with respect to parameters, p
        // p      = n-vector of current  parameter values
        // y_dat  = n-vector of data to be fit by func(t,p,c)
        // weight_sq = square of the weighting vector for least squares fit ...
        //	    inverse of the standard measurement errors
        // dp     = fractional increment of 'p' for numerical derivatives
        //          dp(j)>0 central differences calculated
        //          dp(j)<0 one sided differences calculated
        //          dp(j)=0 sets corresponding partials to zero; i.e. holds p(j) fixed
        //          Default:  0.001;
        // c      = optional vector of constants passed to y_hat = func(t,p,c)
        //---------- OUTPUT VARIABLES -------
        // JtWJ	 = linearized Hessian matrix (inverse of covariance matrix)
        // JtWdy   = linearized fitting vector
        // Chi_sq = Chi-squared criteria: weighted sum of the squared residuals WSSR
        // y_hat  = model evaluated with parameters 'p'
        // J   = m-by-n Jacobian of model, y_hat, with respect to parameters, p

        //   Henri Gavin, Dept. Civil & Environ. Engineering, Duke Univ. November 2005
        //   modified from: ftp://fly.cnuce.cnr.it/pub/software/octave/leasqr/
        //   Press, et al., Numerical Recipes, Cambridge Univ. Press, 1992, Chapter 15.


        var Npnt = y_dat.length;		// number of data points
        var Npar = p.length;		// number of parameters

        dp = dp || 0.001;


        //var JtWJ = new Matrix.zeros(Npar);
        //var JtWdy  = new Matrix.zeros(Npar,1);

        var y_hat = func(t,p,c);	// evaluate model using parameters 'p'
        //func_calls = func_calls + 1;
        //console.log(J);
        if ( (iteration%(2*Npar))==0 || dX2 > 0 ) {
            //console.log("Par");
            J = this.lm_FD_J(func, t, p, y_hat, dp, c);		// finite difference
        }
        else{
            //console.log("ImPar");
            J = this.lm_Broyden_J(p_old, y_old, J, p, y_hat); // rank-1 update
        }
        var delta_y = math.subtract(y_dat, y_hat);	// residual error between model and data
        //console.log(delta_y[0][0]);
        //console.log(delta_y.rows+" "+delta_y.columns+" "+JSON.stringify(weight_sq));
        //var Chi_sq = delta_y' * ( delta_y .* weight_sq ); 	// Chi-squared error criteria
        var Chi_sq = math.multiply(math.transpose(delta_y),math.dotMultiply(delta_y,weight_sq));
        //JtWJ  = J' * ( J .* ( weight_sq * ones(1,Npar) ) );
        var Jt = math.transpose(J);

        //console.log(weight_sq);

        var JtWJ = math.multiply(Jt, math.dotMultiply(J,math.multiply(weight_sq, Matrix.ones(1,Npar))));

        //JtWdy = J' * ( weight_sq .* delta_y );
        var JtWdy = math.multiply(Jt, math.dotMultiply(weight_sq,delta_y));


        return {JtWJ:JtWJ,JtWdy:JtWdy,Chi_sq:Chi_sq,y_hat:y_hat,J:J};
        // endfunction  # ------------------------------------------------------ LM_MATX
    }



};

module.exports = LM;
},{"./algebra":3,"ml-matrix":12}],3:[function(require,module,exports){
/**
 * Created by acastillo on 8/24/15.
 */
/**
 * Non in-place function definitions, compatible with mathjs code *
 */

'use strict';

var Matrix = require('ml-matrix');

function matrix(A,B){
    return new Matrix(A,B);
}

function ones(rows, cols){
    return Matrix.ones(rows,cols);
}

function eye(rows, cols){
    return Matrix.eye(rows, cols);
}

function zeros(rows, cols){
    return Matrix.zeros(rows, cols);
}

function random(rows, cols){
    return Matrix.rand(rows,cols);
}

function transpose(A){
    if(typeof A == 'number')
        return A;
    var result = A.clone();
    return result.transpose();
}

function add(A, B){
    if(typeof A == 'number'&&typeof B === 'number')
        return A+B;
    if(typeof A == 'number')
        return this.add(B,A);

    var result = A.clone();
    return result.add(B);

}

function subtract(A, B){
    if(typeof A == 'number'&&typeof B === 'number')
        return A-B;
    if(typeof A == 'number')
        return this.subtract(B,A);
    var result = A.clone();
    return result.sub(B);
}

function multiply(A, B){
    if(typeof A == 'number'&&typeof B === 'number')
        return A*B;
    if(typeof A == 'number')
        return this.multiply(B,A);

    var result = A.clone();

    if(typeof B === 'number')
        result.mul(B);
    else
        result = result.mmul(B);

    if(result.rows==1&&result.columns==1)
        return result[0][0];
    else
        return result;

}

function dotMultiply(A, B){
    var result = A.clone();
    return result.mul(B);
}

function dotDivide(A, B){
    var result = A.clone();
    return result.div(B);
}

function diag(A){
    var diag = null;
    var rows = A.rows, cols = A.columns, j, r;
    //It is an array
    if(typeof cols === "undefined" && (typeof A)=='object'){
        if(A[0]&&A[0].length){
            rows = A.length;
            cols = A[0].length;
            r = Math.min(rows,cols);
            diag = Matrix.zeros(cols, cols);
            for (j = 0; j < cols; j++) {
                diag[j][j]=A[j][j];
            }
        }
        else{
            cols = A.length;
            diag = Matrix.zeros(cols, cols);
            for (j = 0; j < cols; j++) {
                diag[j][j]=A[j];
            }
        }

    }
    if(rows == 1){
        diag = Matrix.zeros(cols, cols);
        for (j = 0; j < cols; j++) {
            diag[j][j]=A[0][j];
        }
    }
    else{
        if(rows>0 && cols > 0){
            r = Math.min(rows,cols);
            diag = new Array(r);
            for (j = 0; j < r; j++) {
                diag[j] = A[j][j];
            }
        }
    }
    return diag;
}

function min(A, B){
    if(typeof A==='number' && typeof B ==='number')
        return Math.min(A,B);
    var ii = A.rows, jj = A.columns;
    var result = new Matrix(ii,jj);
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            if (A[i][j] < B[i][j]) {
                result[i][j] = A[i][j];
            }
            else{
                result[i][j] = B[i][j];
            }
        }
    }
    return result;
}

function max(A, B){
    if(typeof A==='number' && typeof B ==='number')
        return Math.max(A,B);
    var ii = A.rows, jj = A.columns;
    var result = new Matrix(ii,jj);
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            if (A[i][j] > B[i][j]) {
                result[i][j] = A[i][j];
            }
            else{
                result[i][j] = B[i][j];
            }
        }
    }
    return result;
}

function sqrt(A){
    if(typeof A==='number' )
        return Math.sqrt(A);
    var ii = A.rows, jj = A.columns;
    var result = new Matrix(ii,jj);
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            result[i][j] = Math.sqrt(A[i][j]);

        }
    }
    return result;
}

function abs(A){
    if(typeof A==='number' )
        return Math.abs(A);
    var ii = A.rows, jj = A.columns;
    var result = new Matrix(ii,jj);
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            result[i][j] = Math.abs(A[i][j]);

        }
    }
    return result;
}

function exp(A){
    if(typeof A==='number' )
        return Math.sqrt(A);
    var ii = A.rows, jj = A.columns;
    var result = new Matrix(ii,jj);
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            result[i][j] = Math.exp(A[i][j]);
        }
    }
    return result;
}

function dotPow(A, b){
    if(typeof A==='number' )
        return Math.pow(A,b);
    //console.log(A);
    var ii = A.rows, jj = A.columns;
    var result = new Matrix(ii,jj);
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            result[i][j] = Math.pow(A[i][j],b);
        }
    }
    return result;
}

function solve(A, B){
    return A.solve(B);
}

function inv(A){
    if(typeof A ==="number")
        return 1/A;
    return A.inverse();
}

module.exports = {
    transpose:transpose,
    add:add,
    subtract:subtract,
    multiply:multiply,
    dotMultiply:dotMultiply,
    dotDivide:dotDivide,
    diag:diag,
    min:min,
    max:max,
    solve:solve,
    inv:inv,
    sqrt:sqrt,
    exp:exp,
    dotPow:dotPow,
    abs:abs,
    matrix:matrix,
    ones:ones,
    zeros:zeros,
    random:random,
    eye:eye
};

},{"ml-matrix":12}],4:[function(require,module,exports){
'use strict';

module.exports = require('./LM');
module.exports.Matrix = require('ml-matrix');
module.exports.Matrix.algebra = require('./algebra');

},{"./LM":2,"./algebra":3,"ml-matrix":12}],5:[function(require,module,exports){
'use strict';

var Matrix = require('../matrix');

// https://github.com/lutzroeder/Mapack/blob/master/Source/CholeskyDecomposition.cs
function CholeskyDecomposition(value) {
    if (!(this instanceof CholeskyDecomposition)) {
        return new CholeskyDecomposition(value);
    }
    value = Matrix.checkMatrix(value);
    if (!value.isSymmetric())
        throw new Error('Matrix is not symmetric');

    var a = value,
        dimension = a.rows,
        l = new Matrix(dimension, dimension),
        positiveDefinite = true,
        i, j, k;

    for (j = 0; j < dimension; j++) {
        var Lrowj = l[j];
        var d = 0;
        for (k = 0; k < j; k++) {
            var Lrowk = l[k];
            var s = 0;
            for (i = 0; i < k; i++) {
                s += Lrowk[i] * Lrowj[i];
            }
            Lrowj[k] = s = (a[j][k] - s) / l[k][k];
            d = d + s * s;
        }

        d = a[j][j] - d;

        positiveDefinite &= (d > 0);
        l[j][j] = Math.sqrt(Math.max(d, 0));
        for (k = j + 1; k < dimension; k++) {
            l[j][k] = 0;
        }
    }

    if (!positiveDefinite) {
        throw new Error('Matrix is not positive definite');
    }

    this.L = l;
}

CholeskyDecomposition.prototype = {
    get leftTriangularFactor() {
        return this.L;
    },
    solve: function (value) {
        value = Matrix.checkMatrix(value);

        var l = this.L,
            dimension = l.rows;

        if (value.rows !== dimension) {
            throw new Error('Matrix dimensions do not match');
        }

        var count = value.columns,
            B = value.clone(),
            i, j, k;

        for (k = 0; k < dimension; k++) {
            for (j = 0; j < count; j++) {
                for (i = 0; i < k; i++) {
                    B[k][j] -= B[i][j] * l[k][i];
                }
                B[k][j] /= l[k][k];
            }
        }

        for (k = dimension - 1; k >= 0; k--) {
            for (j = 0; j < count; j++) {
                for (i = k + 1; i < dimension; i++) {
                    B[k][j] -= B[i][j] * l[i][k];
                }
                B[k][j] /= l[k][k];
            }
        }

        return B;
    }
};

module.exports = CholeskyDecomposition;

},{"../matrix":13}],6:[function(require,module,exports){
'use strict';

var Matrix = require('../matrix');
var hypotenuse = require('./util').hypotenuse;

// https://github.com/lutzroeder/Mapack/blob/master/Source/EigenvalueDecomposition.cs
function EigenvalueDecomposition(matrix) {
    if (!(this instanceof EigenvalueDecomposition)) {
        return new EigenvalueDecomposition(matrix);
    }
    matrix = Matrix.checkMatrix(matrix);
    if (!matrix.isSquare()) {
        throw new Error('Matrix is not a square matrix');
    }

    var n = matrix.columns,
        V = Matrix.zeros(n, n),
        d = new Array(n),
        e = new Array(n),
        value = matrix,
        i, j;

    if (matrix.isSymmetric()) {
        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                V[i][j] = value[i][j];
            }
        }
        tred2(n, e, d, V);
        tql2(n, e, d, V);
    }
    else {
        var H = Matrix.zeros(n, n),
            ort = new Array(n);
        for (j = 0; j < n; j++) {
            for (i = 0; i < n; i++) {
                H[i][j] = value[i][j];
            }
        }
        orthes(n, H, ort, V);
        hqr2(n, e, d, V, H);
    }

    this.n = n;
    this.e = e;
    this.d = d;
    this.V = V;
}

EigenvalueDecomposition.prototype = {
    get realEigenvalues() {
        return this.d;
    },
    get imaginaryEigenvalues() {
        return this.e;
    },
    get eigenvectorMatrix() {
        return this.V;
    },
    get diagonalMatrix() {
        var n = this.n,
            e = this.e,
            d = this.d,
            X = new Matrix(n, n),
            i, j;
        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                X[i][j] = 0;
            }
            X[i][i] = d[i];
            if (e[i] > 0) {
                X[i][i + 1] = e[i];
            }
            else if (e[i] < 0) {
                X[i][i - 1] = e[i];
            }
        }
        return X;
    }
};

function tred2(n, e, d, V) {

    var f, g, h, i, j, k,
        hh, scale;

    for (j = 0; j < n; j++) {
        d[j] = V[n - 1][j];
    }

    for (i = n - 1; i > 0; i--) {
        scale = 0;
        h = 0;
        for (k = 0; k < i; k++) {
            scale = scale + Math.abs(d[k]);
        }

        if (scale === 0) {
            e[i] = d[i - 1];
            for (j = 0; j < i; j++) {
                d[j] = V[i - 1][j];
                V[i][j] = 0;
                V[j][i] = 0;
            }
        } else {
            for (k = 0; k < i; k++) {
                d[k] /= scale;
                h += d[k] * d[k];
            }

            f = d[i - 1];
            g = Math.sqrt(h);
            if (f > 0) {
                g = -g;
            }

            e[i] = scale * g;
            h = h - f * g;
            d[i - 1] = f - g;
            for (j = 0; j < i; j++) {
                e[j] = 0;
            }

            for (j = 0; j < i; j++) {
                f = d[j];
                V[j][i] = f;
                g = e[j] + V[j][j] * f;
                for (k = j + 1; k <= i - 1; k++) {
                    g += V[k][j] * d[k];
                    e[k] += V[k][j] * f;
                }
                e[j] = g;
            }

            f = 0;
            for (j = 0; j < i; j++) {
                e[j] /= h;
                f += e[j] * d[j];
            }

            hh = f / (h + h);
            for (j = 0; j < i; j++) {
                e[j] -= hh * d[j];
            }

            for (j = 0; j < i; j++) {
                f = d[j];
                g = e[j];
                for (k = j; k <= i - 1; k++) {
                    V[k][j] -= (f * e[k] + g * d[k]);
                }
                d[j] = V[i - 1][j];
                V[i][j] = 0;
            }
        }
        d[i] = h;
    }

    for (i = 0; i < n - 1; i++) {
        V[n - 1][i] = V[i][i];
        V[i][i] = 1;
        h = d[i + 1];
        if (h !== 0) {
            for (k = 0; k <= i; k++) {
                d[k] = V[k][i + 1] / h;
            }

            for (j = 0; j <= i; j++) {
                g = 0;
                for (k = 0; k <= i; k++) {
                    g += V[k][i + 1] * V[k][j];
                }
                for (k = 0; k <= i; k++) {
                    V[k][j] -= g * d[k];
                }
            }
        }

        for (k = 0; k <= i; k++) {
            V[k][i + 1] = 0;
        }
    }

    for (j = 0; j < n; j++) {
        d[j] = V[n - 1][j];
        V[n - 1][j] = 0;
    }

    V[n - 1][n - 1] = 1;
    e[0] = 0;
}

function tql2(n, e, d, V) {

    var g, h, i, j, k, l, m, p, r,
        dl1, c, c2, c3, el1, s, s2,
        iter;

    for (i = 1; i < n; i++) {
        e[i - 1] = e[i];
    }

    e[n - 1] = 0;

    var f = 0,
        tst1 = 0,
        eps = Math.pow(2, -52);

    for (l = 0; l < n; l++) {
        tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
        m = l;
        while (m < n) {
            if (Math.abs(e[m]) <= eps * tst1) {
                break;
            }
            m++;
        }

        if (m > l) {
            iter = 0;
            do {
                iter = iter + 1;

                g = d[l];
                p = (d[l + 1] - g) / (2 * e[l]);
                r = hypotenuse(p, 1);
                if (p < 0) {
                    r = -r;
                }

                d[l] = e[l] / (p + r);
                d[l + 1] = e[l] * (p + r);
                dl1 = d[l + 1];
                h = g - d[l];
                for (i = l + 2; i < n; i++) {
                    d[i] -= h;
                }

                f = f + h;

                p = d[m];
                c = 1;
                c2 = c;
                c3 = c;
                el1 = e[l + 1];
                s = 0;
                s2 = 0;
                for (i = m - 1; i >= l; i--) {
                    c3 = c2;
                    c2 = c;
                    s2 = s;
                    g = c * e[i];
                    h = c * p;
                    r = hypotenuse(p, e[i]);
                    e[i + 1] = s * r;
                    s = e[i] / r;
                    c = p / r;
                    p = c * d[i] - s * g;
                    d[i + 1] = h + s * (c * g + s * d[i]);

                    for (k = 0; k < n; k++) {
                        h = V[k][i + 1];
                        V[k][i + 1] = s * V[k][i] + c * h;
                        V[k][i] = c * V[k][i] - s * h;
                    }
                }

                p = -s * s2 * c3 * el1 * e[l] / dl1;
                e[l] = s * p;
                d[l] = c * p;

            }
            while (Math.abs(e[l]) > eps * tst1);
        }
        d[l] = d[l] + f;
        e[l] = 0;
    }

    for (i = 0; i < n - 1; i++) {
        k = i;
        p = d[i];
        for (j = i + 1; j < n; j++) {
            if (d[j] < p) {
                k = j;
                p = d[j];
            }
        }

        if (k !== i) {
            d[k] = d[i];
            d[i] = p;
            for (j = 0; j < n; j++) {
                p = V[j][i];
                V[j][i] = V[j][k];
                V[j][k] = p;
            }
        }
    }
}

function orthes(n, H, ort, V) {

    var low = 0,
        high = n - 1,
        f, g, h, i, j, m,
        scale;

    for (m = low + 1; m <= high - 1; m++) {
        scale = 0;
        for (i = m; i <= high; i++) {
            scale = scale + Math.abs(H[i][m - 1]);
        }

        if (scale !== 0) {
            h = 0;
            for (i = high; i >= m; i--) {
                ort[i] = H[i][m - 1] / scale;
                h += ort[i] * ort[i];
            }

            g = Math.sqrt(h);
            if (ort[m] > 0) {
                g = -g;
            }

            h = h - ort[m] * g;
            ort[m] = ort[m] - g;

            for (j = m; j < n; j++) {
                f = 0;
                for (i = high; i >= m; i--) {
                    f += ort[i] * H[i][j];
                }

                f = f / h;
                for (i = m; i <= high; i++) {
                    H[i][j] -= f * ort[i];
                }
            }

            for (i = 0; i <= high; i++) {
                f = 0;
                for (j = high; j >= m; j--) {
                    f += ort[j] * H[i][j];
                }

                f = f / h;
                for (j = m; j <= high; j++) {
                    H[i][j] -= f * ort[j];
                }
            }

            ort[m] = scale * ort[m];
            H[m][m - 1] = scale * g;
        }
    }

    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            V[i][j] = (i === j ? 1 : 0);
        }
    }

    for (m = high - 1; m >= low + 1; m--) {
        if (H[m][m - 1] !== 0) {
            for (i = m + 1; i <= high; i++) {
                ort[i] = H[i][m - 1];
            }

            for (j = m; j <= high; j++) {
                g = 0;
                for (i = m; i <= high; i++) {
                    g += ort[i] * V[i][j];
                }

                g = (g / ort[m]) / H[m][m - 1];
                for (i = m; i <= high; i++) {
                    V[i][j] += g * ort[i];
                }
            }
        }
    }
}

function hqr2(nn, e, d, V, H) {
    var n = nn - 1,
        low = 0,
        high = nn - 1,
        eps = Math.pow(2, -52),
        exshift = 0,
        norm = 0,
        p = 0,
        q = 0,
        r = 0,
        s = 0,
        z = 0,
        iter = 0,
        i, j, k, l, m, t, w, x, y,
        ra, sa, vr, vi,
        notlast, cdivres;

    for (i = 0; i < nn; i++) {
        if (i < low || i > high) {
            d[i] = H[i][i];
            e[i] = 0;
        }

        for (j = Math.max(i - 1, 0); j < nn; j++) {
            norm = norm + Math.abs(H[i][j]);
        }
    }

    while (n >= low) {
        l = n;
        while (l > low) {
            s = Math.abs(H[l - 1][l - 1]) + Math.abs(H[l][l]);
            if (s === 0) {
                s = norm;
            }
            if (Math.abs(H[l][l - 1]) < eps * s) {
                break;
            }
            l--;
        }

        if (l === n) {
            H[n][n] = H[n][n] + exshift;
            d[n] = H[n][n];
            e[n] = 0;
            n--;
            iter = 0;
        } else if (l === n - 1) {
            w = H[n][n - 1] * H[n - 1][n];
            p = (H[n - 1][n - 1] - H[n][n]) / 2;
            q = p * p + w;
            z = Math.sqrt(Math.abs(q));
            H[n][n] = H[n][n] + exshift;
            H[n - 1][n - 1] = H[n - 1][n - 1] + exshift;
            x = H[n][n];

            if (q >= 0) {
                z = (p >= 0) ? (p + z) : (p - z);
                d[n - 1] = x + z;
                d[n] = d[n - 1];
                if (z !== 0) {
                    d[n] = x - w / z;
                }
                e[n - 1] = 0;
                e[n] = 0;
                x = H[n][n - 1];
                s = Math.abs(x) + Math.abs(z);
                p = x / s;
                q = z / s;
                r = Math.sqrt(p * p + q * q);
                p = p / r;
                q = q / r;

                for (j = n - 1; j < nn; j++) {
                    z = H[n - 1][j];
                    H[n - 1][j] = q * z + p * H[n][j];
                    H[n][j] = q * H[n][j] - p * z;
                }

                for (i = 0; i <= n; i++) {
                    z = H[i][n - 1];
                    H[i][n - 1] = q * z + p * H[i][n];
                    H[i][n] = q * H[i][n] - p * z;
                }

                for (i = low; i <= high; i++) {
                    z = V[i][n - 1];
                    V[i][n - 1] = q * z + p * V[i][n];
                    V[i][n] = q * V[i][n] - p * z;
                }
            } else {
                d[n - 1] = x + p;
                d[n] = x + p;
                e[n - 1] = z;
                e[n] = -z;
            }

            n = n - 2;
            iter = 0;
        } else {
            x = H[n][n];
            y = 0;
            w = 0;
            if (l < n) {
                y = H[n - 1][n - 1];
                w = H[n][n - 1] * H[n - 1][n];
            }

            if (iter === 10) {
                exshift += x;
                for (i = low; i <= n; i++) {
                    H[i][i] -= x;
                }
                s = Math.abs(H[n][n - 1]) + Math.abs(H[n - 1][n - 2]);
                x = y = 0.75 * s;
                w = -0.4375 * s * s;
            }

            if (iter === 30) {
                s = (y - x) / 2;
                s = s * s + w;
                if (s > 0) {
                    s = Math.sqrt(s);
                    if (y < x) {
                        s = -s;
                    }
                    s = x - w / ((y - x) / 2 + s);
                    for (i = low; i <= n; i++) {
                        H[i][i] -= s;
                    }
                    exshift += s;
                    x = y = w = 0.964;
                }
            }

            iter = iter + 1;

            m = n - 2;
            while (m >= l) {
                z = H[m][m];
                r = x - z;
                s = y - z;
                p = (r * s - w) / H[m + 1][m] + H[m][m + 1];
                q = H[m + 1][m + 1] - z - r - s;
                r = H[m + 2][m + 1];
                s = Math.abs(p) + Math.abs(q) + Math.abs(r);
                p = p / s;
                q = q / s;
                r = r / s;
                if (m === l) {
                    break;
                }
                if (Math.abs(H[m][m - 1]) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H[m - 1][m - 1]) + Math.abs(z) + Math.abs(H[m + 1][m + 1])))) {
                    break;
                }
                m--;
            }

            for (i = m + 2; i <= n; i++) {
                H[i][i - 2] = 0;
                if (i > m + 2) {
                    H[i][i - 3] = 0;
                }
            }

            for (k = m; k <= n - 1; k++) {
                notlast = (k !== n - 1);
                if (k !== m) {
                    p = H[k][k - 1];
                    q = H[k + 1][k - 1];
                    r = (notlast ? H[k + 2][k - 1] : 0);
                    x = Math.abs(p) + Math.abs(q) + Math.abs(r);
                    if (x !== 0) {
                        p = p / x;
                        q = q / x;
                        r = r / x;
                    }
                }

                if (x === 0) {
                    break;
                }

                s = Math.sqrt(p * p + q * q + r * r);
                if (p < 0) {
                    s = -s;
                }

                if (s !== 0) {
                    if (k !== m) {
                        H[k][k - 1] = -s * x;
                    } else if (l !== m) {
                        H[k][k - 1] = -H[k][k - 1];
                    }

                    p = p + s;
                    x = p / s;
                    y = q / s;
                    z = r / s;
                    q = q / p;
                    r = r / p;

                    for (j = k; j < nn; j++) {
                        p = H[k][j] + q * H[k + 1][j];
                        if (notlast) {
                            p = p + r * H[k + 2][j];
                            H[k + 2][j] = H[k + 2][j] - p * z;
                        }

                        H[k][j] = H[k][j] - p * x;
                        H[k + 1][j] = H[k + 1][j] - p * y;
                    }

                    for (i = 0; i <= Math.min(n, k + 3); i++) {
                        p = x * H[i][k] + y * H[i][k + 1];
                        if (notlast) {
                            p = p + z * H[i][k + 2];
                            H[i][k + 2] = H[i][k + 2] - p * r;
                        }

                        H[i][k] = H[i][k] - p;
                        H[i][k + 1] = H[i][k + 1] - p * q;
                    }

                    for (i = low; i <= high; i++) {
                        p = x * V[i][k] + y * V[i][k + 1];
                        if (notlast) {
                            p = p + z * V[i][k + 2];
                            V[i][k + 2] = V[i][k + 2] - p * r;
                        }

                        V[i][k] = V[i][k] - p;
                        V[i][k + 1] = V[i][k + 1] - p * q;
                    }
                }
            }
        }
    }

    if (norm === 0) {
        return;
    }

    for (n = nn - 1; n >= 0; n--) {
        p = d[n];
        q = e[n];

        if (q === 0) {
            l = n;
            H[n][n] = 1;
            for (i = n - 1; i >= 0; i--) {
                w = H[i][i] - p;
                r = 0;
                for (j = l; j <= n; j++) {
                    r = r + H[i][j] * H[j][n];
                }

                if (e[i] < 0) {
                    z = w;
                    s = r;
                } else {
                    l = i;
                    if (e[i] === 0) {
                        H[i][n] = (w !== 0) ? (-r / w) : (-r / (eps * norm));
                    } else {
                        x = H[i][i + 1];
                        y = H[i + 1][i];
                        q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
                        t = (x * s - z * r) / q;
                        H[i][n] = t;
                        H[i + 1][n] = (Math.abs(x) > Math.abs(z)) ? ((-r - w * t) / x) : ((-s - y * t) / z);
                    }

                    t = Math.abs(H[i][n]);
                    if ((eps * t) * t > 1) {
                        for (j = i; j <= n; j++) {
                            H[j][n] = H[j][n] / t;
                        }
                    }
                }
            }
        } else if (q < 0) {
            l = n - 1;

            if (Math.abs(H[n][n - 1]) > Math.abs(H[n - 1][n])) {
                H[n - 1][n - 1] = q / H[n][n - 1];
                H[n - 1][n] = -(H[n][n] - p) / H[n][n - 1];
            } else {
                cdivres = cdiv(0, -H[n - 1][n], H[n - 1][n - 1] - p, q);
                H[n - 1][n - 1] = cdivres[0];
                H[n - 1][n] = cdivres[1];
            }

            H[n][n - 1] = 0;
            H[n][n] = 1;
            for (i = n - 2; i >= 0; i--) {
                ra = 0;
                sa = 0;
                for (j = l; j <= n; j++) {
                    ra = ra + H[i][j] * H[j][n - 1];
                    sa = sa + H[i][j] * H[j][n];
                }

                w = H[i][i] - p;

                if (e[i] < 0) {
                    z = w;
                    r = ra;
                    s = sa;
                } else {
                    l = i;
                    if (e[i] === 0) {
                        cdivres = cdiv(-ra, -sa, w, q);
                        H[i][n - 1] = cdivres[0];
                        H[i][n] = cdivres[1];
                    } else {
                        x = H[i][i + 1];
                        y = H[i + 1][i];
                        vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
                        vi = (d[i] - p) * 2 * q;
                        if (vr === 0 && vi === 0) {
                            vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
                        }
                        cdivres = cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
                        H[i][n - 1] = cdivres[0];
                        H[i][n] = cdivres[1];
                        if (Math.abs(x) > (Math.abs(z) + Math.abs(q))) {
                            H[i + 1][n - 1] = (-ra - w * H[i][n - 1] + q * H[i][n]) / x;
                            H[i + 1][n] = (-sa - w * H[i][n] - q * H[i][n - 1]) / x;
                        } else {
                            cdivres = cdiv(-r - y * H[i][n - 1], -s - y * H[i][n], z, q);
                            H[i + 1][n - 1] = cdivres[0];
                            H[i + 1][n] = cdivres[1];
                        }
                    }

                    t = Math.max(Math.abs(H[i][n - 1]), Math.abs(H[i][n]));
                    if ((eps * t) * t > 1) {
                        for (j = i; j <= n; j++) {
                            H[j][n - 1] = H[j][n - 1] / t;
                            H[j][n] = H[j][n] / t;
                        }
                    }
                }
            }
        }
    }

    for (i = 0; i < nn; i++) {
        if (i < low || i > high) {
            for (j = i; j < nn; j++) {
                V[i][j] = H[i][j];
            }
        }
    }

    for (j = nn - 1; j >= low; j--) {
        for (i = low; i <= high; i++) {
            z = 0;
            for (k = low; k <= Math.min(j, high); k++) {
                z = z + V[i][k] * H[k][j];
            }
            V[i][j] = z;
        }
    }
}

function cdiv(xr, xi, yr, yi) {
    var r, d;
    if (Math.abs(yr) > Math.abs(yi)) {
        r = yi / yr;
        d = yr + r * yi;
        return [(xr + r * xi) / d, (xi - r * xr) / d];
    }
    else {
        r = yr / yi;
        d = yi + r * yr;
        return [(r * xr + xi) / d, (r * xi - xr) / d];
    }
}

module.exports = EigenvalueDecomposition;

},{"../matrix":13,"./util":10}],7:[function(require,module,exports){
'use strict';

var Matrix = require('../matrix');

// https://github.com/lutzroeder/Mapack/blob/master/Source/LuDecomposition.cs
function LuDecomposition(matrix) {
    if (!(this instanceof LuDecomposition)) {
        return new LuDecomposition(matrix);
    }
    matrix = Matrix.checkMatrix(matrix);

    var lu = matrix.clone(),
        rows = lu.rows,
        columns = lu.columns,
        pivotVector = new Array(rows),
        pivotSign = 1,
        i, j, k, p, s, t, v,
        LUrowi, LUcolj, kmax;

    for (i = 0; i < rows; i++) {
        pivotVector[i] = i;
    }

    LUcolj = new Array(rows);

    for (j = 0; j < columns; j++) {

        for (i = 0; i < rows; i++) {
            LUcolj[i] = lu[i][j];
        }

        for (i = 0; i < rows; i++) {
            LUrowi = lu[i];
            kmax = Math.min(i, j);
            s = 0;
            for (k = 0; k < kmax; k++) {
                s += LUrowi[k] * LUcolj[k];
            }
            LUrowi[j] = LUcolj[i] -= s;
        }

        p = j;
        for (i = j + 1; i < rows; i++) {
            if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
                p = i;
            }
        }

        if (p !== j) {
            for (k = 0; k < columns; k++) {
                t = lu[p][k];
                lu[p][k] = lu[j][k];
                lu[j][k] = t;
            }

            v = pivotVector[p];
            pivotVector[p] = pivotVector[j];
            pivotVector[j] = v;

            pivotSign = -pivotSign;
        }

        if (j < rows && lu[j][j] !== 0) {
            for (i = j + 1; i < rows; i++) {
                lu[i][j] /= lu[j][j];
            }
        }
    }

    this.LU = lu;
    this.pivotVector = pivotVector;
    this.pivotSign = pivotSign;
}

LuDecomposition.prototype = {
    isSingular: function () {
        var data = this.LU,
            col = data.columns;
        for (var j = 0; j < col; j++) {
            if (data[j][j] === 0) {
                return true;
            }
        }
        return false;
    },
    get determinant() {
        var data = this.LU;
        if (!data.isSquare())
            throw new Error('Matrix must be square');
        var determinant = this.pivotSign, col = data.columns;
        for (var j = 0; j < col; j++)
            determinant *= data[j][j];
        return determinant;
    },
    get lowerTriangularFactor() {
        var data = this.LU,
            rows = data.rows,
            columns = data.columns,
            X = new Matrix(rows, columns);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                if (i > j) {
                    X[i][j] = data[i][j];
                } else if (i === j) {
                    X[i][j] = 1;
                } else {
                    X[i][j] = 0;
                }
            }
        }
        return X;
    },
    get upperTriangularFactor() {
        var data = this.LU,
            rows = data.rows,
            columns = data.columns,
            X = new Matrix(rows, columns);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                if (i <= j) {
                    X[i][j] = data[i][j];
                } else {
                    X[i][j] = 0;
                }
            }
        }
        return X;
    },
    get pivotPermutationVector() {
        return this.pivotVector.slice();
    },
    solve: function (value) {
        value = Matrix.checkMatrix(value);

        var lu = this.LU,
            rows = lu.rows;

        if (rows !== value.rows)
            throw new Error('Invalid matrix dimensions');
        if (this.isSingular())
            throw new Error('LU matrix is singular');

        var count = value.columns,
            X = value.subMatrixRow(this.pivotVector, 0, count - 1),
            columns = lu.columns,
            i, j, k;

        for (k = 0; k < columns; k++) {
            for (i = k + 1; i < columns; i++) {
                for (j = 0; j < count; j++) {
                    X[i][j] -= X[k][j] * lu[i][k];
                }
            }
        }
        for (k = columns - 1; k >= 0; k--) {
            for (j = 0; j < count; j++) {
                X[k][j] /= lu[k][k];
            }
            for (i = 0; i < k; i++) {
                for (j = 0; j < count; j++) {
                    X[i][j] -= X[k][j] * lu[i][k];
                }
            }
        }
        return X;
    }
};

module.exports = LuDecomposition;

},{"../matrix":13}],8:[function(require,module,exports){
'use strict';

var Matrix = require('../matrix');
var hypotenuse = require('./util').hypotenuse;

//https://github.com/lutzroeder/Mapack/blob/master/Source/QrDecomposition.cs
function QrDecomposition(value) {
    if (!(this instanceof QrDecomposition)) {
        return new QrDecomposition(value);
    }
    value = Matrix.checkMatrix(value);

    var qr = value.clone(),
        m = value.rows,
        n = value.columns,
        rdiag = new Array(n),
        i, j, k, s;

    for (k = 0; k < n; k++) {
        var nrm = 0;
        for (i = k; i < m; i++) {
            nrm = hypotenuse(nrm, qr[i][k]);
        }
        if (nrm !== 0) {
            if (qr[k][k] < 0) {
                nrm = -nrm;
            }
            for (i = k; i < m; i++) {
                qr[i][k] /= nrm;
            }
            qr[k][k] += 1;
            for (j = k + 1; j < n; j++) {
                s = 0;
                for (i = k; i < m; i++) {
                    s += qr[i][k] * qr[i][j];
                }
                s = -s / qr[k][k];
                for (i = k; i < m; i++) {
                    qr[i][j] += s * qr[i][k];
                }
            }
        }
        rdiag[k] = -nrm;
    }

    this.QR = qr;
    this.Rdiag = rdiag;
}

QrDecomposition.prototype = {
    solve: function (value) {
        value = Matrix.checkMatrix(value);

        var qr = this.QR,
            m = qr.rows;

        if (value.rows !== m)
            throw new Error('Matrix row dimensions must agree');
        if (!this.isFullRank())
            throw new Error('Matrix is rank deficient');

        var count = value.columns,
            X = value.clone(),
            n = qr.columns,
            i, j, k, s;

        for (k = 0; k < n; k++) {
            for (j = 0; j < count; j++) {
                s = 0;
                for (i = k; i < m; i++) {
                    s += qr[i][k] * X[i][j];
                }
                s = -s / qr[k][k];
                for (i = k; i < m; i++) {
                    X[i][j] += s * qr[i][k];
                }
            }
        }
        for (k = n - 1; k >= 0; k--) {
            for (j = 0; j < count; j++) {
                X[k][j] /= this.Rdiag[k];
            }
            for (i = 0; i < k; i++) {
                for (j = 0; j < count; j++) {
                    X[i][j] -= X[k][j] * qr[i][k];
                }
            }
        }

        return X.subMatrix(0, n - 1, 0, count - 1);
    },
    isFullRank: function () {
        var columns = this.QR.columns;
        for (var i = 0; i < columns; i++) {
            if (this.Rdiag[i] === 0) {
                return false;
            }
        }
        return true;
    },
    get upperTriangularFactor() {
        var qr = this.QR,
            n = qr.columns,
            X = new Matrix(n, n),
            i, j;
        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                if (i < j) {
                    X[i][j] = qr[i][j];
                } else if (i === j) {
                    X[i][j] = this.Rdiag[i];
                } else {
                    X[i][j] = 0;
                }
            }
        }
        return X;
    },
    get orthogonalFactor() {
        var qr = this.QR,
            rows = qr.rows,
            columns = qr.columns,
            X = new Matrix(rows, columns),
            i, j, k, s;

        for (k = columns - 1; k >= 0; k--) {
            for (i = 0; i < rows; i++) {
                X[i][k] = 0;
            }
            X[k][k] = 1;
            for (j = k; j < columns; j++) {
                if (qr[k][k] !== 0) {
                    s = 0;
                    for (i = k; i < rows; i++) {
                        s += qr[i][k] * X[i][j];
                    }

                    s = -s / qr[k][k];

                    for (i = k; i < rows; i++) {
                        X[i][j] += s * qr[i][k];
                    }
                }
            }
        }
        return X;
    }
};

module.exports = QrDecomposition;

},{"../matrix":13,"./util":10}],9:[function(require,module,exports){
'use strict';

var Matrix = require('../matrix');
var hypotenuse = require('./util').hypotenuse;

// https://github.com/lutzroeder/Mapack/blob/master/Source/SingularValueDecomposition.cs
function SingularValueDecomposition(value, options) {
    if (!(this instanceof SingularValueDecomposition)) {
        return new SingularValueDecomposition(value, options);
    }
    value = Matrix.checkMatrix(value);

    options = options || {};

    var a = value.clone(),
        m = value.rows,
        n = value.columns,
        nu = Math.min(m, n);

    var wantu = true, wantv = true;
    if (options.computeLeftSingularVectors === false)
        wantu = false;
    if (options.computeRightSingularVectors === false)
        wantv = false;
    var autoTranspose = options.autoTranspose === true;

    var swapped = false;
    if (m < n) {
        if (!autoTranspose) {
            console.warn('Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose');
        } else {
            a = a.transpose();
            m = a.rows;
            n = a.columns;
            swapped = true;
            var aux = wantu;
            wantu = wantv;
            wantv = aux;
        }
    }

    var s = new Array(Math.min(m + 1, n)),
        U = Matrix.zeros(m, nu),
        V = Matrix.zeros(n, n),
        e = new Array(n),
        work = new Array(m);

    var nct = Math.min(m - 1, n);
    var nrt = Math.max(0, Math.min(n - 2, m));

    var i, j, k, p, t, ks, f, cs, sn, max, kase,
        scale, sp, spm1, epm1, sk, ek, b, c, shift, g;

    for (k = 0, max = Math.max(nct, nrt); k < max; k++) {
        if (k < nct) {
            s[k] = 0;
            for (i = k; i < m; i++) {
                s[k] = hypotenuse(s[k], a[i][k]);
            }
            if (s[k] !== 0) {
                if (a[k][k] < 0) {
                    s[k] = -s[k];
                }
                for (i = k; i < m; i++) {
                    a[i][k] /= s[k];
                }
                a[k][k] += 1;
            }
            s[k] = -s[k];
        }

        for (j = k + 1; j < n; j++) {
            if ((k < nct) && (s[k] !== 0)) {
                t = 0;
                for (i = k; i < m; i++) {
                    t += a[i][k] * a[i][j];
                }
                t = -t / a[k][k];
                for (i = k; i < m; i++) {
                    a[i][j] += t * a[i][k];
                }
            }
            e[j] = a[k][j];
        }

        if (wantu && (k < nct)) {
            for (i = k; i < m; i++) {
                U[i][k] = a[i][k];
            }
        }

        if (k < nrt) {
            e[k] = 0;
            for (i = k + 1; i < n; i++) {
                e[k] = hypotenuse(e[k], e[i]);
            }
            if (e[k] !== 0) {
                if (e[k + 1] < 0)
                    e[k] = -e[k];
                for (i = k + 1; i < n; i++) {
                    e[i] /= e[k];
                }
                e[k + 1] += 1;
            }
            e[k] = -e[k];
            if ((k + 1 < m) && (e[k] !== 0)) {
                for (i = k + 1; i < m; i++) {
                    work[i] = 0;
                }
                for (j = k + 1; j < n; j++) {
                    for (i = k + 1; i < m; i++) {
                        work[i] += e[j] * a[i][j];
                    }
                }
                for (j = k + 1; j < n; j++) {
                    t = -e[j] / e[k + 1];
                    for (i = k + 1; i < m; i++) {
                        a[i][j] += t * work[i];
                    }
                }
            }
            if (wantv) {
                for (i = k + 1; i < n; i++) {
                    V[i][k] = e[i];
                }
            }
        }
    }

    p = Math.min(n, m + 1);
    if (nct < n) {
        s[nct] = a[nct][nct];
    }
    if (m < p) {
        s[p - 1] = 0;
    }
    if (nrt + 1 < p) {
        e[nrt] = a[nrt][p - 1];
    }
    e[p - 1] = 0;

    if (wantu) {
        for (j = nct; j < nu; j++) {
            for (i = 0; i < m; i++) {
                U[i][j] = 0;
            }
            U[j][j] = 1;
        }
        for (k = nct - 1; k >= 0; k--) {
            if (s[k] !== 0) {
                for (j = k + 1; j < nu; j++) {
                    t = 0;
                    for (i = k; i < m; i++) {
                        t += U[i][k] * U[i][j];
                    }
                    t = -t / U[k][k];
                    for (i = k; i < m; i++) {
                        U[i][j] += t * U[i][k];
                    }
                }
                for (i = k; i < m; i++) {
                    U[i][k] = -U[i][k];
                }
                U[k][k] = 1 + U[k][k];
                for (i = 0; i < k - 1; i++) {
                    U[i][k] = 0;
                }
            } else {
                for (i = 0; i < m; i++) {
                    U[i][k] = 0;
                }
                U[k][k] = 1;
            }
        }
    }

    if (wantv) {
        for (k = n - 1; k >= 0; k--) {
            if ((k < nrt) && (e[k] !== 0)) {
                for (j = k + 1; j < n; j++) {
                    t = 0;
                    for (i = k + 1; i < n; i++) {
                        t += V[i][k] * V[i][j];
                    }
                    t = -t / V[k + 1][k];
                    for (i = k + 1; i < n; i++) {
                        V[i][j] += t * V[i][k];
                    }
                }
            }
            for (i = 0; i < n; i++) {
                V[i][k] = 0;
            }
            V[k][k] = 1;
        }
    }

    var pp = p - 1,
        iter = 0,
        eps = Math.pow(2, -52);
    while (p > 0) {
        for (k = p - 2; k >= -1; k--) {
            if (k === -1) {
                break;
            }
            if (Math.abs(e[k]) <= eps * (Math.abs(s[k]) + Math.abs(s[k + 1]))) {
                e[k] = 0;
                break;
            }
        }
        if (k === p - 2) {
            kase = 4;
        } else {
            for (ks = p - 1; ks >= k; ks--) {
                if (ks === k) {
                    break;
                }
                t = (ks !== p ? Math.abs(e[ks]) : 0) + (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
                if (Math.abs(s[ks]) <= eps * t) {
                    s[ks] = 0;
                    break;
                }
            }
            if (ks === k) {
                kase = 3;
            } else if (ks === p - 1) {
                kase = 1;
            } else {
                kase = 2;
                k = ks;
            }
        }

        k++;

        switch (kase) {
            case 1: {
                f = e[p - 2];
                e[p - 2] = 0;
                for (j = p - 2; j >= k; j--) {
                    t = hypotenuse(s[j], f);
                    cs = s[j] / t;
                    sn = f / t;
                    s[j] = t;
                    if (j !== k) {
                        f = -sn * e[j - 1];
                        e[j - 1] = cs * e[j - 1];
                    }
                    if (wantv) {
                        for (i = 0; i < n; i++) {
                            t = cs * V[i][j] + sn * V[i][p - 1];
                            V[i][p - 1] = -sn * V[i][j] + cs * V[i][p - 1];
                            V[i][j] = t;
                        }
                    }
                }
                break;
            }
            case 2 : {
                f = e[k - 1];
                e[k - 1] = 0;
                for (j = k; j < p; j++) {
                    t = hypotenuse(s[j], f);
                    cs = s[j] / t;
                    sn = f / t;
                    s[j] = t;
                    f = -sn * e[j];
                    e[j] = cs * e[j];
                    if (wantu) {
                        for (i = 0; i < m; i++) {
                            t = cs * U[i][j] + sn * U[i][k - 1];
                            U[i][k - 1] = -sn * U[i][j] + cs * U[i][k - 1];
                            U[i][j] = t;
                        }
                    }
                }
                break;
            }
            case 3 : {
                scale = Math.max(Math.max(Math.max(Math.max(Math.abs(s[p - 1]), Math.abs(s[p - 2])), Math.abs(e[p - 2])), Math.abs(s[k])), Math.abs(e[k]));
                sp = s[p - 1] / scale;
                spm1 = s[p - 2] / scale;
                epm1 = e[p - 2] / scale;
                sk = s[k] / scale;
                ek = e[k] / scale;
                b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
                c = (sp * epm1) * (sp * epm1);
                shift = 0;
                if ((b !== 0) || (c !== 0)) {
                    shift = Math.sqrt(b * b + c);
                    if (b < 0) {
                        shift = -shift;
                    }
                    shift = c / (b + shift);
                }
                f = (sk + sp) * (sk - sp) + shift;
                g = sk * ek;
                for (j = k; j < p - 1; j++) {
                    t = hypotenuse(f, g);
                    cs = f / t;
                    sn = g / t;
                    if (j !== k) {
                        e[j - 1] = t;
                    }
                    f = cs * s[j] + sn * e[j];
                    e[j] = cs * e[j] - sn * s[j];
                    g = sn * s[j + 1];
                    s[j + 1] = cs * s[j + 1];
                    if (wantv) {
                        for (i = 0; i < n; i++) {
                            t = cs * V[i][j] + sn * V[i][j + 1];
                            V[i][j + 1] = -sn * V[i][j] + cs * V[i][j + 1];
                            V[i][j] = t;
                        }
                    }
                    t = hypotenuse(f, g);
                    cs = f / t;
                    sn = g / t;
                    s[j] = t;
                    f = cs * e[j] + sn * s[j + 1];
                    s[j + 1] = -sn * e[j] + cs * s[j + 1];
                    g = sn * e[j + 1];
                    e[j + 1] = cs * e[j + 1];
                    if (wantu && (j < m - 1)) {
                        for (i = 0; i < m; i++) {
                            t = cs * U[i][j] + sn * U[i][j + 1];
                            U[i][j + 1] = -sn * U[i][j] + cs * U[i][j + 1];
                            U[i][j] = t;
                        }
                    }
                }
                e[p - 2] = f;
                iter = iter + 1;
                break;
            }
            case 4: {
                if (s[k] <= 0) {
                    s[k] = (s[k] < 0 ? -s[k] : 0);
                    if (wantv) {
                        for (i = 0; i <= pp; i++) {
                            V[i][k] = -V[i][k];
                        }
                    }
                }
                while (k < pp) {
                    if (s[k] >= s[k + 1]) {
                        break;
                    }
                    t = s[k];
                    s[k] = s[k + 1];
                    s[k + 1] = t;
                    if (wantv && (k < n - 1)) {
                        for (i = 0; i < n; i++) {
                            t = V[i][k + 1];
                            V[i][k + 1] = V[i][k];
                            V[i][k] = t;
                        }
                    }
                    if (wantu && (k < m - 1)) {
                        for (i = 0; i < m; i++) {
                            t = U[i][k + 1];
                            U[i][k + 1] = U[i][k];
                            U[i][k] = t;
                        }
                    }
                    k++;
                }
                iter = 0;
                p--;
                break;
            }
        }
    }

    if (swapped) {
        var tmp = V;
        V = U;
        U = tmp;
    }

    this.m = m;
    this.n = n;
    this.s = s;
    this.U = U;
    this.V = V;
}

SingularValueDecomposition.prototype = {
    get condition() {
        return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    },
    get norm2() {
        return this.s[0];
    },
    get rank() {
        var eps = Math.pow(2, -52),
            tol = Math.max(this.m, this.n) * this.s[0] * eps,
            r = 0,
            s = this.s;
        for (var i = 0, ii = s.length; i < ii; i++) {
            if (s[i] > tol) {
                r++;
            }
        }
        return r;
    },
    get diagonal() {
        return this.s;
    },
    // https://github.com/accord-net/framework/blob/development/Sources/Accord.Math/Decompositions/SingularValueDecomposition.cs
    get threshold() {
        return (Math.pow(2, -52) / 2) * Math.max(this.m, this.n) * this.s[0];
    },
    get leftSingularVectors() {
        return this.U;
    },
    get rightSingularVectors() {
        return this.V;
    },
    get diagonalMatrix() {
        return Matrix.diag(this.s);
    },
    solve: function (value) {

        var Y = value,
            e = this.threshold,
            scols = this.s.length,
            Ls = Matrix.zeros(scols, scols),
            i;

        for (i = 0; i < scols; i++) {
            if (Math.abs(this.s[i]) <= e) {
                Ls[i][i] = 0;
            } else {
                Ls[i][i] = 1 / this.s[i];
            }
        }


        var VL = this.V.mmul(Ls),
            vrows = this.V.rows,
            urows = this.U.rows,
            VLU = Matrix.zeros(vrows, urows),
            j, k, sum;

        for (i = 0; i < vrows; i++) {
            for (j = 0; j < urows; j++) {
                sum = 0;
                for (k = 0; k < scols; k++) {
                    sum += VL[i][k] * this.U[j][k];
                }
                VLU[i][j] = sum;
            }
        }

        return VLU.mmul(Y);
    },
    solveForDiagonal: function (value) {
        return this.solve(Matrix.diag(value));
    },
    inverse: function () {
        var e = this.threshold,
            vrows = this.V.rows,
            vcols = this.V.columns,
            X = new Matrix(vrows, this.s.length),
            i, j;

        for (i = 0; i < vrows; i++) {
            for (j = 0; j < vcols; j++) {
                if (Math.abs(this.s[j]) > e) {
                    X[i][j] = this.V[i][j] / this.s[j];
                } else {
                    X[i][j] = 0;
                }
            }
        }

        var urows = this.U.rows,
            ucols = this.U.columns,
            Y = new Matrix(vrows, urows),
            k, sum;

        for (i = 0; i < vrows; i++) {
            for (j = 0; j < urows; j++) {
                sum = 0;
                for (k = 0; k < ucols; k++) {
                    sum += X[i][k] * this.U[j][k];
                }
                Y[i][j] = sum;
            }
        }

        return Y;
    }
};

module.exports = SingularValueDecomposition;

},{"../matrix":13,"./util":10}],10:[function(require,module,exports){
'use strict';

exports.hypotenuse = function hypotenuse(a, b) {
    var r;
    if (Math.abs(a) > Math.abs(b)) {
        r = b / a;
        return Math.abs(a) * Math.sqrt(1 + r * r);
    }
    if (b !== 0) {
        r = a / b;
        return Math.abs(b) * Math.sqrt(1 + r * r);
    }
    return 0;
};

},{}],11:[function(require,module,exports){
'use strict';

var Matrix = require('./matrix');

var SingularValueDecomposition = require('./dc/svd');
var EigenvalueDecomposition = require('./dc/evd');
var LuDecomposition = require('./dc/lu');
var QrDecomposition = require('./dc/qr');
var CholeskyDecomposition = require('./dc/cholesky');

function inverse(matrix) {
    return solve(matrix, Matrix.eye(matrix.rows));
}

Matrix.prototype.inverse = function () {
    return inverse(this);
};

function solve(leftHandSide, rightHandSide) {
    return leftHandSide.isSquare() ? new LuDecomposition(leftHandSide).solve(rightHandSide) : new QrDecomposition(leftHandSide).solve(rightHandSide);
}

Matrix.prototype.solve = function (other) {
    return solve(this, other);
};

module.exports = {
    SingularValueDecomposition: SingularValueDecomposition,
    SVD: SingularValueDecomposition,
    EigenvalueDecomposition: EigenvalueDecomposition,
    EVD: EigenvalueDecomposition,
    LuDecomposition: LuDecomposition,
    LU: LuDecomposition,
    QrDecomposition: QrDecomposition,
    QR: QrDecomposition,
    CholeskyDecomposition: CholeskyDecomposition,
    CHO: CholeskyDecomposition,
    inverse: inverse,
    solve: solve
};

},{"./dc/cholesky":5,"./dc/evd":6,"./dc/lu":7,"./dc/qr":8,"./dc/svd":9,"./matrix":13}],12:[function(require,module,exports){
'use strict';

module.exports = require('./matrix');
module.exports.Decompositions = module.exports.DC = require('./decompositions');

},{"./decompositions":11,"./matrix":13}],13:[function(require,module,exports){
'use strict';

var Asplice = Array.prototype.splice,
    Aconcat = Array.prototype.concat;

// For performance : http://jsperf.com/clone-array-slice-vs-while-vs-for
function slice(arr) {
    var i = 0,
        ii = arr.length,
        result = new Array(ii);
    for (; i < ii; i++) {
        result[i] = arr[i];
    }
    return result;
}

/**
 * Real matrix.
 * @constructor
 * @param {number|Array} nRows - Number of rows of the new matrix or a 2D array containing the data.
 * @param {number|boolean} [nColumns] - Number of columns of the new matrix or a boolean specifying if the input array should be cloned
 */
function Matrix(nRows, nColumns) {
    var i = 0, rows, columns, matrix, newInstance;
    if (Array.isArray(nRows)) {
        newInstance = nColumns;
        matrix = newInstance ? slice(nRows) : nRows;
        nRows = matrix.length;
        nColumns = matrix[0].length;
        if (typeof nColumns === 'undefined') {
            throw new TypeError('Data must be a 2D array');
        }
        if (nRows > 0 && nColumns > 0) {
            for (; i < nRows; i++) {
                if (matrix[i].length !== nColumns) {
                    throw new RangeError('Inconsistent array dimensions');
                } else if (newInstance) {
                    matrix[i] = slice(matrix[i]);
                }
            }
        } else {
            throw new RangeError('Invalid dimensions: ' + nRows + 'x' + nColumns);
        }
    } else if (typeof nRows === 'number') { // Create empty matrix
        if (nRows > 0 && nColumns > 0) {
            matrix = new Array(nRows);
            for (; i < nRows; i++) {
                matrix[i] = new Array(nColumns);
            }
        } else {
            throw new RangeError('Invalid dimensions: ' + nRows + 'x' + nColumns);
        }
    } else {
        throw new TypeError('Invalid arguments');
    }

    Object.defineProperty(matrix, 'rows', {writable: true, value: nRows});
    Object.defineProperty(matrix, 'columns', {writable: true, value: nColumns});

    matrix.__proto__ = Matrix.prototype;

    return matrix;
}

/**
 * Constructs a Matrix with the chosen dimensions from a 1D array.
 * @param {number} newRows - Number of rows
 * @param {number} newColumns - Number of columns
 * @param {Array} newData - A 1D array containing data for the matrix
 * @returns {Matrix} - The new matrix
 */
Matrix.from1DArray = function from1DArray(newRows, newColumns, newData) {
    var length, data, i = 0;

    length = newRows * newColumns;
    if (length !== newData.length)
        throw new RangeError('Data length does not match given dimensions');

    data = new Array(newRows);
    for (; i < newRows; i++) {
        data[i] = newData.slice(i * newColumns, (i + 1) * newColumns);
    }
    return new Matrix(data);
};

/**
 * Creates a row vector, a matrix with only one row.
 * @param {Array} newData - A 1D array containing data for the vector
 * @returns {Matrix} - The new matrix
 */
Matrix.rowVector = function rowVector(newData) {
    return new Matrix([newData]);
};

/**
 * Creates a column vector, a matrix with only one column.
 * @param {Array} newData - A 1D array containing data for the vector
 * @returns {Matrix} - The new matrix
 */
Matrix.columnVector = function columnVector(newData) {
    var l = newData.length, vector = new Array(l);
    for (var i = 0; i < l; i++)
        vector[i] = [newData[i]];
    return new Matrix(vector);
};

/**
 * Creates an empty matrix with the given dimensions. Values will be undefined. Same as using new Matrix(rows, columns).
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @returns {Matrix} - The new matrix
 */
Matrix.empty = function empty(rows, columns) {
    return new Matrix(rows, columns);
};

/**
 * Creates a matrix with the given dimensions. Values will be set to zero.
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @returns {Matrix} - The new matrix
 */
Matrix.zeros = function zeros(rows, columns) {
    return Matrix.empty(rows, columns).fill(0);
};

/**
 * Creates a matrix with the given dimensions. Values will be set to one.
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @returns {Matrix} - The new matrix
 */
Matrix.ones = function ones(rows, columns) {
    return Matrix.empty(rows, columns).fill(1);
};

/**
 * Creates a matrix with the given dimensions. Values will be randomly set using Math.random().
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @returns {Matrix} The new matrix
 */
Matrix.rand = function rand(rows, columns) {
    var matrix = Matrix.empty(rows, columns);
    for (var i = 0, ii = matrix.rows; i < ii; i++) {
        for (var j = 0, jj = matrix.columns; j < jj; j++) {
            matrix[i][j] = Math.random();
        }
    }
    return matrix;
};

/**
 * Creates an identity matrix with the given dimension. Values of the diagonal will be 1 and other will be 0.
 * @param {number} n - Number of rows and columns
 * @returns {Matrix} - The new matrix
 */
Matrix.eye = function eye(n) {
    var matrix = Matrix.zeros(n, n), l = matrix.rows;
    for (var i = 0; i < l; i++) {
        matrix[i][i] = 1;
    }
    return matrix;
};

/**
 * Creates a diagonal matrix based on the given array.
 * @param {Array} data - Array containing the data for the diagonal
 * @returns {Matrix} - The new matrix
 */
Matrix.diag = function diag(data) {
    var l = data.length, matrix = Matrix.zeros(l, l);
    for (var i = 0; i < l; i++) {
        matrix[i][i] = data[i];
    }
    return matrix;
};

/**
 * Creates an array of indices between two values
 * @param {number} from
 * @param {number} to
 * @returns {Array}
 */
Matrix.indices = function indices(from, to) {
    var vector = new Array(to - from);
    for (var i = 0; i < vector.length; i++)
        vector[i] = from++;
    return vector;
};

// TODO DOC
Matrix.stack = function stack(arg1) {
    var i, j, k;
    if (Matrix.isMatrix(arg1)) {
        var rows = 0,
            cols = 0;
        for (i = 0; i < arguments.length; i++) {
            rows += arguments[i].rows;
            if (arguments[i].columns > cols)
                cols = arguments[i].columns;
        }

        var r = Matrix.zeros(rows, cols);
        var c = 0;
        for (i = 0; i < arguments.length; i++) {
            var current = arguments[i];
            for (j = 0; j < current.rows; j++) {
                for (k = 0; k < current.columns; k++)
                    r[c][k] = current[j][k];
                c++;
            }
        }
        return r;
    }
    else if (Array.isArray(arg1)) {
        var matrix = Matrix.empty(arguments.length, arg1.length);
        for (i = 0; i < arguments.length; i++)
            matrix.setRow(i, arguments[i]);
        return matrix;
    }
};

// TODO DOC
Matrix.expand = function expand(base, count) {
    var expansion = [];
    for (var i = 0; i < count.length; i++)
        for (var j = 0; j < count[i]; j++)
            expansion.push(base[i]);
    return new Matrix(expansion);
};

/**
 * Check that the provided value is a Matrix and tries to instantiate one if not
 * @param value - The value to check
 * @returns {Matrix}
 * @throws {TypeError}
 */
Matrix.checkMatrix = function checkMatrix(value) {
    if (!value) {
        throw new TypeError('Argument has to be a matrix');
    }
    if (value.klass !== 'Matrix') {
        value = new Matrix(value);
    }
    return value;
};

/**
 * Returns true if the argument is a Matrix, false otherwise
 * @param value - The value to check
 * @returns {boolean}
 */
Matrix.isMatrix = function isMatrix(value) {
    return value ? value.klass === 'Matrix' : false;
};

/**
 * @property {string} - The name of this class.
 */
Object.defineProperty(Matrix.prototype, 'klass', {
    get: function klass() {
        return 'Matrix';
    }
});

/**
 * @property {number} - The number of elements in the matrix.
 */
Object.defineProperty(Matrix.prototype, 'size', {
    get: function size() {
        return this.rows * this.columns;
    }
});

/**
 * @private
 * Internal check that a row index is not out of bounds
 * @param {number} index
 */
Matrix.prototype.checkRowIndex = function checkRowIndex(index) {
    if (index < 0 || index > this.rows - 1)
        throw new RangeError('Row index out of range.');
};

/**
 * @private
 * Internal check that a column index is not out of bounds
 * @param {number} index
 */
Matrix.prototype.checkColumnIndex = function checkColumnIndex(index) {
    if (index < 0 || index > this.columns - 1)
        throw new RangeError('Column index out of range.');
};

/**
 * @private
 * Internal check that two matrices have the same dimensions
 * @param {Matrix} otherMatrix
 */
Matrix.prototype.checkDimensions = function checkDimensions(otherMatrix) {
    if ((this.rows !== otherMatrix.rows) || (this.columns !== otherMatrix.columns))
        throw new RangeError('Matrices dimensions must be equal.');
};

/**
 * Applies a callback for each element of the matrix. The function is called in the matrix (this) context.
 * @param {function} callback - Function that will be called with two parameters : i (row) and j (column)
 * @returns {Matrix} this
 */
Matrix.prototype.apply = function apply(callback) {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            callback.call(this, i, j);
        }
    }
    return this;
};

/**
 * Creates an exact and independent copy of the matrix
 * @returns {Matrix}
 */
Matrix.prototype.clone = function clone() {
    return new Matrix(this.to2DArray());
};

/**
 * Returns a new 1D array filled row by row with the matrix values
 * @returns {Array}
 */
Matrix.prototype.to1DArray = function to1DArray() {
    return Aconcat.apply([], this);
};

/**
 * Returns a 2D array containing a copy of the data
 * @returns {Array}
 */
Matrix.prototype.to2DArray = function to2DArray() {
    var l = this.rows, copy = new Array(l);
    for (var i = 0; i < l; i++) {
        copy[i] = slice(this[i]);
    }
    return copy;
};

/**
 * @returns {boolean} true if the matrix has one row
 */
Matrix.prototype.isRowVector = function isRowVector() {
    return this.rows === 1;
};

/**
 * @returns {boolean} true if the matrix has one column
 */
Matrix.prototype.isColumnVector = function isColumnVector() {
    return this.columns === 1;
};

/**
 * @returns {boolean} true if the matrix has one row or one column
 */
Matrix.prototype.isVector = function isVector() {
    return (this.rows === 1) || (this.columns === 1);
};

/**
 * @returns {boolean} true if the matrix has the same number of rows and columns
 */
Matrix.prototype.isSquare = function isSquare() {
    return this.rows === this.columns;
};

/**
 * @returns {boolean} true if the matrix is square and has the same values on both sides of the diagonal
 */
Matrix.prototype.isSymmetric = function isSymmetric() {
    if (this.isSquare()) {
        var l = this.rows;
        for (var i = 0; i < l; i++) {
            for (var j = 0; j <= i; j++) {
                if (this[i][j] !== this[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
};

/**
 * Sets a given element of the matrix. mat.set(3,4,1) is equivalent to mat[3][4]=1
 * @param {number} rowIndex - Index of the row
 * @param {number} columnIndex - Index of the column
 * @param {number} value - The new value for the element
 * @returns {Matrix} this
 */
Matrix.prototype.set = function set(rowIndex, columnIndex, value) {
    this[rowIndex][columnIndex] = value;
    return this;
};

/**
 * Returns the given element of the matrix. mat.get(3,4) is equivalent to matrix[3][4]
 * @param {number} rowIndex - Index of the row
 * @param {number} columnIndex - Index of the column
 * @returns {number}
 */
Matrix.prototype.get = function get(rowIndex, columnIndex) {
    return this[rowIndex][columnIndex];
};

/**
 * Fills the matrix with a given value. All elements will be set to this value.
 * @param {number} value - New value
 * @returns {Matrix} this
 */
Matrix.prototype.fill = function fill(value) {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] = value;
        }
    }
    return this;
};

/**
 * Negates the matrix. All elements will be multiplied by (-1)
 * @returns {Matrix} this
 */
Matrix.prototype.neg = function neg() {
    return this.mulS(-1);
};

/**
 * Adds a scalar or values from another matrix (in place)
 * @param {number|Matrix} value
 * @returns {Matrix} this
 */
Matrix.prototype.add = function add(value) {
    if (typeof value === 'number')
        return this.addS(value);
    value = Matrix.checkMatrix(value);
        return this.addM(value);
};

/**
 * Adds a scalar to each element of the matrix
 * @param {number} value
 * @returns {Matrix} this
 */
Matrix.prototype.addS = function addS(value) {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] += value;
        }
    }
    return this;
};

/**
 * Adds the value of each element of matrix to the corresponding element of this
 * @param {Matrix} matrix
 * @returns {Matrix} this
 */
Matrix.prototype.addM = function addM(matrix) {
    this.checkDimensions(matrix);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] += matrix[i][j];
        }
    }
    return this;
};

/**
 * Subtracts a scalar or values from another matrix (in place)
 * @param {number|Matrix} value
 * @returns {Matrix} this
 */
Matrix.prototype.sub = function sub(value) {
    if (typeof value === 'number')
        return this.subS(value);
    value = Matrix.checkMatrix(value);
        return this.subM(value);
};

/**
 * Subtracts a scalar from each element of the matrix
 * @param {number} value
 * @returns {Matrix} this
 */
Matrix.prototype.subS = function subS(value) {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] -= value;
        }
    }
    return this;
};

/**
 * Subtracts the value of each element of matrix from the corresponding element of this
 * @param {Matrix} matrix
 * @returns {Matrix} this
 */
Matrix.prototype.subM = function subM(matrix) {
    this.checkDimensions(matrix);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] -= matrix[i][j];
        }
    }
    return this;
};

/**
 * Multiplies a scalar or values from another matrix (in place)
 * @param {number|Matrix} value
 * @returns {Matrix} this
 */
Matrix.prototype.mul = function mul(value) {
    if (typeof value === 'number')
        return this.mulS(value);
    value = Matrix.checkMatrix(value);
        return this.mulM(value);
};

/**
 * Multiplies a scalar with each element of the matrix
 * @param {number} value
 * @returns {Matrix} this
 */
Matrix.prototype.mulS = function mulS(value) {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] *= value;
        }
    }
    return this;
};

/**
 * Multiplies the value of each element of matrix with the corresponding element of this
 * @param {Matrix} matrix
 * @returns {Matrix} this
 */
Matrix.prototype.mulM = function mulM(matrix) {
    this.checkDimensions(matrix);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] *= matrix[i][j];
        }
    }
    return this;
};

/**
 * Divides by a scalar or values from another matrix (in place)
 * @param {number|Matrix} value
 * @returns {Matrix} this
 */
Matrix.prototype.div = function div(value) {
    if (typeof value === 'number')
        return this.divS(value);
    value = Matrix.checkMatrix(value);
        return this.divM(value);
};

/**
 * Divides each element of the matrix by a scalar
 * @param {number} value
 * @returns {Matrix} this
 */
Matrix.prototype.divS = function divS(value) {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] /= value;
        }
    }
    return this;
};

/**
 * Divides each element of this by the corresponding element of matrix
 * @param {Matrix} matrix
 * @returns {Matrix} this
 */
Matrix.prototype.divM = function divM(matrix) {
    this.checkDimensions(matrix);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] /= matrix[i][j];
        }
    }
    return this;
};

/**
 * Returns a new array from the given row index
 * @param {number} index - Row index
 * @returns {Array}
 */
Matrix.prototype.getRow = function getRow(index) {
    this.checkRowIndex(index);
    return slice(this[index]);
};

/**
 * Returns a new row vector from the given row index
 * @param {number} index - Row index
 * @returns {Matrix}
 */
Matrix.prototype.getRowVector = function getRowVector(index) {
    return Matrix.rowVector(this.getRow(index));
};

/**
 * Sets a row at the given index
 * @param {number} index - Row index
 * @param {Array|Matrix} array - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.setRow = function setRow(index, array) {
    this.checkRowIndex(index);
    if (Matrix.isMatrix(array)) array = array.to1DArray();
    if (array.length !== this.columns)
        throw new RangeError('Invalid row size');
    this[index] = slice(array);
    return this;
};

/**
 * Removes a row from the given index
 * @param {number} index - Row index
 * @returns {Matrix} this
 */
Matrix.prototype.removeRow = function removeRow(index) {
    this.checkRowIndex(index);
    if (this.rows === 1)
        throw new RangeError('A matrix cannot have less than one row');
    Asplice.call(this, index, 1);
    this.rows -= 1;
    return this;
};

/**
 * Adds a row at the given index
 * @param {number} [index = this.rows] - Row index
 * @param {Array|Matrix} array - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.addRow = function addRow(index, array) {
    if (typeof array === 'undefined') {
        array = index;
        index = this.rows;
    }
    if (index < 0 || index > this.rows)
        throw new RangeError('Row index out of range.');
    if (Matrix.isMatrix(array)) array = array.to1DArray();
    if (array.length !== this.columns)
        throw new RangeError('Invalid row size');
    Asplice.call(this, index, 0, slice(array));
    this.rows += 1;
    return this;
};

/**
 * Swaps two rows
 * @param {number} row1 - First row index
 * @param {number} row2 - Second row index
 * @returns {Matrix} this
 */
Matrix.prototype.swapRows = function swapRows(row1, row2) {
    this.checkRowIndex(row1);
    this.checkRowIndex(row2);
    var temp = this[row1];
    this[row1] = this[row2];
    this[row2] = temp;
    return this;
};

/**
 * Returns a new array from the given column index
 * @param {number} index - Column index
 * @returns {Array}
 */
Matrix.prototype.getColumn = function getColumn(index) {
    this.checkColumnIndex(index);
    var l = this.rows, column = new Array(l);
    for (var i = 0; i < l; i++) {
        column[i] = this[i][index];
    }
    return column;
};

/**
 * Returns a new column vector from the given column index
 * @param {number} index - Column index
 * @returns {Matrix}
 */
Matrix.prototype.getColumnVector = function getColumnVector(index) {
    return Matrix.columnVector(this.getColumn(index));
};

/**
 * Sets a column at the given index
 * @param {number} index - Column index
 * @param {Array|Matrix} array - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.setColumn = function setColumn(index, array) {
    this.checkColumnIndex(index);
    if (Matrix.isMatrix(array)) array = array.to1DArray();
    var l = this.rows;
    if (array.length !== l)
        throw new RangeError('Invalid column size');
    for (var i = 0; i < l; i++) {
        this[i][index] = array[i];
    }
    return this;
};

/**
 * Removes a column from the given index
 * @param {number} index - Column index
 * @returns {Matrix} this
 */
Matrix.prototype.removeColumn = function removeColumn(index) {
    this.checkColumnIndex(index);
    if (this.columns === 1)
        throw new RangeError('A matrix cannot have less than one column');
    for (var i = 0, ii = this.rows; i < ii; i++) {
        this[i].splice(index, 1);
    }
    this.columns -= 1;
    return this;
};

/**
 * Adds a column at the given index
 * @param {number} [index = this.columns] - Column index
 * @param {Array|Matrix} array - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.addColumn = function addColumn(index, array) {
    if (typeof array === 'undefined') {
        array = index;
        index = this.columns;
    }
    if (index < 0 || index > this.columns)
        throw new RangeError('Column index out of range.');
    if (Matrix.isMatrix(array)) array = array.to1DArray();
    var l = this.rows;
    if (array.length !== l)
        throw new RangeError('Invalid column size');
    for (var i = 0; i < l; i++) {
        this[i].splice(index, 0, array[i]);
    }
    this.columns += 1;
    return this;
};

/**
 * Swaps two columns
 * @param {number} column1 - First column index
 * @param {number} column2 - Second column index
 * @returns {Matrix} this
 */
Matrix.prototype.swapColumns = function swapColumns(column1, column2) {
    this.checkRowIndex(column1);
    this.checkRowIndex(column2);
    var l = this.rows, temp, row;
    for (var i = 0; i < l; i++) {
        row = this[i];
        temp = row[column1];
        row[column1] = row[column2];
        row[column2] = temp;
    }
    return this;
};

/**
 * @private
 * Internal check that the provided vector is an array with the right length
 * @param {Array|Matrix} vector
 * @returns {Array}
 * @throws {RangeError}
 */
Matrix.prototype.checkRowVector = function checkRowVector(vector) {
    if (Matrix.isMatrix(vector))
        vector = vector.to1DArray();
    if (vector.length !== this.columns)
        throw new RangeError('vector size must be the same as the number of columns');
    return vector;
};

/**
 * @private
 * Internal check that the provided vector is an array with the right length
 * @param {Array|Matrix} vector
 * @returns {Array}
 * @throws {RangeError}
 */
Matrix.prototype.checkColumnVector = function checkColumnVector(vector) {
    if (Matrix.isMatrix(vector))
        vector = vector.to1DArray();
    if (vector.length !== this.rows)
        throw new RangeError('vector size must be the same as the number of rows');
    return vector;
};

/**
 * Adds the values of a vector to each row
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.addRowVector = function addRowVector(vector) {
    vector = this.checkRowVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] += vector[j];
        }
    }
    return this;
};

/**
 * Subtracts the values of a vector from each row
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.subRowVector = function subRowVector(vector) {
    vector = this.checkRowVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] -= vector[j];
        }
    }
    return this;
};

/**
 * Multiplies the values of a vector with each row
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.mulRowVector = function mulRowVector(vector) {
    vector = this.checkRowVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] *= vector[j];
        }
    }
    return this;
};

/**
 * Divides the values of each row by those of a vector
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.divRowVector = function divRowVector(vector) {
    vector = this.checkRowVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] /= vector[j];
        }
    }
    return this;
};

/**
 * Adds the values of a vector to each column
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.addColumnVector = function addColumnVector(vector) {
    vector = this.checkColumnVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] += vector[i];
        }
    }
    return this;
};

/**
 * Subtracts the values of a vector from each column
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.subColumnVector = function subColumnVector(vector) {
    vector = this.checkColumnVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] -= vector[i];
        }
    }
    return this;
};

/**
 * Multiplies the values of a vector with each column
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.mulColumnVector = function mulColumnVector(vector) {
    vector = this.checkColumnVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] *= vector[i];
        }
    }
    return this;
};

/**
 * Divides the values of each column by those of a vector
 * @param {Array|Matrix} vector - Array or vector
 * @returns {Matrix} this
 */
Matrix.prototype.divColumnVector = function divColumnVector(vector) {
    vector = this.checkColumnVector(vector);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] /= vector[i];
        }
    }
    return this;
};

/**
 * Multiplies the values of a row with a scalar
 * @param {number} index - Row index
 * @param {number} value
 * @returns {Matrix} this
 */
Matrix.prototype.mulRow = function mulRow(index, value) {
    this.checkRowIndex(index);
    var i = 0, l = this.columns;
    for (; i < l; i++) {
        this[index][i] *= value;
    }
    return this;
};

/**
 * Multiplies the values of a column with a scalar
 * @param {number} index - Column index
 * @param {number} value
 * @returns {Matrix} this
 */
Matrix.prototype.mulColumn = function mulColumn(index, value) {
    this.checkColumnIndex(index);
    var i = 0, l = this.rows;
    for (; i < l; i++) {
        this[i][index] *= value;
    }
};

/**
 * A matrix index
 * @typedef {Object} MatrixIndex
 * @property {number} row
 * @property {number} column
 */

/**
 * Returns the maximum value of the matrix
 * @returns {number}
 */
Matrix.prototype.max = function max() {
    var v = -Infinity;
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            if (this[i][j] > v) {
                v = this[i][j];
            }
        }
    }
    return v;
};

/**
 * Returns the index of the maximum value
 * @returns {MatrixIndex}
 */
Matrix.prototype.maxIndex = function maxIndex() {
    var v = -Infinity;
    var idx = {};
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            if (this[i][j] > v) {
                v = this[i][j];
                idx.row = i;
                idx.column = j;
            }
        }
    }
    return idx;
};

/**
 * Returns the minimum value of the matrix
 * @returns {number}
 */
Matrix.prototype.min = function min() {
    var v = Infinity;
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            if (this[i][j] < v) {
                v = this[i][j];
            }
        }
    }
    return v;
};

/**
 * Returns the index of the minimum value
 * @returns {MatrixIndex}
 */
Matrix.prototype.minIndex = function minIndex() {
    var v = Infinity;
    var idx = {};
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            if (this[i][j] < v) {
                v = this[i][j];
                idx.row = i;
                idx.column = j;
            }
        }
    }
    return idx;
};

/**
 * Returns the maximum value of one row
 * @param {number} index - Row index
 * @returns {number}
 */
Matrix.prototype.maxRow = function maxRow(index) {
    this.checkRowIndex(index);
    var v = -Infinity;
    for (var i = 0, ii = this.columns; i < ii; i++) {
        if (this[index][i] > v) {
            v = this[index][i];
        }
    }
    return v;
};

/**
 * Returns the index of the maximum value of one row
 * @param {number} index - Row index
 * @returns {MatrixIndex}
 */
Matrix.prototype.maxRowIndex = function maxRowIndex(index) {
    this.checkRowIndex(index);
    var v = -Infinity;
    var idx = {
            row: index
        };
    for (var i = 0, ii = this.columns; i < ii; i++) {
        if (this[index][i] > v) {
            v = this[index][i];
            idx.column = i;
        }
    }
    return idx;
};

/**
 * Returns the minimum value of one row
 * @param {number} index - Row index
 * @returns {number}
 */
Matrix.prototype.minRow = function minRow(index) {
    this.checkRowIndex(index);
    var v = Infinity;
    for (var i = 0, ii = this.columns; i < ii; i++) {
        if (this[index][i] < v) {
            v = this[index][i];
        }
    }
    return v;
};

/**
 * Returns the index of the maximum value of one row
 * @param {number} index - Row index
 * @returns {MatrixIndex}
 */
Matrix.prototype.minRowIndex = function minRowIndex(index) {
    this.checkRowIndex(index);
    var v = Infinity;
    var idx = {
        row: index,
        column: 0
    };
    for (var i = 0, ii = this.columns; i < ii; i++) {
        if (this[index][i] < v) {
            v = this[index][i];
            idx.column = i;
        }
    }
    return idx;
};

/**
 * Returns the maximum value of one column
 * @param {number} index - Column index
 * @returns {number}
 */
Matrix.prototype.maxColumn = function maxColumn(index) {
    this.checkColumnIndex(index);
    var v = -Infinity;
    for (var i = 0, ii = this.rows; i < ii; i++) {
        if (this[i][index] > v) {
            v = this[i][index];
        }
    }
    return v;
};

/**
 * Returns the index of the maximum value of one column
 * @param {number} index - Column index
 * @returns {MatrixIndex}
 */
Matrix.prototype.maxColumnIndex = function maxColumnIndex(index) {
    this.checkColumnIndex(index);
    var v = -Infinity;
    var idx = {
        row: 0,
        column: index
    };
    for (var i = 0, ii = this.rows; i < ii; i++) {
        if (this[i][index] > v) {
            v = this[i][index];
            idx.row = i;
        }
    }
    return idx;
};

/**
 * Returns the minimum value of one column
 * @param {number} index - Column index
 * @returns {number}
 */
Matrix.prototype.minColumn = function minColumn(index) {
    this.checkColumnIndex(index);
    var v = Infinity;
    for (var i = 0, ii = this.rows; i < ii; i++) {
        if (this[i][index] < v) {
            v = this[i][index];
        }
    }
    return v;
};

/**
 * Returns the index of the minimum value of one column
 * @param {number} index - Column index
 * @returns {MatrixIndex}
 */
Matrix.prototype.minColumnIndex = function minColumnIndex(index) {
    this.checkColumnIndex(index);
    var v = Infinity;
    var idx = {
        row: 0,
        column: index
    };
    for (var i = 0, ii = this.rows; i < ii; i++) {
        if (this[i][index] < v) {
            v = this[i][index];
            idx.row = i;
        }
    }
    return idx;
};

/**
 * Returns an array containing the diagonal values of the matrix
 * @returns {Array}
 */
Matrix.prototype.diag = function diag() {
    if (!this.isSquare())
        throw new TypeError('Only square matrices have a diagonal.');
    var diag = new Array(this.rows);
    for (var i = 0, ii = this.rows; i < ii; i++) {
        diag[i] = this[i][i];
    }
    return diag;
};

/**
 * Returns the sum of all elements of the matrix
 * @returns {number}
 */
Matrix.prototype.sum = function sum() {
    var v = 0;
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            v += this[i][j];
        }
    }
    return v;
};

/**
 * Returns the mean of all elements of the matrix
 * @returns {number}
 */
Matrix.prototype.mean = function mean() {
    return this.sum() / this.size;
};

/**
 * Returns the product of all elements of the matrix
 * @returns {number}
 */
Matrix.prototype.prod = function prod() {
    var prod = 1;
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            prod *= this[i][j];
        }
    }
    return prod;
};

/**
 * Computes the cumulative sum of the matrix elements (in place, row by row)
 * @returns {Matrix} this
 */
Matrix.prototype.cumulativeSum = function cumulativeSum() {
    var sum = 0;
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            sum += this[i][j];
            this[i][j] = sum;
        }
    }
    return this;
};

/**
 * Computes the dot (scalar) product between the matrix and another
 * @param {Matrix} other vector
 * @returns {number}
 */
Matrix.prototype.dot = function dot(other) {
    if (this.size !== other.size)
        throw new RangeError('vectors do not have the same size');
    var vector1 = this.to1DArray();
    var vector2 = other.to1DArray();
    var dot = 0, l = vector1.length;
    for (var i = 0; i < l; i++) {
        dot += vector1[i] * vector2[i];
    }
    return dot;
};

/**
 * Returns the matrix product between this and other
 * @returns {Matrix}
 */
Matrix.prototype.mmul = function mmul(other) {
    if (!Matrix.isMatrix(other))
        throw new TypeError('parameter "other" must be a matrix');
    if (this.columns !== other.rows)
        console.warn('Number of columns of left matrix are not equal to number of rows of right matrix.');

    var m = this.rows, n = this.columns, p = other.columns;
    var result = new Matrix(m, p);

    var Bcolj = new Array(n);
    var i, j, k;
    for (j = 0; j < p; j++) {
        for (k = 0; k < n; k++)
            Bcolj[k] = other[k][j];

        for (i = 0; i < m; i++) {
            var Arowi = this[i];

            var s = 0;
            for (k = 0; k < n; k++)
                s += Arowi[k] * Bcolj[k];

            result[i][j] = s;
        }
    }
    return result;
};

/**
 * Sorts the rows (in place)
 * @param {function} compareFunction - usual Array.prototype.sort comparison function
 * @returns {Matrix} this
 */
Matrix.prototype.sortRows = function sortRows(compareFunction) {
    for (var i = 0, ii = this.rows; i < ii; i++) {
        this[i].sort(compareFunction);
    }
    return this;
};

/**
 * Sorts the columns (in place)
 * @param {function} compareFunction - usual Array.prototype.sort comparison function
 * @returns {Matrix} this
 */
Matrix.prototype.sortColumns = function sortColumns(compareFunction) {
    for (var i = 0, ii = this.columns; i < ii; i++) {
        this.setColumn(i, this.getColumn(i).sort(compareFunction));
    }
    return this;
};

/**
 * Transposes the matrix and returns a new one containing the result
 * @returns {Matrix}
 */
Matrix.prototype.transpose = function transpose() {
    var result = new Matrix(this.columns, this.rows);
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            result[j][i] = this[i][j];
        }
    }
    return result;
};

/**
 * Returns a subset of the matrix
 * @param {number} startRow - First row index
 * @param {number} endRow - Last row index
 * @param {number} startColumn - First column index
 * @param {number} endColumn - Last column index
 * @returns {Matrix}
 */
Matrix.prototype.subMatrix = function subMatrix(startRow, endRow, startColumn, endColumn) {
    if ((startRow > endRow) || (startColumn > endColumn) || (startRow < 0) || (startRow >= this.rows) || (endRow < 0) || (endRow >= this.rows) || (startColumn < 0) || (startColumn >= this.columns) || (endColumn < 0) || (endColumn >= this.columns))
        throw new RangeError('Argument out of range');
    var newMatrix = new Matrix(endRow - startRow + 1, endColumn - startColumn + 1);
    for (var i = startRow; i <= endRow; i++) {
        for (var j = startColumn; j <= endColumn; j++) {
            newMatrix[i - startRow][j - startColumn] = this[i][j];
        }
    }
    return newMatrix;
};

/**
 * Returns a subset of the matrix based on an array of row indices
 * @param {Array} indices - Array containing the row indices
 * @param {number} [startColumn = 0] - First column index
 * @param {number} [endColumn = this.columns-1] - Last column index
 * @returns {Matrix}
 */
Matrix.prototype.subMatrixRow = function subMatrixRow(indices, startColumn, endColumn) {
    if (typeof startColumn === 'undefined') {
        startColumn = 0;
        endColumn = this.columns - 1;
    } else if (typeof endColumn === 'undefined') {
        endColumn = this.columns - 1;
    }
    if ((startColumn > endColumn) || (startColumn < 0) || (startColumn >= this.columns) || (endColumn < 0) || (endColumn >= this.columns))
        throw new RangeError('Argument out of range.');
    var l = indices.length, rows = this.rows,
        X = new Matrix(l, endColumn - startColumn + 1);
    for (var i = 0; i < l; i++) {
        for (var j = startColumn; j <= endColumn; j++) {
            if ((indices[i] < 0) || (indices[i] >= rows))
                throw new RangeError('Argument out of range.');
            X[i][j - startColumn] = this[indices[i]][j];
        }
    }
    return X;
};

/**
 * Returns a subset of the matrix based on an array of column indices
 * @param {Array} indices - Array containing the column indices
 * @param {number} [startRow = 0] - First row index
 * @param {number} [endRow = this.rows-1] - Last row index
 * @returns {Matrix}
 */
Matrix.prototype.subMatrixColumn = function subMatrixColumn(indices, startRow, endRow) {
    if (typeof startRow === 'undefined') {
        startRow = 0;
        endRow = this.rows - 1;
    } else if (typeof endRow === 'undefined') {
        endRow = this.rows - 1;
    }
    if ((startRow > endRow) || (startRow < 0) || (startRow >= this.rows) || (endRow < 0) || (endRow >= this.rows))
        throw new RangeError('Argument out of range.');
    var l = indices.length, columns = this.columns,
        X = new Matrix(endRow - startRow + 1, l);
    for (var i = 0; i < l; i++) {
        for (var j = startRow; j <= endRow; j++) {
            if ((indices[i] < 0) || (indices[i] >= columns))
                throw new RangeError('Argument out of range.');
            X[j - startRow][i] = this[j][indices[i]];
        }
    }
    return X;
};

/**
 * Returns the trace of the matrix (sum of the diagonal elements)
 * @returns {number}
 */
Matrix.prototype.trace = function trace() {
    if (!this.isSquare())
        throw new TypeError('The matrix is not square');
    var trace = 0, i = 0, l = this.rows;
    for (; i < l; i++) {
        trace += this[i][i];
    }
    return trace;
};

/**
 * Sets each element of the matrix to its absolute value
 * @returns {Matrix} this
 */
Matrix.prototype.abs = function abs() {
    var ii = this.rows, jj = this.columns;
    for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
            this[i][j] = Math.abs(this[i][j]);
        }
    }
};

module.exports = Matrix;

},{}],14:[function(require,module,exports){
'use strict';

var LM = require('ml-curve-fitting');
var math = LM.Matrix.algebra;
var Matrix = require('ml-matrix');

/**
 * This function calculates the spectrum as a sum of lorentzian functions. The Lorentzian
 * parameters are divided in 3 batches. 1st: centers; 2nd: heights; 3th: widths;
 * @param t Ordinate values
 * @param p Lorentzian parameters
 * @param c Constant parameters(Not used)
 * @returns {*}
 */
function sumOfLorentzians(t,p,c){
    var nL = p.length/3,factor,i, j,p2, cols = t.rows;
    var result = Matrix.zeros(t.length,1);

    for(i=0;i<nL;i++){
        p2 = Math.pow(p[i+nL*2][0]/2,2);
        factor = p[i+nL][0]*p2;
        for(j=0;j<cols;j++){
            result[j][0]+=factor/(Math.pow(t[j][0]-p[i][0],2)+p2);
        }
    }
    return result;
}

/**
 * This function calculates the spectrum as a sum of gaussian functions. The Gaussian
 * parameters are divided in 3 batches. 1st: centers; 2nd: height; 3th: std's;
 * @param t Ordinate values
 * @param p Gaussian parameters
 * @param c Constant parameters(Not used)
 * @returns {*}
 */
function sumOfGaussians(t,p,c){
    var nL = p.length/3,factor,i, j, cols = t.rows;
    var result = Matrix.zeros(t.length,1);

    for(i=0;i<nL;i++){
        factor = p[i+nL*2][0]*p[i+nL*2][0]/2;
        for(j=0;j<cols;j++){
            result[j][0]+=p[i+nL][0]*Math.exp(-(t[i][0]-p[i][0])*(t[i][0]-p[i][0])/factor);
        }
    }
    return result;
}
/**
 * Single 4 parameter lorentzian function
 * @param t Ordinate values
 * @param p Lorentzian parameters
 * @param c Constant parameters(Not used)
 * @returns {*}
 */
function singleLorentzian(t,p,c){
    var factor = p[1][0]*Math.pow(p[2][0]/2,2);
    var rows = t.rows;
    var result = new Matrix(t.rows, t.columns);
    for(var i=0;i<rows;i++){
        result[i][0]=factor/(Math.pow(t[i][0]-p[0][0],2)+Math.pow(p[2][0]/2,2));
    }
    return result;
}

/**
 * Single 3 parameter gaussian function
 * @param t Ordinate values
 * @param p Gaussian parameters [mean, height, std]
 * @param c Constant parameters(Not used)
 * @returns {*}
 */
function singleGaussian(t,p,c){
    var factor2 = p[2][0]*p[2][0]/2;
    var rows = t.rows;
    var result = new Matrix(t.rows, t.columns);
    for(var i=0;i<rows;i++){
        result[i][0]=p[1][0]*Math.exp(-(t[i][0]-p[0][0])*(t[i][0]-p[0][0])/factor2);
    }
    return result;
}

/**
 * * Fits a set of points to a Lorentzian function. Returns the center of the peak, the width at half height, and the height of the signal.
 * @param data,[y]
 * @returns {*[]}
 */
function optimizeSingleLorentzian(xy, peak, opts) {
    var xy2 = parseData(xy);
    var t = xy2[0];
    var y_data = xy2[1];
    var maxY = xy2[2];
    var nbPoints = t.columns, i;

    var weight = [nbPoints / Math.sqrt(y_data.dot(y_data))];

    var opts=Object.create(opts || [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ]);
    //var opts = [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ];
    var consts = [ ];
    var dt = Math.abs(t[0][0]-t[1][0]);// optional vector of constants
    var dx = new Matrix([[-dt/10000],[-1e-3],[-dt/10000]]);//-Math.abs(t[0][0]-t[1][0])/100;
    var p_init = new Matrix([[peak.x],[1],[peak.width]]);
    var p_min = new Matrix([[peak.x-dt],[0.75],[peak.width/4]]);
    var p_max = new Matrix([[peak.x+dt],[1.25],[peak.width*4]]);

    var p_fit = LM.optimize(singleLorentzian,p_init,t,y_data,weight,dx,p_min,p_max,consts,opts);


    p_fit = p_fit.p;
    return [p_fit[0],[p_fit[1][0]*maxY],p_fit[2]];

}

/**
 * Fits a set of points to a gaussian bell. Returns the mean of the peak, the std and the height of the signal.
 * @param data,[y]
 * @returns {*[]}
 */
function optimizeSingleGaussian(xy, peak, opts) {
    var xy2 = parseData(xy);
    var t = xy2[0];
    var y_data = xy2[1];
    var maxY = xy2[2];

    var nbPoints = t.columns, i;

    var weight = [nbPoints / Math.sqrt(y_data.dot(y_data))];

    var opts=Object.create(opts || [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ]);
    //var opts = [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ];
    var consts = [ ];                         // optional vector of constants
    var dt = Math.abs(t[0][0]-t[1][0]);
    var dx = new Matrix([[-dt/10000],[-1e-3],[-dt/10000]]);//-Math.abs(t[0][0]-t[1][0])/100;

    var dx = new Matrix([[-Math.abs(t[0][0]-t[1][0])/1000],[-1e-3],[-peak.width/1000]]);
    var p_init = new Matrix([[peak.x],[1],[peak.width]]);
    var p_min = new Matrix([[peak.x-dt],[0.75],[peak.width/4]]);
    var p_max = new Matrix([[peak.x+dt],[1.25],[peak.width*4]]);
    //var p_min = new Matrix([[peak.x-peak.width/4],[0.75],[peak.width/3]]);
    //var p_max = new Matrix([[peak.x+peak.width/4],[1.25],[peak.width*3]]);

    var p_fit = LM.optimize(singleGaussian,p_init,t,y_data,weight,dx,p_min,p_max,consts,opts);
    p_fit = p_fit.p;
    return [p_fit[0],[p_fit[1][0]*maxY],p_fit[2]];
}


/**
 *
 * @param xy A two column matrix containing the x and y data to be fitted
 * @param group A set of initial lorentzian parameters to be optimized [center, heigth, half_width_at_half_height]
 * @returns {Array} A set of final lorentzian parameters [center, heigth, hwhh*2]
 */
function optimizeLorentzianSum(xy, group, opts){
    var xy2 = parseData(xy);
    var t = xy2[0];
    var y_data = xy2[1];
    var maxY = xy2[2];
    var nbPoints = t.columns, i;

    var weight = [nbPoints / math.sqrt(y_data.dot(y_data))];
    var opts=Object.create(opts || [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ]);
    var consts = [ ];// optional vector of constants

    var nL = group.length;
    var p_init = new Matrix(nL*3,1);
    var p_min =  new Matrix(nL*3,1);
    var p_max =  new Matrix(nL*3,1);
    var dx = new Matrix(nL*3,1);
    var dt = Math.abs(t[0][0]-t[1][0]);
    for( i=0;i<nL;i++){
        p_init[i][0] = group[i].x;
        p_init[i+nL][0] = 1;
        p_init[i+2*nL][0] = group[i].width;

        p_min[i][0] = group[i].x-dt;//-group[i].width/4;
        p_min[i+nL][0] = 0;
        p_min[i+2*nL][0] = group[i].width/4;

        p_max[i][0] = group[i].x+dt;//+group[i].width/4;
        p_max[i+nL][0] = 1.5;
        p_max[i+2*nL][0] = group[i].width*4;

        dx[i][0] = -dt/1000;
        dx[i+nL][0] = -1e-3;
        dx[i+2*nL][0] = -dt/1000;
    }

    var dx = -Math.abs(t[0][0]-t[1][0])/10000;
    var p_fit = LM.optimize(sumOfLorentzians, p_init, t, y_data, weight, dx, p_min, p_max, consts, opts);
    p_fit=p_fit.p;
    //Put back the result in the correct format
    var result = new Array(nL);
    for( i=0;i<nL;i++){
        result[i]=[p_fit[i],[p_fit[i+nL][0]*maxY],p_fit[i+2*nL]];
    }

    return result;

}

/**
 *
 * @param xy A two column matrix containing the x and y data to be fitted
 * @param group A set of initial lorentzian parameters to be optimized [center, heigth, half_width_at_half_height]
 * @returns {Array} A set of final lorentzian parameters [center, heigth, hwhh*2]
 */
function optimizeGaussianSum(xy, group, opts){
    var xy2 = parseData(xy);
    var t = xy2[0];
    var y_data = xy2[1];
    var maxY = xy2[2];
    var nbPoints = t.rows,i;

    var weight = new Matrix(nbPoints,1);//[nbPoints / math.sqrt(y_data.dot(y_data))];
    var k = nbPoints / math.sqrt(y_data.dot(y_data));
    for(i=0;i<nbPoints;i++){
        weight[i][0]=k;///(y_data[i][0]);
        //weight[i][0]=k*(2-y_data[i][0]);
    }

    var opts=Object.create(opts || [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        2 ]);
    //var opts=[  3,    100, 1e-5, 1e-6, 1e-6, 1e-6, 1e-6,    11,    9,        1 ];
    var consts = [ ];// optional vector of constants

    var nL = group.length;
    var p_init = new Matrix(nL*3,1);
    var p_min =  new Matrix(nL*3,1);
    var p_max =  new Matrix(nL*3,1);
    var dx = new Matrix(nL*3,1);
    var dt = Math.abs(t[0][0]-t[1][0]);
    for( i=0;i<nL;i++){
        p_init[i][0] = group[i].x;
        p_init[i+nL][0] = group[i].y/maxY;
        p_init[i+2*nL][0] = group[i].width;

        p_min[i][0] = group[i].x-dt;
        p_min[i+nL][0] = group[i].y*0.8/maxY;
        p_min[i+2*nL][0] = group[i].width/2;

        p_max[i][0] = group[i].x+dt;
        p_max[i+nL][0] = group[i].y*1.2/maxY;
        p_max[i+2*nL][0] = group[i].width*2;

        dx[i][0] = -dt/1000;
        dx[i+nL][0] = -1e-3;
        dx[i+2*nL][0] = -dt/1000;
    }
    //console.log(t);
    var p_fit = LM.optimize(sumOfLorentzians,p_init,t,y_data,weight,dx,p_min,p_max,consts,opts);
    p_fit = p_fit.p;
    //Put back the result in the correct format
    var result = new Array(nL);
    for( i=0;i<nL;i++){
        result[i]=[p_fit[i],[p_fit[i+nL][0]*maxY],p_fit[i+2*nL]];
    }

    return result;

}
/**
 *
 * Converts the given input to the required x, y column matrices. y data is normalized to max(y)=1
 * @param xy
 * @returns {*[]}
 */
function parseData(xy){
    var nbSeries = xy.length;
    var t = null;
    var y_data = null, x,y;
    var maxY = 0, i,j;

    if(nbSeries==2){
        //Looks like row wise matrix [x,y]
        var nbPoints = xy[0].length;
        if(nbPoints<3)
            throw new SizeException(nbPoints);
        else{
            t = new Matrix(nbPoints,1);
            y_data = new Matrix(nbPoints,1);
            x = xy[0];
            y = xy[1];
            if(typeof x[0] === "number"){
                for(i=0;i<nbPoints;i++){
                    t[i][0]=x[i];
                    y_data[i][0]=y[i];
                    if(y[i]>maxY)
                        maxY = y[i];
                }
            }
            else{
                //It is a colum matrix
                if(typeof x[0] === "object"){
                    for(i=0;i<nbPoints;i++){
                        t[i][0]=x[i][0];
                        y_data[i][0]=y[i][0];
                        if(y[i][0]>maxY)
                            maxY = y[i][0];
                    }
                }

            }

        }
    }
    else{
        //Looks like a column wise matrix [[x],[y]]
        var nbPoints = nbSeries;
        if(nbPoints<3)
            throw new SizeException(nbPoints);
        else {
            t = new Matrix(nbPoints, 1);
            y_data = new Matrix(nbPoints, 1);
            for (i = 0; i < nbPoints; i++) {
                t[i][0] = xy[i][0];
                y_data[i][0] = xy[i][1];
                if(y_data[i][0]>maxY)
                    maxY = y_data[i][0];
            }
        }
    }
    for (i = 0; i < nbPoints; i++) {
        y_data[i][0]/=maxY;
    }
    return [t,y_data,maxY];
}

function sizeException(nbPoints) {
    return new RangeError("Not enough points to perform the optimization: "+nbPoints +"< 3");
}

module.exports.optimizeSingleLorentzian = optimizeSingleLorentzian;
module.exports.optimizeLorentzianSum = optimizeLorentzianSum;
module.exports.optimizeSingleGaussian = optimizeSingleGaussian;
module.exports.optimizeGaussianSum = optimizeGaussianSum;
module.exports.singleGaussian = singleGaussian;
module.exports.singleLorentzian = singleLorentzian;
},{"ml-curve-fitting":4,"ml-matrix":12}],15:[function(require,module,exports){

var optimizePeaks = require("../src/optimize");

function gsd(x, y, options){
    var options=Object.create(options || {});
    if (options.minMaxRatio===undefined) options.minMaxRatio=0.00025;
    if (options.broadRatio===undefined) options.broadRatio=0.00;
    if (options.noiseLevel===undefined) options.noiseLevel=0;
    if (options.maxCriteria===undefined) options.maxCriteria=true;
    if (options.smoothY===undefined) options.smoothY=true;


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
    realTopDetection(minddY,X,Y);
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
    if(options.broadRatio>0){
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
                    var fitted =  optimizePeaks.optimizeSingleLorentzian(candidates);
                    //console.log(fitted);
                    signals.push(fitted);
                }
                candidates = [];
                max = 0;
                maxI = 0;
                count = 0;
            }
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

},{"../src/optimize":16}],16:[function(require,module,exports){
/**
 * Created by acastillo on 9/6/15.
 */
var Opt = require("ml-optimize-lorentzian");

function sampleFunction(from, to, x, y, lastIndex){
    //console.log(from+" "+to);
    //console.log(lastIndex+" "+x[lastIndex[0]]);
    var nbPoints = x.length;
    var sampleX = [];
    var sampleY = [];
    var direction = Math.sign(x[1]-x[0]);//Direction of the derivative
    var delta = (to-from)/2;
    var mid = (from+to)/2;
    var stop = false;
    var index = lastIndex[0];
    while(!stop&&index<nbPoints){
        if(Math.abs(x[index]-mid)<=delta){
            sampleX.push(x[index]);
            sampleY.push(y[index]);
            index++;

        }
        //It is outside the range.
        else{

            if(Math.sign(mid-x[index])==direction){
                //We'll reach the mid going in the current direction
                index++;
            }
            else{
                //There is not more peaks in the current range
                stop=true;
            }
        }
        //console.log(sampleX);
    }
    lastIndex[0]=index;
    return [sampleX, sampleY];
}

function optimizePeaks(peakList,x,y,n, fnType){
    var i, j, lastIndex=[0];
    var groups = groupPeaks(peakList,n);
    var result = [];
    //console.log(x[0]+" "+x[1]);
    for(i=0;i<groups.length;i++){
        //console.log(peakList[i]);
        var peaks = groups[i].group;
        if(peaks.length>1){
            //Multiple peaks
            //console.log("Pending group of overlaped peaks "+peaks.length);
            //console.log(groups[i].limits);
            var sampling = sampleFunction(groups[i].limits[0]-groups[i].limits[1],groups[i].limits[0]+groups[i].limits[1],x,y,lastIndex);
            //console.log(sampling);
            if(sampling[0].length>5){
                var error = peaks[0].width/1000;
                var opts = [  3,    100, error, error, error, error*10, error*10,    11,    9,        1 ];
                //var gauss = Opt.optimizeSingleGaussian(sampling[0], sampling[1], opts, peaks);
                var optPeaks = [];
                if(fnType=="gaussian")
                    optPeaks = Opt.optimizeGaussianSum(sampling, peaks, opts);
                else{
                    if(fnType=="lorentzian"){
                        optPeaks = Opt.optimizeLorentzianSum(sampling, peaks, opts);
                    }
                }
                for(j=0;j<optPeaks.length;j++){
                    result.push({x:optPeaks[j][0],y:optPeaks[j][1],width:optPeaks[j][2]});
                }
            }
        }
        else{
            //Single peak
            peaks = peaks[0];
            var sampling = sampleFunction(peaks.x-n*peaks.width,
                peaks.x+n*peaks.width,x,y,lastIndex);
            //console.log(sampling);
            if(sampling[0].length>5){
                var error = peaks.width/1000;
                var opts = [  3,    100, error, error, error, error*10, error*10,    11,    9,        1 ];
                //var gauss = Opt.optimizeSingleGaussian(sampling[0], sampling[1], opts, peaks);
                //var gauss = Opt.optimizeSingleGaussian([sampling[0],sampling[1]], peaks, opts);
                var optPeak = [];
                if(fnType=="gaussian")
                    var optPeak = Opt.optimizeSingleGaussian([sampling[0],sampling[1]], peaks,  opts);
                else{
                    if(fnType=="lorentzian"){
                        var optPeak = Opt.optimizeSingleLorentzian([sampling[0],sampling[1]], peaks,  opts);
                    }
                }
                result.push({x:optPeak[0],y:optPeak[1],width:optPeak[2]}); // From https://en.wikipedia.org/wiki/Gaussian_function#Properties}
            }
        }

    }
    return result;
}

function groupPeaks(peakList,nL){
    var group = [];
    var groups = [];
    var i, j;
    var limits = [peakList[0].x,nL*peakList[0].width];
    var upperLimit, lowerLimit;
    //Merge forward
    for(i=0;i<peakList.length;i++){
        //If the 2 things overlaps
        if(Math.abs(peakList[i].x-limits[0])<(nL*peakList[i].width+limits[1])){
            //Add the peak to the group
            group.push(peakList[i]);
            //Update the group limits
            upperLimit = limits[0]+limits[1];
            if(peakList[i].x+nL*peakList[i].width>upperLimit){
                upperLimit = peakList[i].x+nL*peakList[i].width;
            }
            lowerLimit = limits[0]-limits[1];
            if(peakList[i].x-nL*peakList[i].width<lowerLimit){
                lowerLimit = peakList[i].x-nL*peakList[i].width;
            }
            limits = [(upperLimit+lowerLimit)/2,Math.abs(upperLimit-lowerLimit)/2];

        }
        else{
            groups.push({limits:limits,group:group});
            //var optmimalPeak = fitSpectrum(group,limits,spectrum);
            group=[peakList[i]];
            limits = [peakList[i].x,nL*peakList[i].width];
        }
    }
    groups.push({limits:limits,group:group});
    //Merge backward
    for(i =groups.length-2;i>=0;i--){
        //The groups overlaps
        if(Math.abs(groups[i].limits[0]-groups[i+1].limits[0])<
            (groups[i].limits[1]+groups[i+1].limits[1])/2){
            for(j=0;j<groups[i+1].group.length;j++){
                groups[i].group.push(groups[i+1].group[j]);
            }
            upperLimit = groups[i].limits[0]+groups[i].limits[1];
            if(groups[i+1].limits[0]+groups[i+1].limits[1]>upperLimit){
                upperLimit = groups[i+1].limits[0]+groups[i+1].limits[1];
            }
            lowerLimit = groups[i].limits[0]-groups[i].limits[1];
            if(groups[i+1].limits[0]-groups[i+1].limits[1]<lowerLimit){
                lowerLimit = groups[i+1].limits[0]-groups[i+1].limits[1];
            }
            //console.log(limits);
            groups[i].limits = [(upperLimit+lowerLimit)/2,Math.abs(upperLimit-lowerLimit)/2];

            groups.splice(i+1,1);
        }
    }
    return groups;
}

module.exports=optimizePeaks;


},{"ml-optimize-lorentzian":14}]},{},[1])(1)
});
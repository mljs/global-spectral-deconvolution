/**
 * ml-gsd - Global Spectra Deconvolution
 * @version v2.0.7
 * @link https://github.com/mljs/global-spectral-deconvolution
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["GSD"] = factory();
	else
		root["GSD"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(20);

var abstractMatrix = __webpack_require__(8);

var util = __webpack_require__(3);

class Matrix extends abstractMatrix(Array) {
  constructor(nRows, nColumns) {
    var i;

    if (arguments.length === 1 && typeof nRows === 'number') {
      return new Array(nRows);
    }

    if (Matrix.isMatrix(nRows)) {
      return nRows.clone();
    } else if (Number.isInteger(nRows) && nRows > 0) {
      // Create an empty matrix
      super(nRows);

      if (Number.isInteger(nColumns) && nColumns > 0) {
        for (i = 0; i < nRows; i++) {
          this[i] = new Array(nColumns);
        }
      } else {
        throw new TypeError('nColumns must be a positive integer');
      }
    } else if (Array.isArray(nRows)) {
      // Copy the values from the 2D array
      const matrix = nRows;
      nRows = matrix.length;
      nColumns = matrix[0].length;

      if (typeof nColumns !== 'number' || nColumns === 0) {
        throw new TypeError('Data must be a 2D array with at least one element');
      }

      super(nRows);

      for (i = 0; i < nRows; i++) {
        if (matrix[i].length !== nColumns) {
          throw new RangeError('Inconsistent array dimensions');
        }

        this[i] = [].concat(matrix[i]);
      }
    } else {
      throw new TypeError('First argument must be a positive number or an array');
    }

    this.rows = nRows;
    this.columns = nColumns;
    return this;
  }

  set(rowIndex, columnIndex, value) {
    this[rowIndex][columnIndex] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    return this[rowIndex][columnIndex];
  }
  /**
   * Creates an exact and independent copy of the matrix
   * @return {Matrix}
   */


  clone() {
    var newMatrix = new this.constructor[Symbol.species](this.rows, this.columns);

    for (var row = 0; row < this.rows; row++) {
      for (var column = 0; column < this.columns; column++) {
        newMatrix.set(row, column, this.get(row, column));
      }
    }

    return newMatrix;
  }
  /**
   * Removes a row from the given index
   * @param {number} index - Row index
   * @return {Matrix} this
   */


  removeRow(index) {
    util.checkRowIndex(this, index);

    if (this.rows === 1) {
      throw new RangeError('A matrix cannot have less than one row');
    }

    this.splice(index, 1);
    this.rows -= 1;
    return this;
  }
  /**
   * Adds a row at the given index
   * @param {number} [index = this.rows] - Row index
   * @param {Array|Matrix} array - Array or vector
   * @return {Matrix} this
   */


  addRow(index, array) {
    if (array === undefined) {
      array = index;
      index = this.rows;
    }

    util.checkRowIndex(this, index, true);
    array = util.checkRowVector(this, array, true);
    this.splice(index, 0, array);
    this.rows += 1;
    return this;
  }
  /**
   * Removes a column from the given index
   * @param {number} index - Column index
   * @return {Matrix} this
   */


  removeColumn(index) {
    util.checkColumnIndex(this, index);

    if (this.columns === 1) {
      throw new RangeError('A matrix cannot have less than one column');
    }

    for (var i = 0; i < this.rows; i++) {
      this[i].splice(index, 1);
    }

    this.columns -= 1;
    return this;
  }
  /**
   * Adds a column at the given index
   * @param {number} [index = this.columns] - Column index
   * @param {Array|Matrix} array - Array or vector
   * @return {Matrix} this
   */


  addColumn(index, array) {
    if (typeof array === 'undefined') {
      array = index;
      index = this.columns;
    }

    util.checkColumnIndex(this, index, true);
    array = util.checkColumnVector(this, array);

    for (var i = 0; i < this.rows; i++) {
      this[i].splice(index, 0, array[i]);
    }

    this.columns += 1;
    return this;
  }

}

exports.Matrix = Matrix;
Matrix.abstractMatrix = abstractMatrix;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var abstractMatrix = __webpack_require__(8);

var Matrix = __webpack_require__(0);

class BaseView extends abstractMatrix() {
  constructor(matrix, rows, columns) {
    super();
    this.matrix = matrix;
    this.rows = rows;
    this.columns = columns;
  }

  static get [Symbol.species]() {
    return Matrix.Matrix;
  }

}

module.exports = BaseView;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(0).Matrix;
module.exports.Decompositions = module.exports.DC = __webpack_require__(32);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matrix = __webpack_require__(0);
/**
 * @private
 * Check that a row index is not out of bounds
 * @param {Matrix} matrix
 * @param {number} index
 * @param {boolean} [outer]
 */


exports.checkRowIndex = function checkRowIndex(matrix, index, outer) {
  var max = outer ? matrix.rows : matrix.rows - 1;

  if (index < 0 || index > max) {
    throw new RangeError('Row index out of range');
  }
};
/**
 * @private
 * Check that a column index is not out of bounds
 * @param {Matrix} matrix
 * @param {number} index
 * @param {boolean} [outer]
 */


exports.checkColumnIndex = function checkColumnIndex(matrix, index, outer) {
  var max = outer ? matrix.columns : matrix.columns - 1;

  if (index < 0 || index > max) {
    throw new RangeError('Column index out of range');
  }
};
/**
 * @private
 * Check that the provided vector is an array with the right length
 * @param {Matrix} matrix
 * @param {Array|Matrix} vector
 * @return {Array}
 * @throws {RangeError}
 */


exports.checkRowVector = function checkRowVector(matrix, vector) {
  if (vector.to1DArray) {
    vector = vector.to1DArray();
  }

  if (vector.length !== matrix.columns) {
    throw new RangeError('vector size must be the same as the number of columns');
  }

  return vector;
};
/**
 * @private
 * Check that the provided vector is an array with the right length
 * @param {Matrix} matrix
 * @param {Array|Matrix} vector
 * @return {Array}
 * @throws {RangeError}
 */


exports.checkColumnVector = function checkColumnVector(matrix, vector) {
  if (vector.to1DArray) {
    vector = vector.to1DArray();
  }

  if (vector.length !== matrix.rows) {
    throw new RangeError('vector size must be the same as the number of rows');
  }

  return vector;
};

exports.checkIndices = function checkIndices(matrix, rowIndices, columnIndices) {
  var rowOut = rowIndices.some(r => {
    return r < 0 || r >= matrix.rows;
  });
  var columnOut = columnIndices.some(c => {
    return c < 0 || c >= matrix.columns;
  });

  if (rowOut || columnOut) {
    throw new RangeError('Indices are out of range');
  }

  if (typeof rowIndices !== 'object' || typeof columnIndices !== 'object') {
    throw new TypeError('Unexpected type for row/column indices');
  }

  if (!Array.isArray(rowIndices)) rowIndices = Array.from(rowIndices);
  if (!Array.isArray(columnIndices)) rowIndices = Array.from(columnIndices);
  return {
    row: rowIndices,
    column: columnIndices
  };
};

exports.checkRange = function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
  if (arguments.length !== 5) throw new TypeError('Invalid argument type');
  var notAllNumbers = Array.from(arguments).slice(1).some(function (arg) {
    return typeof arg !== 'number';
  });
  if (notAllNumbers) throw new TypeError('Invalid argument type');

  if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix.rows || endRow < 0 || endRow >= matrix.rows || startColumn < 0 || startColumn >= matrix.columns || endColumn < 0 || endColumn >= matrix.columns) {
    throw new RangeError('Submatrix indices are out of range');
  }
};

exports.getRange = function getRange(from, to) {
  var arr = new Array(to - from + 1);

  for (var i = 0; i < arr.length; i++) {
    arr[i] = from + i;
  }

  return arr;
};

exports.sumByRow = function sumByRow(matrix) {
  var sum = Matrix.Matrix.zeros(matrix.rows, 1);

  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum.set(i, 0, sum.get(i, 0) + matrix.get(i, j));
    }
  }

  return sum;
};

exports.sumByColumn = function sumByColumn(matrix) {
  var sum = Matrix.Matrix.zeros(1, matrix.columns);

  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum.set(0, j, sum.get(0, j) + matrix.get(i, j));
    }
  }

  return sum;
};

exports.sumAll = function sumAll(matrix) {
  var v = 0;

  for (var i = 0; i < matrix.rows; i++) {
    for (var j = 0; j < matrix.columns; j++) {
      v += matrix.get(i, j);
    }
  }

  return v;
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.array = __webpack_require__(6);
exports.matrix = __webpack_require__(16);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
}; // For use in the decomposition algorithms. With big matrices, access time is
// too long on elements from array subclass
// todo check when it is fixed in v8
// http://jsperf.com/access-and-write-array-subclass


exports.getEmpty2DArray = function (rows, columns) {
  var array = new Array(rows);

  for (var i = 0; i < rows; i++) {
    array[i] = new Array(columns);
  }

  return array;
};

exports.getFilled2DArray = function (rows, columns, value) {
  var array = new Array(rows);

  for (var i = 0; i < rows; i++) {
    array[i] = new Array(columns);

    for (var j = 0; j < columns; j++) {
      array[i][j] = value;
    }
  }

  return array;
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function compareNumbers(a, b) {
  return a - b;
}
/**
 * Computes the sum of the given values
 * @param {Array} values
 * @returns {number}
 */


exports.sum = function sum(values) {
  var sum = 0;

  for (var i = 0; i < values.length; i++) {
    sum += values[i];
  }

  return sum;
};
/**
 * Computes the maximum of the given values
 * @param {Array} values
 * @returns {number}
 */


exports.max = function max(values) {
  var max = values[0];
  var l = values.length;

  for (var i = 1; i < l; i++) {
    if (values[i] > max) max = values[i];
  }

  return max;
};
/**
 * Computes the minimum of the given values
 * @param {Array} values
 * @returns {number}
 */


exports.min = function min(values) {
  var min = values[0];
  var l = values.length;

  for (var i = 1; i < l; i++) {
    if (values[i] < min) min = values[i];
  }

  return min;
};
/**
 * Computes the min and max of the given values
 * @param {Array} values
 * @returns {{min: number, max: number}}
 */


exports.minMax = function minMax(values) {
  var min = values[0];
  var max = values[0];
  var l = values.length;

  for (var i = 1; i < l; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }

  return {
    min: min,
    max: max
  };
};
/**
 * Computes the arithmetic mean of the given values
 * @param {Array} values
 * @returns {number}
 */


exports.arithmeticMean = function arithmeticMean(values) {
  var sum = 0;
  var l = values.length;

  for (var i = 0; i < l; i++) {
    sum += values[i];
  }

  return sum / l;
};
/**
 * {@link arithmeticMean}
 */


exports.mean = exports.arithmeticMean;
/**
 * Computes the geometric mean of the given values
 * @param {Array} values
 * @returns {number}
 */

exports.geometricMean = function geometricMean(values) {
  var mul = 1;
  var l = values.length;

  for (var i = 0; i < l; i++) {
    mul *= values[i];
  }

  return Math.pow(mul, 1 / l);
};
/**
 * Computes the mean of the log of the given values
 * If the return value is exponentiated, it gives the same result as the
 * geometric mean.
 * @param {Array} values
 * @returns {number}
 */


exports.logMean = function logMean(values) {
  var lnsum = 0;
  var l = values.length;

  for (var i = 0; i < l; i++) {
    lnsum += Math.log(values[i]);
  }

  return lnsum / l;
};
/**
 * Computes the weighted grand mean for a list of means and sample sizes
 * @param {Array} means - Mean values for each set of samples
 * @param {Array} samples - Number of original values for each set of samples
 * @returns {number}
 */


exports.grandMean = function grandMean(means, samples) {
  var sum = 0;
  var n = 0;
  var l = means.length;

  for (var i = 0; i < l; i++) {
    sum += samples[i] * means[i];
    n += samples[i];
  }

  return sum / n;
};
/**
 * Computes the truncated mean of the given values using a given percentage
 * @param {Array} values
 * @param {number} percent - The percentage of values to keep (range: [0,1])
 * @param {boolean} [alreadySorted=false]
 * @returns {number}
 */


exports.truncatedMean = function truncatedMean(values, percent, alreadySorted) {
  if (alreadySorted === undefined) alreadySorted = false;

  if (!alreadySorted) {
    values = [].concat(values).sort(compareNumbers);
  }

  var l = values.length;
  var k = Math.floor(l * percent);
  var sum = 0;

  for (var i = k; i < l - k; i++) {
    sum += values[i];
  }

  return sum / (l - 2 * k);
};
/**
 * Computes the harmonic mean of the given values
 * @param {Array} values
 * @returns {number}
 */


exports.harmonicMean = function harmonicMean(values) {
  var sum = 0;
  var l = values.length;

  for (var i = 0; i < l; i++) {
    if (values[i] === 0) {
      throw new RangeError('value at index ' + i + 'is zero');
    }

    sum += 1 / values[i];
  }

  return l / sum;
};
/**
 * Computes the contraharmonic mean of the given values
 * @param {Array} values
 * @returns {number}
 */


exports.contraHarmonicMean = function contraHarmonicMean(values) {
  var r1 = 0;
  var r2 = 0;
  var l = values.length;

  for (var i = 0; i < l; i++) {
    r1 += values[i] * values[i];
    r2 += values[i];
  }

  if (r2 < 0) {
    throw new RangeError('sum of values is negative');
  }

  return r1 / r2;
};
/**
 * Computes the median of the given values
 * @param {Array} values
 * @param {boolean} [alreadySorted=false]
 * @returns {number}
 */


exports.median = function median(values, alreadySorted) {
  if (alreadySorted === undefined) alreadySorted = false;

  if (!alreadySorted) {
    values = [].concat(values).sort(compareNumbers);
  }

  var l = values.length;
  var half = Math.floor(l / 2);

  if (l % 2 === 0) {
    return (values[half - 1] + values[half]) * 0.5;
  } else {
    return values[half];
  }
};
/**
 * Computes the variance of the given values
 * @param {Array} values
 * @param {boolean} [unbiased=true] - if true, divide by (n-1); if false, divide by n.
 * @returns {number}
 */


exports.variance = function variance(values, unbiased) {
  if (unbiased === undefined) unbiased = true;
  var theMean = exports.mean(values);
  var theVariance = 0;
  var l = values.length;

  for (var i = 0; i < l; i++) {
    var x = values[i] - theMean;
    theVariance += x * x;
  }

  if (unbiased) {
    return theVariance / (l - 1);
  } else {
    return theVariance / l;
  }
};
/**
 * Computes the standard deviation of the given values
 * @param {Array} values
 * @param {boolean} [unbiased=true] - if true, divide by (n-1); if false, divide by n.
 * @returns {number}
 */


exports.standardDeviation = function standardDeviation(values, unbiased) {
  return Math.sqrt(exports.variance(values, unbiased));
};

exports.standardError = function standardError(values) {
  return exports.standardDeviation(values) / Math.sqrt(values.length);
};
/**
 * IEEE Transactions on biomedical engineering, vol. 52, no. 1, january 2005, p. 76-
 * Calculate the standard deviation via the Median of the absolute deviation
 *  The formula for the standard deviation only holds for Gaussian random variables.
 * @returns {{mean: number, stdev: number}}
 */


exports.robustMeanAndStdev = function robustMeanAndStdev(y) {
  var mean = 0,
      stdev = 0;
  var length = y.length,
      i = 0;

  for (i = 0; i < length; i++) {
    mean += y[i];
  }

  mean /= length;
  var averageDeviations = new Array(length);

  for (i = 0; i < length; i++) averageDeviations[i] = Math.abs(y[i] - mean);

  averageDeviations.sort(compareNumbers);

  if (length % 2 === 1) {
    stdev = averageDeviations[(length - 1) / 2] / 0.6745;
  } else {
    stdev = 0.5 * (averageDeviations[length / 2] + averageDeviations[length / 2 - 1]) / 0.6745;
  }

  return {
    mean: mean,
    stdev: stdev
  };
};

exports.quartiles = function quartiles(values, alreadySorted) {
  if (typeof alreadySorted === 'undefined') alreadySorted = false;

  if (!alreadySorted) {
    values = [].concat(values).sort(compareNumbers);
  }

  var quart = values.length / 4;
  var q1 = values[Math.ceil(quart) - 1];
  var q2 = exports.median(values, true);
  var q3 = values[Math.ceil(quart * 3) - 1];
  return {
    q1: q1,
    q2: q2,
    q3: q3
  };
};

exports.pooledStandardDeviation = function pooledStandardDeviation(samples, unbiased) {
  return Math.sqrt(exports.pooledVariance(samples, unbiased));
};

exports.pooledVariance = function pooledVariance(samples, unbiased) {
  if (typeof unbiased === 'undefined') unbiased = true;
  var sum = 0;
  var length = 0,
      l = samples.length;

  for (var i = 0; i < l; i++) {
    var values = samples[i];
    var vari = exports.variance(values);
    sum += (values.length - 1) * vari;
    if (unbiased) length += values.length - 1;else length += values.length;
  }

  return sum / length;
};

exports.mode = function mode(values) {
  var l = values.length,
      itemCount = new Array(l),
      i;

  for (i = 0; i < l; i++) {
    itemCount[i] = 0;
  }

  var itemArray = new Array(l);
  var count = 0;

  for (i = 0; i < l; i++) {
    var index = itemArray.indexOf(values[i]);
    if (index >= 0) itemCount[index]++;else {
      itemArray[count] = values[i];
      itemCount[count] = 1;
      count++;
    }
  }

  var maxValue = 0,
      maxIndex = 0;

  for (i = 0; i < count; i++) {
    if (itemCount[i] > maxValue) {
      maxValue = itemCount[i];
      maxIndex = i;
    }
  }

  return itemArray[maxIndex];
};

exports.covariance = function covariance(vector1, vector2, unbiased) {
  if (typeof unbiased === 'undefined') unbiased = true;
  var mean1 = exports.mean(vector1);
  var mean2 = exports.mean(vector2);
  if (vector1.length !== vector2.length) throw 'Vectors do not have the same dimensions';
  var cov = 0,
      l = vector1.length;

  for (var i = 0; i < l; i++) {
    var x = vector1[i] - mean1;
    var y = vector2[i] - mean2;
    cov += x * y;
  }

  if (unbiased) return cov / (l - 1);else return cov / l;
};

exports.skewness = function skewness(values, unbiased) {
  if (typeof unbiased === 'undefined') unbiased = true;
  var theMean = exports.mean(values);
  var s2 = 0,
      s3 = 0,
      l = values.length;

  for (var i = 0; i < l; i++) {
    var dev = values[i] - theMean;
    s2 += dev * dev;
    s3 += dev * dev * dev;
  }

  var m2 = s2 / l;
  var m3 = s3 / l;
  var g = m3 / Math.pow(m2, 3 / 2.0);

  if (unbiased) {
    var a = Math.sqrt(l * (l - 1));
    var b = l - 2;
    return a / b * g;
  } else {
    return g;
  }
};

exports.kurtosis = function kurtosis(values, unbiased) {
  if (typeof unbiased === 'undefined') unbiased = true;
  var theMean = exports.mean(values);
  var n = values.length,
      s2 = 0,
      s4 = 0;

  for (var i = 0; i < n; i++) {
    var dev = values[i] - theMean;
    s2 += dev * dev;
    s4 += dev * dev * dev * dev;
  }

  var m2 = s2 / n;
  var m4 = s4 / n;

  if (unbiased) {
    var v = s2 / (n - 1);
    var a = n * (n + 1) / ((n - 1) * (n - 2) * (n - 3));
    var b = s4 / (v * v);
    var c = (n - 1) * (n - 1) / ((n - 2) * (n - 3));
    return a * b - 3 * c;
  } else {
    return m4 / (m2 * m2) - 3;
  }
};

exports.entropy = function entropy(values, eps) {
  if (typeof eps === 'undefined') eps = 0;
  var sum = 0,
      l = values.length;

  for (var i = 0; i < l; i++) sum += values[i] * Math.log(values[i] + eps);

  return -sum;
};

exports.weightedMean = function weightedMean(values, weights) {
  var sum = 0,
      l = values.length;

  for (var i = 0; i < l; i++) sum += values[i] * weights[i];

  return sum;
};

exports.weightedStandardDeviation = function weightedStandardDeviation(values, weights) {
  return Math.sqrt(exports.weightedVariance(values, weights));
};

exports.weightedVariance = function weightedVariance(values, weights) {
  var theMean = exports.weightedMean(values, weights);
  var vari = 0,
      l = values.length;
  var a = 0,
      b = 0;

  for (var i = 0; i < l; i++) {
    var z = values[i] - theMean;
    var w = weights[i];
    vari += w * (z * z);
    b += w;
    a += w * w;
  }

  return vari * (b / (b * b - a));
};

exports.center = function center(values, inPlace) {
  if (typeof inPlace === 'undefined') inPlace = false;
  var result = values;
  if (!inPlace) result = [].concat(values);
  var theMean = exports.mean(result),
      l = result.length;

  for (var i = 0; i < l; i++) result[i] -= theMean;
};

exports.standardize = function standardize(values, standardDev, inPlace) {
  if (typeof standardDev === 'undefined') standardDev = exports.standardDeviation(values);
  if (typeof inPlace === 'undefined') inPlace = false;
  var l = values.length;
  var result = inPlace ? values : new Array(l);

  for (var i = 0; i < l; i++) result[i] = values[i] / standardDev;

  return result;
};

exports.cumulativeSum = function cumulativeSum(array) {
  var l = array.length;
  var result = new Array(l);
  result[0] = array[0];

  for (var i = 1; i < l; i++) result[i] = result[i - 1] + array[i];

  return result;
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LM = __webpack_require__(18);

var math = LM.Matrix.algebra;

var Matrix = __webpack_require__(2);
/**
 * This function calculates the spectrum as a sum of lorentzian functions. The Lorentzian
 * parameters are divided in 3 batches. 1st: centers; 2nd: heights; 3th: widths;
 * @param t Ordinate values
 * @param p Lorentzian parameters
 * @param c Constant parameters(Not used)
 * @returns {*}
 */


function sumOfLorentzians(t, p, c) {
  var nL = p.length / 3,
      factor,
      i,
      j,
      p2,
      cols = t.rows;
  var result = Matrix.zeros(t.length, 1);

  for (i = 0; i < nL; i++) {
    p2 = Math.pow(p[i + nL * 2][0] / 2, 2);
    factor = p[i + nL][0] * p2;

    for (j = 0; j < cols; j++) {
      result[j][0] += factor / (Math.pow(t[j][0] - p[i][0], 2) + p2);
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


function sumOfGaussians(t, p, c) {
  var nL = p.length / 3,
      factor,
      i,
      j,
      cols = t.rows;
  var result = Matrix.zeros(t.length, 1);

  for (i = 0; i < nL; i++) {
    factor = p[i + nL * 2][0] * p[i + nL * 2][0] / 2;

    for (j = 0; j < cols; j++) {
      result[j][0] += p[i + nL][0] * Math.exp(-(t[i][0] - p[i][0]) * (t[i][0] - p[i][0]) / factor);
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


function singleLorentzian(t, p, c) {
  var factor = p[1][0] * Math.pow(p[2][0] / 2, 2);
  var rows = t.rows;
  var result = new Matrix(t.rows, t.columns);

  for (var i = 0; i < rows; i++) {
    result[i][0] = factor / (Math.pow(t[i][0] - p[0][0], 2) + Math.pow(p[2][0] / 2, 2));
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


function singleGaussian(t, p, c) {
  var factor2 = p[2][0] * p[2][0] / 2;
  var rows = t.rows;
  var result = new Matrix(t.rows, t.columns);

  for (var i = 0; i < rows; i++) {
    result[i][0] = p[1][0] * Math.exp(-(t[i][0] - p[0][0]) * (t[i][0] - p[0][0]) / factor2);
  }

  return result;
}
/**
 * * Fits a set of points to a Lorentzian function. Returns the center of the peak, the width at half height, and the height of the signal.
 * @param data,[y]
 * @returns {*[]}
 */


function optimizeSingleLorentzian(xy, peak, opts) {
  opts = opts || {};
  var xy2 = parseData(xy, opts.percentage || 0);

  if (xy2 === null || xy2[0].rows < 3) {
    return null; //Cannot run an optimization with less than 3 points
  }

  var t = xy2[0];
  var y_data = xy2[1];
  var maxY = xy2[2];
  var nbPoints = t.rows,
      i;
  var weight = [nbPoints / Math.sqrt(y_data.dot(y_data))];
  var opts = Object.create(opts.LMOptions || [3, 100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 1]); //var opts = [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ];

  var consts = [];
  var dt = Math.abs(t[0][0] - t[1][0]); // optional vector of constants

  var dx = new Matrix([[-dt / 10000], [-1e-3], [-dt / 10000]]); //-Math.abs(t[0][0]-t[1][0])/100;

  var p_init = new Matrix([[peak.x], [1], [peak.width]]);
  var p_min = new Matrix([[peak.x - dt], [0.75], [peak.width / 4]]);
  var p_max = new Matrix([[peak.x + dt], [1.25], [peak.width * 4]]);
  var p_fit = LM.optimize(singleLorentzian, p_init, t, y_data, weight, dx, p_min, p_max, consts, opts);
  p_fit = p_fit.p;
  return [p_fit[0], [p_fit[1][0] * maxY], p_fit[2]];
}
/**
 * Fits a set of points to a gaussian bell. Returns the mean of the peak, the std and the height of the signal.
 * @param data,[y]
 * @returns {*[]}
 */


function optimizeSingleGaussian(xy, peak, opts) {
  opts = opts || {};
  var xy2 = parseData(xy, opts.percentage || 0);

  if (xy2 === null || xy2[0].rows < 3) {
    return null; //Cannot run an optimization with less than 3 points
  }

  var t = xy2[0];
  var y_data = xy2[1];
  var maxY = xy2[2];
  var nbPoints = t.rows,
      i;
  var weight = [nbPoints / Math.sqrt(y_data.dot(y_data))];
  var opts = Object.create(opts.LMOptions || [3, 100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 1]); //var opts = [  3,    100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2,    11,    9,        1 ];

  var consts = []; // optional vector of constants

  var dt = Math.abs(t[0][0] - t[1][0]);
  var dx = new Matrix([[-dt / 10000], [-1e-3], [-dt / 10000]]); //-Math.abs(t[0][0]-t[1][0])/100;

  var dx = new Matrix([[-Math.abs(t[0][0] - t[1][0]) / 1000], [-1e-3], [-peak.width / 1000]]);
  var p_init = new Matrix([[peak.x], [1], [peak.width]]);
  var p_min = new Matrix([[peak.x - dt], [0.75], [peak.width / 4]]);
  var p_max = new Matrix([[peak.x + dt], [1.25], [peak.width * 4]]); //var p_min = new Matrix([[peak.x-peak.width/4],[0.75],[peak.width/3]]);
  //var p_max = new Matrix([[peak.x+peak.width/4],[1.25],[peak.width*3]]);

  var p_fit = LM.optimize(singleGaussian, p_init, t, y_data, weight, dx, p_min, p_max, consts, opts);
  p_fit = p_fit.p;
  return [p_fit[0], [p_fit[1][0] * maxY], p_fit[2]];
}
/*
 peaks on group should sorted
 */


function optimizeLorentzianTrain(xy, group, opts) {
  var xy2 = parseData(xy); //console.log(xy2[0].rows);

  if (xy2 === null || xy2[0].rows < 3) {
    return null; //Cannot run an optimization with less than 3 points
  }

  var t = xy2[0];
  var y_data = xy2[1];
  var maxY = xy2[2];
  var currentIndex = 0;
  var nbPoints = t.length;
  var nextX;
  var tI, yI, maxY;
  var result = [],
      current;

  for (var i = 0; i < group.length; i++) {
    nextX = group[i].x - group[i].width * 1.5; //console.log(group[i]);

    while (t[currentIndex++] < nextX && currentIndex < nbPoints);

    nextX = group[i].x + group[i].width * 1.5;
    tI = [];
    yI = [];

    while (t[currentIndex] <= nextX && currentIndex < nbPoints) {
      tI.push(t[currentIndex][0]);
      yI.push(y_data[currentIndex][0] * maxY);
      currentIndex++;
    }

    current = optimizeSingleLorentzian([tI, yI], group[i], opts);

    if (current) {
      result.push({
        "x": current[0][0],
        "y": current[1][0],
        "width": current[2][0],
        "opt": true
      });
    } else {
      result.push({
        "x": group[i].x,
        "y": group[i].y,
        "width": group[i].width,
        "opt": false
      });
    }
  }

  return result;
}

function optimizeGaussianTrain(xy, group, opts) {
  var xy2 = parseData(xy); //console.log(xy2[0].rows);

  if (xy2 === null || xy2[0].rows < 3) {
    return null; //Cannot run an optimization with less than 3 points
  }

  var t = xy2[0];
  var y_data = xy2[1];
  var maxY = xy2[2];
  var currentIndex = 0;
  var nbPoints = t.length;
  var nextX;
  var tI, yI, maxY;
  var result = [],
      current;

  for (var i = 0; i < group.length; i++) {
    nextX = group[i].x - group[i].width * 1.5; //console.log(group[i]);

    while (t[currentIndex++] < nextX && currentIndex < nbPoints);

    nextX = group[i].x + group[i].width * 1.5;
    tI = [];
    yI = [];

    while (t[currentIndex] <= nextX && currentIndex < nbPoints) {
      tI.push(t[currentIndex][0]);
      yI.push(y_data[currentIndex][0] * maxY);
      currentIndex++;
    }

    current = optimizeSingleGaussian([tI, yI], group[i], opts);

    if (current) {
      result.push({
        "x": current[0][0],
        "y": current[1][0],
        "width": current[2][0],
        "opt": true
      });
    } else {
      result.push({
        "x": group[i].x,
        "y": group[i].y,
        "width": group[i].width,
        "opt": false
      });
    }
  }

  return result;
}
/**
 *
 * @param xy A two column matrix containing the x and y data to be fitted
 * @param group A set of initial lorentzian parameters to be optimized [center, heigth, half_width_at_half_height]
 * @returns {Array} A set of final lorentzian parameters [center, heigth, hwhh*2]
 */


function optimizeLorentzianSum(xy, group, opts) {
  var xy2 = parseData(xy);

  if (xy2 === null || xy2[0].rows < 3) {
    return null; //Cannot run an optimization with less than 3 points
  }

  var t = xy2[0];
  var y_data = xy2[1];
  var maxY = xy2[2];
  var nbPoints = t.rows,
      i;
  var weight = [nbPoints / math.sqrt(y_data.dot(y_data))];
  var opts = Object.create(opts || [3, 100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 1]);
  var consts = []; // optional vector of constants

  var nL = group.length;
  var p_init = new Matrix(nL * 3, 1);
  var p_min = new Matrix(nL * 3, 1);
  var p_max = new Matrix(nL * 3, 1);
  var dx = new Matrix(nL * 3, 1);
  var dt = Math.abs(t[0][0] - t[1][0]);

  for (i = 0; i < nL; i++) {
    p_init[i][0] = group[i].x;
    p_init[i + nL][0] = 1;
    p_init[i + 2 * nL][0] = group[i].width;
    p_min[i][0] = group[i].x - dt; //-group[i].width/4;

    p_min[i + nL][0] = 0;
    p_min[i + 2 * nL][0] = group[i].width / 4;
    p_max[i][0] = group[i].x + dt; //+group[i].width/4;

    p_max[i + nL][0] = 1.5;
    p_max[i + 2 * nL][0] = group[i].width * 4;
    dx[i][0] = -dt / 1000;
    dx[i + nL][0] = -1e-3;
    dx[i + 2 * nL][0] = -dt / 1000;
  }

  var dx = -Math.abs(t[0][0] - t[1][0]) / 10000;
  var p_fit = LM.optimize(sumOfLorentzians, p_init, t, y_data, weight, dx, p_min, p_max, consts, opts);
  p_fit = p_fit.p; //Put back the result in the correct format

  var result = new Array(nL);

  for (i = 0; i < nL; i++) {
    result[i] = [p_fit[i], [p_fit[i + nL][0] * maxY], p_fit[i + 2 * nL]];
  }

  return result;
}
/**
 *
 * @param xy A two column matrix containing the x and y data to be fitted
 * @param group A set of initial lorentzian parameters to be optimized [center, heigth, half_width_at_half_height]
 * @returns {Array} A set of final lorentzian parameters [center, heigth, hwhh*2]
 */


function optimizeGaussianSum(xy, group, opts) {
  var xy2 = parseData(xy);

  if (xy2 === null || xy2[0].rows < 3) {
    return null; //Cannot run an optimization with less than 3 points
  }

  var t = xy2[0];
  var y_data = xy2[1];
  var maxY = xy2[2];
  var nbPoints = t.rows,
      i;
  var weight = new Matrix(nbPoints, 1); //[nbPoints / math.sqrt(y_data.dot(y_data))];

  var k = nbPoints / math.sqrt(y_data.dot(y_data));

  for (i = 0; i < nbPoints; i++) {
    weight[i][0] = k; ///(y_data[i][0]);
    //weight[i][0]=k*(2-y_data[i][0]);
  }

  var opts = Object.create(opts || [3, 100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 2]); //var opts=[  3,    100, 1e-5, 1e-6, 1e-6, 1e-6, 1e-6,    11,    9,        1 ];

  var consts = []; // optional vector of constants

  var nL = group.length;
  var p_init = new Matrix(nL * 3, 1);
  var p_min = new Matrix(nL * 3, 1);
  var p_max = new Matrix(nL * 3, 1);
  var dx = new Matrix(nL * 3, 1);
  var dt = Math.abs(t[0][0] - t[1][0]);

  for (i = 0; i < nL; i++) {
    p_init[i][0] = group[i].x;
    p_init[i + nL][0] = group[i].y / maxY;
    p_init[i + 2 * nL][0] = group[i].width;
    p_min[i][0] = group[i].x - dt;
    p_min[i + nL][0] = group[i].y * 0.8 / maxY;
    p_min[i + 2 * nL][0] = group[i].width / 2;
    p_max[i][0] = group[i].x + dt;
    p_max[i + nL][0] = group[i].y * 1.2 / maxY;
    p_max[i + 2 * nL][0] = group[i].width * 2;
    dx[i][0] = -dt / 1000;
    dx[i + nL][0] = -1e-3;
    dx[i + 2 * nL][0] = -dt / 1000;
  } //console.log(t);


  var p_fit = LM.optimize(sumOfLorentzians, p_init, t, y_data, weight, dx, p_min, p_max, consts, opts);
  p_fit = p_fit.p; //Put back the result in the correct format

  var result = new Array(nL);

  for (i = 0; i < nL; i++) {
    result[i] = [p_fit[i], [p_fit[i + nL][0] * maxY], p_fit[i + 2 * nL]];
  }

  return result;
}
/**
 *
 * Converts the given input to the required x, y column matrices. y data is normalized to max(y)=1
 * @param xy
 * @returns {*[]}
 */


function parseData(xy, threshold) {
  var nbSeries = xy.length;
  var t = null;
  var y_data = null,
      x,
      y;
  var maxY = 0,
      i,
      j;

  if (nbSeries == 2) {
    //Looks like row wise matrix [x,y]
    var nbPoints = xy[0].length; //if(nbPoints<3)
    //    throw new Exception(nbPoints);
    //else{

    t = new Array(nbPoints); //new Matrix(nbPoints,1);

    y_data = new Array(nbPoints); //new Matrix(nbPoints,1);

    x = xy[0];
    y = xy[1];

    if (typeof x[0] === "number") {
      for (i = 0; i < nbPoints; i++) {
        t[i] = x[i];
        y_data[i] = y[i];
        if (y[i] > maxY) maxY = y[i];
      }
    } else {
      //It is a colum matrix
      if (typeof x[0] === "object") {
        for (i = 0; i < nbPoints; i++) {
          t[i] = x[i][0];
          y_data[i] = y[i][0];
          if (y[i][0] > maxY) maxY = y[i][0];
        }
      }
    } //}

  } else {
    //Looks like a column wise matrix [[x],[y]]
    var nbPoints = nbSeries; //if(nbPoints<3)
    //    throw new SizeException(nbPoints);
    //else {

    t = new Array(nbPoints); //new Matrix(nbPoints, 1);

    y_data = new Array(nbPoints); //new Matrix(nbPoints, 1);

    for (i = 0; i < nbPoints; i++) {
      t[i] = xy[i][0];
      y_data[i] = xy[i][1];
      if (y_data[i] > maxY) maxY = y_data[i];
    } //}

  }

  for (i = 0; i < nbPoints; i++) {
    y_data[i] /= maxY;
  }

  if (threshold) {
    for (i = nbPoints - 1; i >= 0; i--) {
      if (y_data[i] < threshold) {
        y_data.splice(i, 1);
        t.splice(i, 1);
      }
    }
  }

  if (t.length > 0) return [new Matrix([t]).transpose(), new Matrix([y_data]).transpose(), maxY];
  return null;
}

function sizeException(nbPoints) {
  return new RangeError("Not enough points to perform the optimization: " + nbPoints + "< 3");
}

module.exports.optimizeSingleLorentzian = optimizeSingleLorentzian;
module.exports.optimizeLorentzianSum = optimizeLorentzianSum;
module.exports.optimizeSingleGaussian = optimizeSingleGaussian;
module.exports.optimizeGaussianSum = optimizeGaussianSum;
module.exports.singleGaussian = singleGaussian;
module.exports.singleLorentzian = singleLorentzian;
module.exports.optimizeGaussianTrain = optimizeGaussianTrain;
module.exports.optimizeLorentzianTrain = optimizeLorentzianTrain;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = abstractMatrix;

var LuDecomposition = __webpack_require__(9);

var SvDecomposition = __webpack_require__(10);

var arrayUtils = __webpack_require__(21);

var util = __webpack_require__(3);

var MatrixTransposeView = __webpack_require__(25);

var MatrixRowView = __webpack_require__(26);

var MatrixSubView = __webpack_require__(27);

var MatrixSelectionView = __webpack_require__(28);

var MatrixColumnView = __webpack_require__(29);

var MatrixFlipRowView = __webpack_require__(30);

var MatrixFlipColumnView = __webpack_require__(31);

function abstractMatrix(superCtor) {
  if (superCtor === undefined) superCtor = Object;
  /**
   * Real matrix
   * @class Matrix
   * @param {number|Array|Matrix} nRows - Number of rows of the new matrix,
   * 2D array containing the data or Matrix instance to clone
   * @param {number} [nColumns] - Number of columns of the new matrix
   */

  class Matrix extends superCtor {
    static get [Symbol.species]() {
      return this;
    }
    /**
     * Constructs a Matrix with the chosen dimensions from a 1D array
     * @param {number} newRows - Number of rows
     * @param {number} newColumns - Number of columns
     * @param {Array} newData - A 1D array containing data for the matrix
     * @return {Matrix} - The new matrix
     */


    static from1DArray(newRows, newColumns, newData) {
      var length = newRows * newColumns;

      if (length !== newData.length) {
        throw new RangeError('Data length does not match given dimensions');
      }

      var newMatrix = new this(newRows, newColumns);

      for (var row = 0; row < newRows; row++) {
        for (var column = 0; column < newColumns; column++) {
          newMatrix.set(row, column, newData[row * newColumns + column]);
        }
      }

      return newMatrix;
    }
    /**
     * Creates a row vector, a matrix with only one row.
     * @param {Array} newData - A 1D array containing data for the vector
     * @return {Matrix} - The new matrix
     */


    static rowVector(newData) {
      var vector = new this(1, newData.length);

      for (var i = 0; i < newData.length; i++) {
        vector.set(0, i, newData[i]);
      }

      return vector;
    }
    /**
     * Creates a column vector, a matrix with only one column.
     * @param {Array} newData - A 1D array containing data for the vector
     * @return {Matrix} - The new matrix
     */


    static columnVector(newData) {
      var vector = new this(newData.length, 1);

      for (var i = 0; i < newData.length; i++) {
        vector.set(i, 0, newData[i]);
      }

      return vector;
    }
    /**
     * Creates an empty matrix with the given dimensions. Values will be undefined. Same as using new Matrix(rows, columns).
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     * @return {Matrix} - The new matrix
     */


    static empty(rows, columns) {
      return new this(rows, columns);
    }
    /**
     * Creates a matrix with the given dimensions. Values will be set to zero.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     * @return {Matrix} - The new matrix
     */


    static zeros(rows, columns) {
      return this.empty(rows, columns).fill(0);
    }
    /**
     * Creates a matrix with the given dimensions. Values will be set to one.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     * @return {Matrix} - The new matrix
     */


    static ones(rows, columns) {
      return this.empty(rows, columns).fill(1);
    }
    /**
     * Creates a matrix with the given dimensions. Values will be randomly set.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     * @param {function} [rng=Math.random] - Random number generator
     * @return {Matrix} The new matrix
     */


    static rand(rows, columns, rng) {
      if (rng === undefined) rng = Math.random;
      var matrix = this.empty(rows, columns);

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          matrix.set(i, j, rng());
        }
      }

      return matrix;
    }
    /**
     * Creates a matrix with the given dimensions. Values will be random integers.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     * @param {number} [maxValue=1000] - Maximum value
     * @param {function} [rng=Math.random] - Random number generator
     * @return {Matrix} The new matrix
     */


    static randInt(rows, columns, maxValue, rng) {
      if (maxValue === undefined) maxValue = 1000;
      if (rng === undefined) rng = Math.random;
      var matrix = this.empty(rows, columns);

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          var value = Math.floor(rng() * maxValue);
          matrix.set(i, j, value);
        }
      }

      return matrix;
    }
    /**
     * Creates an identity matrix with the given dimension. Values of the diagonal will be 1 and others will be 0.
     * @param {number} rows - Number of rows
     * @param {number} [columns=rows] - Number of columns
     * @param {number} [value=1] - Value to fill the diagonal with
     * @return {Matrix} - The new identity matrix
     */


    static eye(rows, columns, value) {
      if (columns === undefined) columns = rows;
      if (value === undefined) value = 1;
      var min = Math.min(rows, columns);
      var matrix = this.zeros(rows, columns);

      for (var i = 0; i < min; i++) {
        matrix.set(i, i, value);
      }

      return matrix;
    }
    /**
     * Creates a diagonal matrix based on the given array.
     * @param {Array} data - Array containing the data for the diagonal
     * @param {number} [rows] - Number of rows (Default: data.length)
     * @param {number} [columns] - Number of columns (Default: rows)
     * @return {Matrix} - The new diagonal matrix
     */


    static diag(data, rows, columns) {
      var l = data.length;
      if (rows === undefined) rows = l;
      if (columns === undefined) columns = rows;
      var min = Math.min(l, rows, columns);
      var matrix = this.zeros(rows, columns);

      for (var i = 0; i < min; i++) {
        matrix.set(i, i, data[i]);
      }

      return matrix;
    }
    /**
     * Returns a matrix whose elements are the minimum between matrix1 and matrix2
     * @param {Matrix} matrix1
     * @param {Matrix} matrix2
     * @return {Matrix}
     */


    static min(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      var rows = matrix1.rows;
      var columns = matrix1.columns;
      var result = new this(rows, columns);

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }

      return result;
    }
    /**
     * Returns a matrix whose elements are the maximum between matrix1 and matrix2
     * @param {Matrix} matrix1
     * @param {Matrix} matrix2
     * @return {Matrix}
     */


    static max(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      var rows = matrix1.rows;
      var columns = matrix1.columns;
      var result = new this(rows, columns);

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }

      return result;
    }
    /**
     * Check that the provided value is a Matrix and tries to instantiate one if not
     * @param {*} value - The value to check
     * @return {Matrix}
     */


    static checkMatrix(value) {
      return Matrix.isMatrix(value) ? value : new this(value);
    }
    /**
     * Returns true if the argument is a Matrix, false otherwise
     * @param {*} value - The value to check
     * @return {boolean}
     */


    static isMatrix(value) {
      return value != null && value.klass === 'Matrix';
    }
    /**
     * @prop {number} size - The number of elements in the matrix.
     */


    get size() {
      return this.rows * this.columns;
    }
    /**
     * Applies a callback for each element of the matrix. The function is called in the matrix (this) context.
     * @param {function} callback - Function that will be called with two parameters : i (row) and j (column)
     * @return {Matrix} this
     */


    apply(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }

      var ii = this.rows;
      var jj = this.columns;

      for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
          callback.call(this, i, j);
        }
      }

      return this;
    }
    /**
     * Returns a new 1D array filled row by row with the matrix values
     * @return {Array}
     */


    to1DArray() {
      var array = new Array(this.size);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          array[i * this.columns + j] = this.get(i, j);
        }
      }

      return array;
    }
    /**
     * Returns a 2D array containing a copy of the data
     * @return {Array}
     */


    to2DArray() {
      var copy = new Array(this.rows);

      for (var i = 0; i < this.rows; i++) {
        copy[i] = new Array(this.columns);

        for (var j = 0; j < this.columns; j++) {
          copy[i][j] = this.get(i, j);
        }
      }

      return copy;
    }
    /**
     * @return {boolean} true if the matrix has one row
     */


    isRowVector() {
      return this.rows === 1;
    }
    /**
     * @return {boolean} true if the matrix has one column
     */


    isColumnVector() {
      return this.columns === 1;
    }
    /**
     * @return {boolean} true if the matrix has one row or one column
     */


    isVector() {
      return this.rows === 1 || this.columns === 1;
    }
    /**
     * @return {boolean} true if the matrix has the same number of rows and columns
     */


    isSquare() {
      return this.rows === this.columns;
    }
    /**
     * @return {boolean} true if the matrix is square and has the same values on both sides of the diagonal
     */


    isSymmetric() {
      if (this.isSquare()) {
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j <= i; j++) {
            if (this.get(i, j) !== this.get(j, i)) {
              return false;
            }
          }
        }

        return true;
      }

      return false;
    }
    /**
     * Sets a given element of the matrix. mat.set(3,4,1) is equivalent to mat[3][4]=1
     * @abstract
     * @param {number} rowIndex - Index of the row
     * @param {number} columnIndex - Index of the column
     * @param {number} value - The new value for the element
     * @return {Matrix} this
     */


    set(rowIndex, columnIndex, value) {
      // eslint-disable-line no-unused-vars
      throw new Error('set method is unimplemented');
    }
    /**
     * Returns the given element of the matrix. mat.get(3,4) is equivalent to matrix[3][4]
     * @abstract
     * @param {number} rowIndex - Index of the row
     * @param {number} columnIndex - Index of the column
     * @return {number}
     */


    get(rowIndex, columnIndex) {
      // eslint-disable-line no-unused-vars
      throw new Error('get method is unimplemented');
    }
    /**
     * Creates a new matrix that is a repetition of the current matrix. New matrix has rowRep times the number of
     * rows of the matrix, and colRep times the number of columns of the matrix
     * @param {number} rowRep - Number of times the rows should be repeated
     * @param {number} colRep - Number of times the columns should be re
     * @return {Matrix}
     * @example
     * var matrix = new Matrix([[1,2]]);
     * matrix.repeat(2); // [[1,2],[1,2]]
     */


    repeat(rowRep, colRep) {
      rowRep = rowRep || 1;
      colRep = colRep || 1;
      var matrix = new this.constructor[Symbol.species](this.rows * rowRep, this.columns * colRep);

      for (var i = 0; i < rowRep; i++) {
        for (var j = 0; j < colRep; j++) {
          matrix.setSubMatrix(this, this.rows * i, this.columns * j);
        }
      }

      return matrix;
    }
    /**
     * Fills the matrix with a given value. All elements will be set to this value.
     * @param {number} value - New value
     * @return {Matrix} this
     */


    fill(value) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, value);
        }
      }

      return this;
    }
    /**
     * Negates the matrix. All elements will be multiplied by (-1)
     * @return {Matrix} this
     */


    neg() {
      return this.mulS(-1);
    }
    /**
     * Returns a new array from the given row index
     * @param {number} index - Row index
     * @return {Array}
     */


    getRow(index) {
      util.checkRowIndex(this, index);
      var row = new Array(this.columns);

      for (var i = 0; i < this.columns; i++) {
        row[i] = this.get(index, i);
      }

      return row;
    }
    /**
     * Returns a new row vector from the given row index
     * @param {number} index - Row index
     * @return {Matrix}
     */


    getRowVector(index) {
      return this.constructor.rowVector(this.getRow(index));
    }
    /**
     * Sets a row at the given index
     * @param {number} index - Row index
     * @param {Array|Matrix} array - Array or vector
     * @return {Matrix} this
     */


    setRow(index, array) {
      util.checkRowIndex(this, index);
      array = util.checkRowVector(this, array);

      for (var i = 0; i < this.columns; i++) {
        this.set(index, i, array[i]);
      }

      return this;
    }
    /**
     * Swaps two rows
     * @param {number} row1 - First row index
     * @param {number} row2 - Second row index
     * @return {Matrix} this
     */


    swapRows(row1, row2) {
      util.checkRowIndex(this, row1);
      util.checkRowIndex(this, row2);

      for (var i = 0; i < this.columns; i++) {
        var temp = this.get(row1, i);
        this.set(row1, i, this.get(row2, i));
        this.set(row2, i, temp);
      }

      return this;
    }
    /**
     * Returns a new array from the given column index
     * @param {number} index - Column index
     * @return {Array}
     */


    getColumn(index) {
      util.checkColumnIndex(this, index);
      var column = new Array(this.rows);

      for (var i = 0; i < this.rows; i++) {
        column[i] = this.get(i, index);
      }

      return column;
    }
    /**
     * Returns a new column vector from the given column index
     * @param {number} index - Column index
     * @return {Matrix}
     */


    getColumnVector(index) {
      return this.constructor.columnVector(this.getColumn(index));
    }
    /**
     * Sets a column at the given index
     * @param {number} index - Column index
     * @param {Array|Matrix} array - Array or vector
     * @return {Matrix} this
     */


    setColumn(index, array) {
      util.checkColumnIndex(this, index);
      array = util.checkColumnVector(this, array);

      for (var i = 0; i < this.rows; i++) {
        this.set(i, index, array[i]);
      }

      return this;
    }
    /**
     * Swaps two columns
     * @param {number} column1 - First column index
     * @param {number} column2 - Second column index
     * @return {Matrix} this
     */


    swapColumns(column1, column2) {
      util.checkColumnIndex(this, column1);
      util.checkColumnIndex(this, column2);

      for (var i = 0; i < this.rows; i++) {
        var temp = this.get(i, column1);
        this.set(i, column1, this.get(i, column2));
        this.set(i, column2, temp);
      }

      return this;
    }
    /**
     * Adds the values of a vector to each row
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    addRowVector(vector) {
      vector = util.checkRowVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[j]);
        }
      }

      return this;
    }
    /**
     * Subtracts the values of a vector from each row
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    subRowVector(vector) {
      vector = util.checkRowVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[j]);
        }
      }

      return this;
    }
    /**
     * Multiplies the values of a vector with each row
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    mulRowVector(vector) {
      vector = util.checkRowVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[j]);
        }
      }

      return this;
    }
    /**
     * Divides the values of each row by those of a vector
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    divRowVector(vector) {
      vector = util.checkRowVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[j]);
        }
      }

      return this;
    }
    /**
     * Adds the values of a vector to each column
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    addColumnVector(vector) {
      vector = util.checkColumnVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[i]);
        }
      }

      return this;
    }
    /**
     * Subtracts the values of a vector from each column
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    subColumnVector(vector) {
      vector = util.checkColumnVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[i]);
        }
      }

      return this;
    }
    /**
     * Multiplies the values of a vector with each column
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    mulColumnVector(vector) {
      vector = util.checkColumnVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[i]);
        }
      }

      return this;
    }
    /**
     * Divides the values of each column by those of a vector
     * @param {Array|Matrix} vector - Array or vector
     * @return {Matrix} this
     */


    divColumnVector(vector) {
      vector = util.checkColumnVector(this, vector);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[i]);
        }
      }

      return this;
    }
    /**
     * Multiplies the values of a row with a scalar
     * @param {number} index - Row index
     * @param {number} value
     * @return {Matrix} this
     */


    mulRow(index, value) {
      util.checkRowIndex(this, index);

      for (var i = 0; i < this.columns; i++) {
        this.set(index, i, this.get(index, i) * value);
      }

      return this;
    }
    /**
     * Multiplies the values of a column with a scalar
     * @param {number} index - Column index
     * @param {number} value
     * @return {Matrix} this
     */


    mulColumn(index, value) {
      util.checkColumnIndex(this, index);

      for (var i = 0; i < this.rows; i++) {
        this.set(i, index, this.get(i, index) * value);
      }

      return this;
    }
    /**
     * Returns the maximum value of the matrix
     * @return {number}
     */


    max() {
      var v = this.get(0, 0);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
          }
        }
      }

      return v;
    }
    /**
     * Returns the index of the maximum value
     * @return {Array}
     */


    maxIndex() {
      var v = this.get(0, 0);
      var idx = [0, 0];

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }

      return idx;
    }
    /**
     * Returns the minimum value of the matrix
     * @return {number}
     */


    min() {
      var v = this.get(0, 0);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
          }
        }
      }

      return v;
    }
    /**
     * Returns the index of the minimum value
     * @return {Array}
     */


    minIndex() {
      var v = this.get(0, 0);
      var idx = [0, 0];

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }

      return idx;
    }
    /**
     * Returns the maximum value of one row
     * @param {number} row - Row index
     * @return {number}
     */


    maxRow(row) {
      util.checkRowIndex(this, row);
      var v = this.get(row, 0);

      for (var i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
        }
      }

      return v;
    }
    /**
     * Returns the index of the maximum value of one row
     * @param {number} row - Row index
     * @return {Array}
     */


    maxRowIndex(row) {
      util.checkRowIndex(this, row);
      var v = this.get(row, 0);
      var idx = [row, 0];

      for (var i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }

      return idx;
    }
    /**
     * Returns the minimum value of one row
     * @param {number} row - Row index
     * @return {number}
     */


    minRow(row) {
      util.checkRowIndex(this, row);
      var v = this.get(row, 0);

      for (var i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
        }
      }

      return v;
    }
    /**
     * Returns the index of the maximum value of one row
     * @param {number} row - Row index
     * @return {Array}
     */


    minRowIndex(row) {
      util.checkRowIndex(this, row);
      var v = this.get(row, 0);
      var idx = [row, 0];

      for (var i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }

      return idx;
    }
    /**
     * Returns the maximum value of one column
     * @param {number} column - Column index
     * @return {number}
     */


    maxColumn(column) {
      util.checkColumnIndex(this, column);
      var v = this.get(0, column);

      for (var i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
        }
      }

      return v;
    }
    /**
     * Returns the index of the maximum value of one column
     * @param {number} column - Column index
     * @return {Array}
     */


    maxColumnIndex(column) {
      util.checkColumnIndex(this, column);
      var v = this.get(0, column);
      var idx = [0, column];

      for (var i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }

      return idx;
    }
    /**
     * Returns the minimum value of one column
     * @param {number} column - Column index
     * @return {number}
     */


    minColumn(column) {
      util.checkColumnIndex(this, column);
      var v = this.get(0, column);

      for (var i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
        }
      }

      return v;
    }
    /**
     * Returns the index of the minimum value of one column
     * @param {number} column - Column index
     * @return {Array}
     */


    minColumnIndex(column) {
      util.checkColumnIndex(this, column);
      var v = this.get(0, column);
      var idx = [0, column];

      for (var i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }

      return idx;
    }
    /**
     * Returns an array containing the diagonal values of the matrix
     * @return {Array}
     */


    diag() {
      var min = Math.min(this.rows, this.columns);
      var diag = new Array(min);

      for (var i = 0; i < min; i++) {
        diag[i] = this.get(i, i);
      }

      return diag;
    }
    /**
     * Returns the sum by the argument given, if no argument given,
     * it returns the sum of all elements of the matrix.
     * @param {string} by - sum by 'row' or 'column'.
     * @return {Matrix|number}
     */


    sum(by) {
      switch (by) {
        case 'row':
          return util.sumByRow(this);

        case 'column':
          return util.sumByColumn(this);

        default:
          return util.sumAll(this);
      }
    }
    /**
     * Returns the mean of all elements of the matrix
     * @return {number}
     */


    mean() {
      return this.sum() / this.size;
    }
    /**
     * Returns the product of all elements of the matrix
     * @return {number}
     */


    prod() {
      var prod = 1;

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          prod *= this.get(i, j);
        }
      }

      return prod;
    }
    /**
     * Computes the cumulative sum of the matrix elements (in place, row by row)
     * @return {Matrix} this
     */


    cumulativeSum() {
      var sum = 0;

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          sum += this.get(i, j);
          this.set(i, j, sum);
        }
      }

      return this;
    }
    /**
     * Computes the dot (scalar) product between the matrix and another
     * @param {Matrix} vector2 vector
     * @return {number}
     */


    dot(vector2) {
      if (Matrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
      var vector1 = this.to1DArray();

      if (vector1.length !== vector2.length) {
        throw new RangeError('vectors do not have the same size');
      }

      var dot = 0;

      for (var i = 0; i < vector1.length; i++) {
        dot += vector1[i] * vector2[i];
      }

      return dot;
    }
    /**
     * Returns the matrix product between this and other
     * @param {Matrix} other
     * @return {Matrix}
     */


    mmul(other) {
      other = this.constructor.checkMatrix(other);

      if (this.columns !== other.rows) {
        // eslint-disable-next-line no-console
        console.warn('Number of columns of left matrix are not equal to number of rows of right matrix.');
      }

      var m = this.rows;
      var n = this.columns;
      var p = other.columns;
      var result = new this.constructor[Symbol.species](m, p);
      var Bcolj = new Array(n);

      for (var j = 0; j < p; j++) {
        for (var k = 0; k < n; k++) {
          Bcolj[k] = other.get(k, j);
        }

        for (var i = 0; i < m; i++) {
          var s = 0;

          for (k = 0; k < n; k++) {
            s += this.get(i, k) * Bcolj[k];
          }

          result.set(i, j, s);
        }
      }

      return result;
    }

    strassen2x2(other) {
      var result = new this.constructor[Symbol.species](2, 2);
      const a11 = this.get(0, 0);
      const b11 = other.get(0, 0);
      const a12 = this.get(0, 1);
      const b12 = other.get(0, 1);
      const a21 = this.get(1, 0);
      const b21 = other.get(1, 0);
      const a22 = this.get(1, 1);
      const b22 = other.get(1, 1); // Compute intermediate values.

      const m1 = (a11 + a22) * (b11 + b22);
      const m2 = (a21 + a22) * b11;
      const m3 = a11 * (b12 - b22);
      const m4 = a22 * (b21 - b11);
      const m5 = (a11 + a12) * b22;
      const m6 = (a21 - a11) * (b11 + b12);
      const m7 = (a12 - a22) * (b21 + b22); // Combine intermediate values into the output.

      const c00 = m1 + m4 - m5 + m7;
      const c01 = m3 + m5;
      const c10 = m2 + m4;
      const c11 = m1 - m2 + m3 + m6;
      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      return result;
    }

    strassen3x3(other) {
      var result = new this.constructor[Symbol.species](3, 3);
      const a00 = this.get(0, 0);
      const a01 = this.get(0, 1);
      const a02 = this.get(0, 2);
      const a10 = this.get(1, 0);
      const a11 = this.get(1, 1);
      const a12 = this.get(1, 2);
      const a20 = this.get(2, 0);
      const a21 = this.get(2, 1);
      const a22 = this.get(2, 2);
      const b00 = other.get(0, 0);
      const b01 = other.get(0, 1);
      const b02 = other.get(0, 2);
      const b10 = other.get(1, 0);
      const b11 = other.get(1, 1);
      const b12 = other.get(1, 2);
      const b20 = other.get(2, 0);
      const b21 = other.get(2, 1);
      const b22 = other.get(2, 2);
      const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
      const m2 = (a00 - a10) * (-b01 + b11);
      const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
      const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
      const m5 = (a10 + a11) * (-b00 + b01);
      const m6 = a00 * b00;
      const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
      const m8 = (-a00 + a20) * (b02 - b12);
      const m9 = (a20 + a21) * (-b00 + b02);
      const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
      const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
      const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
      const m13 = (a02 - a22) * (b11 - b21);
      const m14 = a02 * b20;
      const m15 = (a21 + a22) * (-b20 + b21);
      const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
      const m17 = (a02 - a12) * (b12 - b22);
      const m18 = (a11 + a12) * (-b20 + b22);
      const m19 = a01 * b10;
      const m20 = a12 * b21;
      const m21 = a10 * b02;
      const m22 = a20 * b01;
      const m23 = a22 * b22;
      const c00 = m6 + m14 + m19;
      const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
      const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
      const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
      const c11 = m2 + m4 + m5 + m6 + m20;
      const c12 = m14 + m16 + m17 + m18 + m21;
      const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
      const c21 = m12 + m13 + m14 + m15 + m22;
      const c22 = m6 + m7 + m8 + m9 + m23;
      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(0, 2, c02);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      result.set(1, 2, c12);
      result.set(2, 0, c20);
      result.set(2, 1, c21);
      result.set(2, 2, c22);
      return result;
    }
    /**
     * Returns the matrix product between x and y. More efficient than mmul(other) only when we multiply squared matrix and when the size of the matrix is > 1000.
     * @param {Matrix} y
     * @return {Matrix}
     */


    mmulStrassen(y) {
      var x = this.clone();
      var r1 = x.rows;
      var c1 = x.columns;
      var r2 = y.rows;
      var c2 = y.columns;

      if (c1 !== r2) {
        // eslint-disable-next-line no-console
        console.warn("Multiplying ".concat(r1, " x ").concat(c1, " and ").concat(r2, " x ").concat(c2, " matrix: dimensions do not match."));
      } // Put a matrix into the top left of a matrix of zeros.
      // `rows` and `cols` are the dimensions of the output matrix.


      function embed(mat, rows, cols) {
        var r = mat.rows;
        var c = mat.columns;

        if (r === rows && c === cols) {
          return mat;
        } else {
          var resultat = Matrix.zeros(rows, cols);
          resultat = resultat.setSubMatrix(mat, 0, 0);
          return resultat;
        }
      } // Make sure both matrices are the same size.
      // This is exclusively for simplicity:
      // this algorithm can be implemented with matrices of different sizes.


      var r = Math.max(r1, r2);
      var c = Math.max(c1, c2);
      x = embed(x, r, c);
      y = embed(y, r, c); // Our recursive multiplication function.

      function blockMult(a, b, rows, cols) {
        // For small matrices, resort to naive multiplication.
        if (rows <= 512 || cols <= 512) {
          return a.mmul(b); // a is equivalent to this
        } // Apply dynamic padding.


        if (rows % 2 === 1 && cols % 2 === 1) {
          a = embed(a, rows + 1, cols + 1);
          b = embed(b, rows + 1, cols + 1);
        } else if (rows % 2 === 1) {
          a = embed(a, rows + 1, cols);
          b = embed(b, rows + 1, cols);
        } else if (cols % 2 === 1) {
          a = embed(a, rows, cols + 1);
          b = embed(b, rows, cols + 1);
        }

        var halfRows = parseInt(a.rows / 2);
        var halfCols = parseInt(a.columns / 2); // Subdivide input matrices.

        var a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        var b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        var a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
        var b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);
        var a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
        var b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);
        var a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
        var b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1); // Compute intermediate values.

        var m1 = blockMult(Matrix.add(a11, a22), Matrix.add(b11, b22), halfRows, halfCols);
        var m2 = blockMult(Matrix.add(a21, a22), b11, halfRows, halfCols);
        var m3 = blockMult(a11, Matrix.sub(b12, b22), halfRows, halfCols);
        var m4 = blockMult(a22, Matrix.sub(b21, b11), halfRows, halfCols);
        var m5 = blockMult(Matrix.add(a11, a12), b22, halfRows, halfCols);
        var m6 = blockMult(Matrix.sub(a21, a11), Matrix.add(b11, b12), halfRows, halfCols);
        var m7 = blockMult(Matrix.sub(a12, a22), Matrix.add(b21, b22), halfRows, halfCols); // Combine intermediate values into the output.

        var c11 = Matrix.add(m1, m4);
        c11.sub(m5);
        c11.add(m7);
        var c12 = Matrix.add(m3, m5);
        var c21 = Matrix.add(m2, m4);
        var c22 = Matrix.sub(m1, m2);
        c22.add(m3);
        c22.add(m6); //Crop output to the desired size (undo dynamic padding).

        var resultat = Matrix.zeros(2 * c11.rows, 2 * c11.columns);
        resultat = resultat.setSubMatrix(c11, 0, 0);
        resultat = resultat.setSubMatrix(c12, c11.rows, 0);
        resultat = resultat.setSubMatrix(c21, 0, c11.columns);
        resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
        return resultat.subMatrix(0, rows - 1, 0, cols - 1);
      }

      return blockMult(x, y, r, c);
    }
    /**
     * Returns a row-by-row scaled matrix
     * @param {number} [min=0] - Minimum scaled value
     * @param {number} [max=1] - Maximum scaled value
     * @return {Matrix} - The scaled matrix
     */


    scaleRows(min, max) {
      min = min === undefined ? 0 : min;
      max = max === undefined ? 1 : max;

      if (min >= max) {
        throw new RangeError('min should be strictly smaller than max');
      }

      var newMatrix = this.constructor.empty(this.rows, this.columns);

      for (var i = 0; i < this.rows; i++) {
        var scaled = arrayUtils.scale(this.getRow(i), {
          min,
          max
        });
        newMatrix.setRow(i, scaled);
      }

      return newMatrix;
    }
    /**
     * Returns a new column-by-column scaled matrix
     * @param {number} [min=0] - Minimum scaled value
     * @param {number} [max=1] - Maximum scaled value
     * @return {Matrix} - The new scaled matrix
     * @example
     * var matrix = new Matrix([[1,2],[-1,0]]);
     * var scaledMatrix = matrix.scaleColumns(); // [[1,1],[0,0]]
     */


    scaleColumns(min, max) {
      min = min === undefined ? 0 : min;
      max = max === undefined ? 1 : max;

      if (min >= max) {
        throw new RangeError('min should be strictly smaller than max');
      }

      var newMatrix = this.constructor.empty(this.rows, this.columns);

      for (var i = 0; i < this.columns; i++) {
        var scaled = arrayUtils.scale(this.getColumn(i), {
          min: min,
          max: max
        });
        newMatrix.setColumn(i, scaled);
      }

      return newMatrix;
    }
    /**
     * Returns the Kronecker product (also known as tensor product) between this and other
     * See https://en.wikipedia.org/wiki/Kronecker_product
     * @param {Matrix} other
     * @return {Matrix}
     */


    kroneckerProduct(other) {
      other = this.constructor.checkMatrix(other);
      var m = this.rows;
      var n = this.columns;
      var p = other.rows;
      var q = other.columns;
      var result = new this.constructor[Symbol.species](m * p, n * q);

      for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
          for (var k = 0; k < p; k++) {
            for (var l = 0; l < q; l++) {
              result[p * i + k][q * j + l] = this.get(i, j) * other.get(k, l);
            }
          }
        }
      }

      return result;
    }
    /**
     * Transposes the matrix and returns a new one containing the result
     * @return {Matrix}
     */


    transpose() {
      var result = new this.constructor[Symbol.species](this.columns, this.rows);

      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          result.set(j, i, this.get(i, j));
        }
      }

      return result;
    }
    /**
     * Sorts the rows (in place)
     * @param {function} compareFunction - usual Array.prototype.sort comparison function
     * @return {Matrix} this
     */


    sortRows(compareFunction) {
      if (compareFunction === undefined) compareFunction = compareNumbers;

      for (var i = 0; i < this.rows; i++) {
        this.setRow(i, this.getRow(i).sort(compareFunction));
      }

      return this;
    }
    /**
     * Sorts the columns (in place)
     * @param {function} compareFunction - usual Array.prototype.sort comparison function
     * @return {Matrix} this
     */


    sortColumns(compareFunction) {
      if (compareFunction === undefined) compareFunction = compareNumbers;

      for (var i = 0; i < this.columns; i++) {
        this.setColumn(i, this.getColumn(i).sort(compareFunction));
      }

      return this;
    }
    /**
     * Returns a subset of the matrix
     * @param {number} startRow - First row index
     * @param {number} endRow - Last row index
     * @param {number} startColumn - First column index
     * @param {number} endColumn - Last column index
     * @return {Matrix}
     */


    subMatrix(startRow, endRow, startColumn, endColumn) {
      util.checkRange(this, startRow, endRow, startColumn, endColumn);
      var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, endColumn - startColumn + 1);

      for (var i = startRow; i <= endRow; i++) {
        for (var j = startColumn; j <= endColumn; j++) {
          newMatrix[i - startRow][j - startColumn] = this.get(i, j);
        }
      }

      return newMatrix;
    }
    /**
     * Returns a subset of the matrix based on an array of row indices
     * @param {Array} indices - Array containing the row indices
     * @param {number} [startColumn = 0] - First column index
     * @param {number} [endColumn = this.columns-1] - Last column index
     * @return {Matrix}
     */


    subMatrixRow(indices, startColumn, endColumn) {
      if (startColumn === undefined) startColumn = 0;
      if (endColumn === undefined) endColumn = this.columns - 1;

      if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
        throw new RangeError('Argument out of range');
      }

      var newMatrix = new this.constructor[Symbol.species](indices.length, endColumn - startColumn + 1);

      for (var i = 0; i < indices.length; i++) {
        for (var j = startColumn; j <= endColumn; j++) {
          if (indices[i] < 0 || indices[i] >= this.rows) {
            throw new RangeError('Row index out of range: ' + indices[i]);
          }

          newMatrix.set(i, j - startColumn, this.get(indices[i], j));
        }
      }

      return newMatrix;
    }
    /**
     * Returns a subset of the matrix based on an array of column indices
     * @param {Array} indices - Array containing the column indices
     * @param {number} [startRow = 0] - First row index
     * @param {number} [endRow = this.rows-1] - Last row index
     * @return {Matrix}
     */


    subMatrixColumn(indices, startRow, endRow) {
      if (startRow === undefined) startRow = 0;
      if (endRow === undefined) endRow = this.rows - 1;

      if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
        throw new RangeError('Argument out of range');
      }

      var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, indices.length);

      for (var i = 0; i < indices.length; i++) {
        for (var j = startRow; j <= endRow; j++) {
          if (indices[i] < 0 || indices[i] >= this.columns) {
            throw new RangeError('Column index out of range: ' + indices[i]);
          }

          newMatrix.set(j - startRow, i, this.get(j, indices[i]));
        }
      }

      return newMatrix;
    }
    /**
     * Set a part of the matrix to the given sub-matrix
     * @param {Matrix|Array< Array >} matrix - The source matrix from which to extract values.
     * @param {number} startRow - The index of the first row to set
     * @param {number} startColumn - The index of the first column to set
     * @return {Matrix}
     */


    setSubMatrix(matrix, startRow, startColumn) {
      matrix = this.constructor.checkMatrix(matrix);
      var endRow = startRow + matrix.rows - 1;
      var endColumn = startColumn + matrix.columns - 1;
      util.checkRange(this, startRow, endRow, startColumn, endColumn);

      for (var i = 0; i < matrix.rows; i++) {
        for (var j = 0; j < matrix.columns; j++) {
          this[startRow + i][startColumn + j] = matrix.get(i, j);
        }
      }

      return this;
    }
    /**
     * Return a new matrix based on a selection of rows and columns
     * @param {Array<number>} rowIndices - The row indices to select. Order matters and an index can be more than once.
     * @param {Array<number>} columnIndices - The column indices to select. Order matters and an index can be use more than once.
     * @return {Matrix} The new matrix
     */


    selection(rowIndices, columnIndices) {
      var indices = util.checkIndices(this, rowIndices, columnIndices);
      var newMatrix = new this.constructor[Symbol.species](rowIndices.length, columnIndices.length);

      for (var i = 0; i < indices.row.length; i++) {
        var rowIndex = indices.row[i];

        for (var j = 0; j < indices.column.length; j++) {
          var columnIndex = indices.column[j];
          newMatrix[i][j] = this.get(rowIndex, columnIndex);
        }
      }

      return newMatrix;
    }
    /**
     * Returns the trace of the matrix (sum of the diagonal elements)
     * @return {number}
     */


    trace() {
      var min = Math.min(this.rows, this.columns);
      var trace = 0;

      for (var i = 0; i < min; i++) {
        trace += this.get(i, i);
      }

      return trace;
    }
    /*
     Matrix views
     */

    /**
     * Returns a view of the transposition of the matrix
     * @return {MatrixTransposeView}
     */


    transposeView() {
      return new MatrixTransposeView(this);
    }
    /**
     * Returns a view of the row vector with the given index
     * @param {number} row - row index of the vector
     * @return {MatrixRowView}
     */


    rowView(row) {
      util.checkRowIndex(this, row);
      return new MatrixRowView(this, row);
    }
    /**
     * Returns a view of the column vector with the given index
     * @param {number} column - column index of the vector
     * @return {MatrixColumnView}
     */


    columnView(column) {
      util.checkColumnIndex(this, column);
      return new MatrixColumnView(this, column);
    }
    /**
     * Returns a view of the matrix flipped in the row axis
     * @return {MatrixFlipRowView}
     */


    flipRowView() {
      return new MatrixFlipRowView(this);
    }
    /**
     * Returns a view of the matrix flipped in the column axis
     * @return {MatrixFlipColumnView}
     */


    flipColumnView() {
      return new MatrixFlipColumnView(this);
    }
    /**
     * Returns a view of a submatrix giving the index boundaries
     * @param {number} startRow - first row index of the submatrix
     * @param {number} endRow - last row index of the submatrix
     * @param {number} startColumn - first column index of the submatrix
     * @param {number} endColumn - last column index of the submatrix
     * @return {MatrixSubView}
     */


    subMatrixView(startRow, endRow, startColumn, endColumn) {
      return new MatrixSubView(this, startRow, endRow, startColumn, endColumn);
    }
    /**
     * Returns a view of the cross of the row indices and the column indices
     * @example
     * // resulting vector is [[2], [2]]
     * var matrix = new Matrix([[1,2,3], [4,5,6]]).selectionView([0, 0], [1])
     * @param {Array<number>} rowIndices
     * @param {Array<number>} columnIndices
     * @return {MatrixSelectionView}
     */


    selectionView(rowIndices, columnIndices) {
      return new MatrixSelectionView(this, rowIndices, columnIndices);
    }
    /**
    * Calculates and returns the determinant of a matrix as a Number
    * @example
    *   new Matrix([[1,2,3], [4,5,6]]).det()
    * @return {number}
    */


    det() {
      if (this.isSquare()) {
        var a, b, c, d;

        if (this.columns === 2) {
          // 2 x 2 matrix
          a = this.get(0, 0);
          b = this.get(0, 1);
          c = this.get(1, 0);
          d = this.get(1, 1);
          return a * d - b * c;
        } else if (this.columns === 3) {
          // 3 x 3 matrix
          var subMatrix0, subMatrix1, subMatrix2;
          subMatrix0 = this.selectionView([1, 2], [1, 2]);
          subMatrix1 = this.selectionView([1, 2], [0, 2]);
          subMatrix2 = this.selectionView([1, 2], [0, 1]);
          a = this.get(0, 0);
          b = this.get(0, 1);
          c = this.get(0, 2);
          return a * subMatrix0.det() - b * subMatrix1.det() + c * subMatrix2.det();
        } else {
          // general purpose determinant using the LU decomposition
          return new LuDecomposition(this).determinant;
        }
      } else {
        throw Error('Determinant can only be calculated for a square matrix.');
      }
    }
    /**
     * Returns inverse of a matrix if it exists or the pseudoinverse
     * @param {number} threshold - threshold for taking inverse of singular values (default = 1e-15)
     * @return {Matrix} the (pseudo)inverted matrix.
     */


    pseudoInverse(threshold) {
      if (threshold === undefined) threshold = Number.EPSILON;
      var svdSolution = new SvDecomposition(this, {
        autoTranspose: true
      });
      var U = svdSolution.leftSingularVectors;
      var V = svdSolution.rightSingularVectors;
      var s = svdSolution.diagonal;

      for (var i = 0; i < s.length; i++) {
        if (Math.abs(s[i]) > threshold) {
          s[i] = 1.0 / s[i];
        } else {
          s[i] = 0.0;
        }
      } // convert list to diagonal


      s = this.constructor[Symbol.species].diag(s);
      return V.mmul(s.mmul(U.transposeView()));
    }

  }

  Matrix.prototype.klass = 'Matrix';
  /**
   * @private
   * Check that two matrices have the same dimensions
   * @param {Matrix} matrix
   * @param {Matrix} otherMatrix
   */

  function checkDimensions(matrix, otherMatrix) {
    // eslint-disable-line no-unused-vars
    if (matrix.rows !== otherMatrix.rows || matrix.columns !== otherMatrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
  }

  function compareNumbers(a, b) {
    return a - b;
  }
  /*
   Synonyms
   */


  Matrix.random = Matrix.rand;
  Matrix.diagonal = Matrix.diag;
  Matrix.prototype.diagonal = Matrix.prototype.diag;
  Matrix.identity = Matrix.eye;
  Matrix.prototype.negate = Matrix.prototype.neg;
  Matrix.prototype.tensorProduct = Matrix.prototype.kroneckerProduct;
  Matrix.prototype.determinant = Matrix.prototype.det;
  /*
   Add dynamically instance and static methods for mathematical operations
   */

  var inplaceOperator = "\n(function %name%(value) {\n    if (typeof value === 'number') return this.%name%S(value);\n    return this.%name%M(value);\n})\n";
  var inplaceOperatorScalar = "\n(function %name%S(value) {\n    for (var i = 0; i < this.rows; i++) {\n        for (var j = 0; j < this.columns; j++) {\n            this.set(i, j, this.get(i, j) %op% value);\n        }\n    }\n    return this;\n})\n";
  var inplaceOperatorMatrix = "\n(function %name%M(matrix) {\n    matrix = this.constructor.checkMatrix(matrix);\n    checkDimensions(this, matrix);\n    for (var i = 0; i < this.rows; i++) {\n        for (var j = 0; j < this.columns; j++) {\n            this.set(i, j, this.get(i, j) %op% matrix.get(i, j));\n        }\n    }\n    return this;\n})\n";
  var staticOperator = "\n(function %name%(matrix, value) {\n    var newMatrix = new this[Symbol.species](matrix);\n    return newMatrix.%name%(value);\n})\n";
  var inplaceMethod = "\n(function %name%() {\n    for (var i = 0; i < this.rows; i++) {\n        for (var j = 0; j < this.columns; j++) {\n            this.set(i, j, %method%(this.get(i, j)));\n        }\n    }\n    return this;\n})\n";
  var staticMethod = "\n(function %name%(matrix) {\n    var newMatrix = new this[Symbol.species](matrix);\n    return newMatrix.%name%();\n})\n";
  var inplaceMethodWithArgs = "\n(function %name%(%args%) {\n    for (var i = 0; i < this.rows; i++) {\n        for (var j = 0; j < this.columns; j++) {\n            this.set(i, j, %method%(this.get(i, j), %args%));\n        }\n    }\n    return this;\n})\n";
  var staticMethodWithArgs = "\n(function %name%(matrix, %args%) {\n    var newMatrix = new this[Symbol.species](matrix);\n    return newMatrix.%name%(%args%);\n})\n";
  var inplaceMethodWithOneArgScalar = "\n(function %name%S(value) {\n    for (var i = 0; i < this.rows; i++) {\n        for (var j = 0; j < this.columns; j++) {\n            this.set(i, j, %method%(this.get(i, j), value));\n        }\n    }\n    return this;\n})\n";
  var inplaceMethodWithOneArgMatrix = "\n(function %name%M(matrix) {\n    matrix = this.constructor.checkMatrix(matrix);\n    checkDimensions(this, matrix);\n    for (var i = 0; i < this.rows; i++) {\n        for (var j = 0; j < this.columns; j++) {\n            this.set(i, j, %method%(this.get(i, j), matrix.get(i, j)));\n        }\n    }\n    return this;\n})\n";
  var inplaceMethodWithOneArg = "\n(function %name%(value) {\n    if (typeof value === 'number') return this.%name%S(value);\n    return this.%name%M(value);\n})\n";
  var staticMethodWithOneArg = staticMethodWithArgs;
  var operators = [// Arithmetic operators
  ['+', 'add'], ['-', 'sub', 'subtract'], ['*', 'mul', 'multiply'], ['/', 'div', 'divide'], ['%', 'mod', 'modulus'], // Bitwise operators
  ['&', 'and'], ['|', 'or'], ['^', 'xor'], ['<<', 'leftShift'], ['>>', 'signPropagatingRightShift'], ['>>>', 'rightShift', 'zeroFillRightShift']];
  var i;

  for (var operator of operators) {
    var inplaceOp = eval(fillTemplateFunction(inplaceOperator, {
      name: operator[1],
      op: operator[0]
    }));
    var inplaceOpS = eval(fillTemplateFunction(inplaceOperatorScalar, {
      name: operator[1] + 'S',
      op: operator[0]
    }));
    var inplaceOpM = eval(fillTemplateFunction(inplaceOperatorMatrix, {
      name: operator[1] + 'M',
      op: operator[0]
    }));
    var staticOp = eval(fillTemplateFunction(staticOperator, {
      name: operator[1]
    }));

    for (i = 1; i < operator.length; i++) {
      Matrix.prototype[operator[i]] = inplaceOp;
      Matrix.prototype[operator[i] + 'S'] = inplaceOpS;
      Matrix.prototype[operator[i] + 'M'] = inplaceOpM;
      Matrix[operator[i]] = staticOp;
    }
  }

  var methods = [['~', 'not']];
  ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'log', 'log1p', 'log10', 'log2', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'].forEach(function (mathMethod) {
    methods.push(['Math.' + mathMethod, mathMethod]);
  });

  for (var method of methods) {
    var inplaceMeth = eval(fillTemplateFunction(inplaceMethod, {
      name: method[1],
      method: method[0]
    }));
    var staticMeth = eval(fillTemplateFunction(staticMethod, {
      name: method[1]
    }));

    for (i = 1; i < method.length; i++) {
      Matrix.prototype[method[i]] = inplaceMeth;
      Matrix[method[i]] = staticMeth;
    }
  }

  var methodsWithArgs = [['Math.pow', 1, 'pow']];

  for (var methodWithArg of methodsWithArgs) {
    var args = 'arg0';

    for (i = 1; i < methodWithArg[1]; i++) {
      args += ", arg".concat(i);
    }

    if (methodWithArg[1] !== 1) {
      var inplaceMethWithArgs = eval(fillTemplateFunction(inplaceMethodWithArgs, {
        name: methodWithArg[2],
        method: methodWithArg[0],
        args: args
      }));
      var staticMethWithArgs = eval(fillTemplateFunction(staticMethodWithArgs, {
        name: methodWithArg[2],
        args: args
      }));

      for (i = 2; i < methodWithArg.length; i++) {
        Matrix.prototype[methodWithArg[i]] = inplaceMethWithArgs;
        Matrix[methodWithArg[i]] = staticMethWithArgs;
      }
    } else {
      var tmplVar = {
        name: methodWithArg[2],
        args: args,
        method: methodWithArg[0]
      };
      var inplaceMethod2 = eval(fillTemplateFunction(inplaceMethodWithOneArg, tmplVar));
      var inplaceMethodS = eval(fillTemplateFunction(inplaceMethodWithOneArgScalar, tmplVar));
      var inplaceMethodM = eval(fillTemplateFunction(inplaceMethodWithOneArgMatrix, tmplVar));
      var staticMethod2 = eval(fillTemplateFunction(staticMethodWithOneArg, tmplVar));

      for (i = 2; i < methodWithArg.length; i++) {
        Matrix.prototype[methodWithArg[i]] = inplaceMethod2;
        Matrix.prototype[methodWithArg[i] + 'M'] = inplaceMethodM;
        Matrix.prototype[methodWithArg[i] + 'S'] = inplaceMethodS;
        Matrix[methodWithArg[i]] = staticMethod2;
      }
    }
  }

  function fillTemplateFunction(template, values) {
    for (var value in values) {
      template = template.replace(new RegExp('%' + value + '%', 'g'), values[value]);
    }

    return template;
  }

  return Matrix;
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matrix = __webpack_require__(0); // https://github.com/lutzroeder/Mapack/blob/master/Source/LuDecomposition.cs


function LuDecomposition(matrix) {
  if (!(this instanceof LuDecomposition)) {
    return new LuDecomposition(matrix);
  }

  matrix = Matrix.Matrix.checkMatrix(matrix);
  var lu = matrix.clone(),
      rows = lu.rows,
      columns = lu.columns,
      pivotVector = new Array(rows),
      pivotSign = 1,
      i,
      j,
      k,
      p,
      s,
      t,
      v,
      LUrowi,
      LUcolj,
      kmax;

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
  isSingular: function isSingular() {
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

    if (!data.isSquare()) {
      throw new Error('Matrix must be square');
    }

    var determinant = this.pivotSign,
        col = data.columns;

    for (var j = 0; j < col; j++) {
      determinant *= data[j][j];
    }

    return determinant;
  },

  get lowerTriangularMatrix() {
    var data = this.LU,
        rows = data.rows,
        columns = data.columns,
        X = new Matrix.Matrix(rows, columns);

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

  get upperTriangularMatrix() {
    var data = this.LU,
        rows = data.rows,
        columns = data.columns,
        X = new Matrix.Matrix(rows, columns);

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

  solve: function solve(value) {
    value = Matrix.Matrix.checkMatrix(value);
    var lu = this.LU,
        rows = lu.rows;

    if (rows !== value.rows) {
      throw new Error('Invalid matrix dimensions');
    }

    if (this.isSingular()) {
      throw new Error('LU matrix is singular');
    }

    var count = value.columns;
    var X = value.subMatrixRow(this.pivotVector, 0, count - 1);
    var columns = lu.columns;
    var i, j, k;

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

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matrix = __webpack_require__(0);

var util = __webpack_require__(5);

var hypotenuse = util.hypotenuse;
var getFilled2DArray = util.getFilled2DArray; // https://github.com/lutzroeder/Mapack/blob/master/Source/SingularValueDecomposition.cs

function SingularValueDecomposition(value, options) {
  if (!(this instanceof SingularValueDecomposition)) {
    return new SingularValueDecomposition(value, options);
  }

  value = Matrix.Matrix.checkMatrix(value);
  options = options || {};
  var m = value.rows,
      n = value.columns,
      nu = Math.min(m, n);
  var wantu = true,
      wantv = true;
  if (options.computeLeftSingularVectors === false) wantu = false;
  if (options.computeRightSingularVectors === false) wantv = false;
  var autoTranspose = options.autoTranspose === true;
  var swapped = false;
  var a;

  if (m < n) {
    if (!autoTranspose) {
      a = value.clone(); // eslint-disable-next-line no-console

      console.warn('Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose');
    } else {
      a = value.transpose();
      m = a.rows;
      n = a.columns;
      swapped = true;
      var aux = wantu;
      wantu = wantv;
      wantv = aux;
    }
  } else {
    a = value.clone();
  }

  var s = new Array(Math.min(m + 1, n)),
      U = getFilled2DArray(m, nu, 0),
      V = getFilled2DArray(n, n, 0),
      e = new Array(n),
      work = new Array(m);
  var nct = Math.min(m - 1, n);
  var nrt = Math.max(0, Math.min(n - 2, m));
  var i, j, k, p, t, ks, f, cs, sn, max, kase, scale, sp, spm1, epm1, sk, ek, b, c, shift, g;

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
      if (k < nct && s[k] !== 0) {
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

    if (wantu && k < nct) {
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
        if (e[k + 1] < 0) {
          e[k] = 0 - e[k];
        }

        for (i = k + 1; i < n; i++) {
          e[i] /= e[k];
        }

        e[k + 1] += 1;
      }

      e[k] = -e[k];

      if (k + 1 < m && e[k] !== 0) {
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
      if (k < nrt && e[k] !== 0) {
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
      case 1:
        {
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

      case 2:
        {
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

      case 3:
        {
          scale = Math.max(Math.max(Math.max(Math.max(Math.abs(s[p - 1]), Math.abs(s[p - 2])), Math.abs(e[p - 2])), Math.abs(s[k])), Math.abs(e[k]));
          sp = s[p - 1] / scale;
          spm1 = s[p - 2] / scale;
          epm1 = e[p - 2] / scale;
          sk = s[k] / scale;
          ek = e[k] / scale;
          b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
          c = sp * epm1 * (sp * epm1);
          shift = 0;

          if (b !== 0 || c !== 0) {
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

            if (wantu && j < m - 1) {
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

      case 4:
        {
          if (s[k] <= 0) {
            s[k] = s[k] < 0 ? -s[k] : 0;

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

            if (wantv && k < n - 1) {
              for (i = 0; i < n; i++) {
                t = V[i][k + 1];
                V[i][k + 1] = V[i][k];
                V[i][k] = t;
              }
            }

            if (wantu && k < m - 1) {
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
      // no default
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
    return Math.pow(2, -52) / 2 * Math.max(this.m, this.n) * this.s[0];
  },

  get leftSingularVectors() {
    if (!Matrix.Matrix.isMatrix(this.U)) {
      this.U = new Matrix.Matrix(this.U);
    }

    return this.U;
  },

  get rightSingularVectors() {
    if (!Matrix.Matrix.isMatrix(this.V)) {
      this.V = new Matrix.Matrix(this.V);
    }

    return this.V;
  },

  get diagonalMatrix() {
    return Matrix.Matrix.diag(this.s);
  },

  solve: function solve(value) {
    var Y = value,
        e = this.threshold,
        scols = this.s.length,
        Ls = Matrix.Matrix.zeros(scols, scols),
        i;

    for (i = 0; i < scols; i++) {
      if (Math.abs(this.s[i]) <= e) {
        Ls[i][i] = 0;
      } else {
        Ls[i][i] = 1 / this.s[i];
      }
    }

    var U = this.U;
    var V = this.rightSingularVectors;
    var VL = V.mmul(Ls),
        vrows = V.rows,
        urows = U.length,
        VLU = Matrix.Matrix.zeros(vrows, urows),
        j,
        k,
        sum;

    for (i = 0; i < vrows; i++) {
      for (j = 0; j < urows; j++) {
        sum = 0;

        for (k = 0; k < scols; k++) {
          sum += VL[i][k] * U[j][k];
        }

        VLU[i][j] = sum;
      }
    }

    return VLU.mmul(Y);
  },
  solveForDiagonal: function solveForDiagonal(value) {
    return this.solve(Matrix.Matrix.diag(value));
  },
  inverse: function inverse() {
    var V = this.V;
    var e = this.threshold,
        vrows = V.length,
        vcols = V[0].length,
        X = new Matrix.Matrix(vrows, this.s.length),
        i,
        j;

    for (i = 0; i < vrows; i++) {
      for (j = 0; j < vcols; j++) {
        if (Math.abs(this.s[j]) > e) {
          X[i][j] = V[i][j] / this.s[j];
        } else {
          X[i][j] = 0;
        }
      }
    }

    var U = this.U;
    var urows = U.length,
        ucols = U[0].length,
        Y = new Matrix.Matrix(vrows, urows),
        k,
        sum;

    for (i = 0; i < vrows; i++) {
      for (j = 0; j < urows; j++) {
        sum = 0;

        for (k = 0; k < ucols; k++) {
          sum += X[i][k] * U[j][k];
        }

        Y[i][j] = sum;
      }
    }

    return Y;
  }
};
module.exports = SingularValueDecomposition;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by acastillo on 8/24/15.
 */

/**
 * Non in-place function definitions, compatible with mathjs code *
 */


var Matrix = __webpack_require__(2);

function matrix(A, B) {
  return new Matrix(A, B);
}

function ones(rows, cols) {
  return Matrix.ones(rows, cols);
}

function eye(rows, cols) {
  return Matrix.eye(rows, cols);
}

function zeros(rows, cols) {
  return Matrix.zeros(rows, cols);
}

function random(rows, cols) {
  return Matrix.rand(rows, cols);
}

function transpose(A) {
  if (typeof A == 'number') return A;
  var result = A.clone();
  return result.transpose();
}

function add(A, B) {
  if (typeof A == 'number' && typeof B === 'number') return A + B;
  if (typeof A == 'number') return this.add(B, A);
  var result = A.clone();
  return result.add(B);
}

function subtract(A, B) {
  if (typeof A == 'number' && typeof B === 'number') return A - B;
  if (typeof A == 'number') return this.subtract(B, A);
  var result = A.clone();
  return result.sub(B);
}

function multiply(A, B) {
  if (typeof A == 'number' && typeof B === 'number') return A * B;
  if (typeof A == 'number') return this.multiply(B, A);
  var result = A.clone();
  if (typeof B === 'number') result.mul(B);else result = result.mmul(B);
  if (result.rows == 1 && result.columns == 1) return result[0][0];else return result;
}

function dotMultiply(A, B) {
  var result = A.clone();
  return result.mul(B);
}

function dotDivide(A, B) {
  var result = A.clone();
  return result.div(B);
}

function diag(A) {
  var diag = null;
  var rows = A.rows,
      cols = A.columns,
      j,
      r; //It is an array

  if (typeof cols === "undefined" && typeof A == 'object') {
    if (A[0] && A[0].length) {
      rows = A.length;
      cols = A[0].length;
      r = Math.min(rows, cols);
      diag = Matrix.zeros(cols, cols);

      for (j = 0; j < cols; j++) {
        diag[j][j] = A[j][j];
      }
    } else {
      cols = A.length;
      diag = Matrix.zeros(cols, cols);

      for (j = 0; j < cols; j++) {
        diag[j][j] = A[j];
      }
    }
  }

  if (rows == 1) {
    diag = Matrix.zeros(cols, cols);

    for (j = 0; j < cols; j++) {
      diag[j][j] = A[0][j];
    }
  } else {
    if (rows > 0 && cols > 0) {
      r = Math.min(rows, cols);
      diag = new Array(r);

      for (j = 0; j < r; j++) {
        diag[j] = A[j][j];
      }
    }
  }

  return diag;
}

function min(A, B) {
  if (typeof A === 'number' && typeof B === 'number') return Math.min(A, B);
  var ii = A.rows,
      jj = A.columns;
  var result = new Matrix(ii, jj);

  for (var i = 0; i < ii; i++) {
    for (var j = 0; j < jj; j++) {
      if (A[i][j] < B[i][j]) {
        result[i][j] = A[i][j];
      } else {
        result[i][j] = B[i][j];
      }
    }
  }

  return result;
}

function max(A, B) {
  if (typeof A === 'number' && typeof B === 'number') return Math.max(A, B);
  var ii = A.rows,
      jj = A.columns;
  var result = new Matrix(ii, jj);

  for (var i = 0; i < ii; i++) {
    for (var j = 0; j < jj; j++) {
      if (A[i][j] > B[i][j]) {
        result[i][j] = A[i][j];
      } else {
        result[i][j] = B[i][j];
      }
    }
  }

  return result;
}

function sqrt(A) {
  if (typeof A === 'number') return Math.sqrt(A);
  var ii = A.rows,
      jj = A.columns;
  var result = new Matrix(ii, jj);

  for (var i = 0; i < ii; i++) {
    for (var j = 0; j < jj; j++) {
      result[i][j] = Math.sqrt(A[i][j]);
    }
  }

  return result;
}

function abs(A) {
  if (typeof A === 'number') return Math.abs(A);
  var ii = A.rows,
      jj = A.columns;
  var result = new Matrix(ii, jj);

  for (var i = 0; i < ii; i++) {
    for (var j = 0; j < jj; j++) {
      result[i][j] = Math.abs(A[i][j]);
    }
  }

  return result;
}

function exp(A) {
  if (typeof A === 'number') return Math.sqrt(A);
  var ii = A.rows,
      jj = A.columns;
  var result = new Matrix(ii, jj);

  for (var i = 0; i < ii; i++) {
    for (var j = 0; j < jj; j++) {
      result[i][j] = Math.exp(A[i][j]);
    }
  }

  return result;
}

function dotPow(A, b) {
  if (typeof A === 'number') return Math.pow(A, b); //console.log(A);

  var ii = A.rows,
      jj = A.columns;
  var result = new Matrix(ii, jj);

  for (var i = 0; i < ii; i++) {
    for (var j = 0; j < jj; j++) {
      result[i][j] = Math.pow(A[i][j], b);
    }
  }

  return result;
}

function solve(A, B) {
  return A.solve(B);
}

function inv(A) {
  if (typeof A === "number") return 1 / A;
  return A.inverse();
}

module.exports = {
  transpose: transpose,
  add: add,
  subtract: subtract,
  multiply: multiply,
  dotMultiply: dotMultiply,
  dotDivide: dotDivide,
  diag: diag,
  min: min,
  max: max,
  solve: solve,
  inv: inv,
  sqrt: sqrt,
  exp: exp,
  dotPow: dotPow,
  abs: abs,
  matrix: matrix,
  ones: ones,
  zeros: zeros,
  random: random,
  eye: eye
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports.gsd = __webpack_require__(13);
module.exports.post = {
  optimizePeaks: __webpack_require__(17),
  joinBroadPeaks: __webpack_require__(36),
  broadenPeaks: __webpack_require__(37)
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const SG = __webpack_require__(14);

const defaultOptions = {
  sgOptions: {
    windowSize: 9,
    polynomial: 3
  },
  minMaxRatio: 0.00025,
  broadRatio: 0.0,
  maxCriteria: true,
  smoothY: true,
  realTopDetection: false,
  heightFactor: 0,
  boundaries: false,
  derivativeThreshold: -1
};
/**
 * Global spectra deconvolution
 * @param {Array<number>} x - Independent variable
 * @param {Array<number>} yIn - Dependent variable
 * @param {object} [options] - Options object
 * @param {object} [options.sgOptions] - Options object for Savitzky-Golay filter. See https://github.com/mljs/savitzky-golay-generalized#options
 * @param {number} [options.sgOptions.windowSize = 9] - points to use in the approximations
 * @param {number} [options.sgOptions.polynomial = 3] - degree of the polynomial to use in the approximations
 * @param {number} [options.minMaxRatio = 0.00025] - Threshold to determine if a given peak should be considered as a noise
 * @param {number} [options.broadRatio = 0.00] - If `broadRatio` is higher than 0, then all the peaks which second derivative
 * smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.
 * @param {number} [options.noiseLevel = 0] - Noise threshold in spectrum units
 * @param {boolean} [options.maxCriteria = true] - Peaks are local maximum(true) or minimum(false)
 * @param {boolean} [options.smoothY = true] - Select the peak intensities from a smoothed version of the independent variables
 * @param {boolean} [options.realTopDetection = false] - Use a quadratic optimizations with the peak and its 3 closest neighbors
 * to determine the true x,y values of the peak?
 * @param {number} [options.heightFactor = 0] - Factor to multiply the calculated height (usually 2)
 * @param {boolean} [options.boundaries = false] - Return also the inflection points of the peaks
 * @param {number} [options.derivativeThreshold = -1] - Filters based on the amplitude of the first derivative
 * @return {Array<object>}
 */

function gsd(x, yIn, options) {
  options = Object.assign({}, defaultOptions, options);
  let sgOptions = options.sgOptions;
  const y = yIn.slice();
  let maxDx = 0;
  let minDx = Number.MAX_VALUE;

  if (!('noiseLevel' in options)) {
    // We have to know if x is equally spaced
    let tmp;

    for (let i = 0; i < x.length - 1; ++i) {
      tmp = Math.abs(x[i + 1] - x[i]);

      if (tmp < minDx) {
        minDx = tmp;
      }

      if (tmp > maxDx) {
        maxDx = tmp;
      }
    }

    if ((maxDx - minDx) / maxDx < 0.05) {
      options.noiseLevel = getNoiseLevel(y);
    } else {
      options.noiseLevel = 0;
    }
  }

  const yCorrection = {
    m: 1,
    b: options.noiseLevel
  };

  if (!options.maxCriteria) {
    yCorrection.m = -1;
    yCorrection.b *= -1;
  }

  for (let i = 0; i < y.length; i++) {
    y[i] = yCorrection.m * y[i] - yCorrection.b;
  }

  for (let i = 0; i < y.length; i++) {
    if (y[i] < 0) {
      y[i] = 0;
    }
  } // If the max difference between delta x is less than 5%, then, we can assume it to be equally spaced variable


  let Y = y;
  let dY, ddY;

  if ((maxDx - minDx) / maxDx < 0.05) {
    if (options.smoothY) {
      Y = SG(y, x[1] - x[0], {
        windowSize: sgOptions.windowSize,
        polynomial: sgOptions.polynomial,
        derivative: 0
      });
    }

    dY = SG(y, x[1] - x[0], {
      windowSize: sgOptions.windowSize,
      polynomial: sgOptions.polynomial,
      derivative: 1
    });
    ddY = SG(y, x[1] - x[0], {
      windowSize: sgOptions.windowSize,
      polynomial: sgOptions.polynomial,
      derivative: 2
    });
  } else {
    if (options.smoothY) {
      Y = SG(y, x, {
        windowSize: sgOptions.windowSize,
        polynomial: sgOptions.polynomial,
        derivative: 0
      });
    }

    dY = SG(y, x, {
      windowSize: sgOptions.windowSize,
      polynomial: sgOptions.polynomial,
      derivative: 1
    });
    ddY = SG(y, x, {
      windowSize: sgOptions.windowSize,
      polynomial: sgOptions.polynomial,
      derivative: 2
    });
  }

  const X = x;
  const dx = x[1] - x[0];
  let maxDdy = 0;
  let maxY = 0;

  for (let i = 0; i < Y.length; i++) {
    if (Math.abs(ddY[i]) > maxDdy) {
      maxDdy = Math.abs(ddY[i]);
    }

    if (Math.abs(Y[i]) > maxY) {
      maxY = Math.abs(Y[i]);
    }
  }

  let lastMax = null;
  let lastMin = null;
  let minddY = new Array(Y.length - 2);
  let intervalL = new Array(Y.length);
  let intervalR = new Array(Y.length);
  let broadMask = new Array(Y.length - 2);
  let minddYLen = 0;
  let intervalLLen = 0;
  let intervalRLen = 0;
  let broadMaskLen = 0; // By the intermediate value theorem We cannot find 2 consecutive maximum or minimum

  for (let i = 1; i < Y.length - 1; ++i) {
    // filter based on derivativeThreshold
    if (Math.abs(dY[i]) > options.derivativeThreshold) {
      // Minimum in first derivative
      if (dY[i] < dY[i - 1] && dY[i] <= dY[i + 1] || dY[i] <= dY[i - 1] && dY[i] < dY[i + 1]) {
        lastMin = {
          x: X[i],
          index: i
        };

        if (dx > 0 && lastMax !== null) {
          intervalL[intervalLLen++] = lastMax;
          intervalR[intervalRLen++] = lastMin;
        }
      } // Maximum in first derivative


      if (dY[i] >= dY[i - 1] && dY[i] > dY[i + 1] || dY[i] > dY[i - 1] && dY[i] >= dY[i + 1]) {
        lastMax = {
          x: X[i],
          index: i
        };

        if (dx < 0 && lastMin !== null) {
          intervalL[intervalLLen++] = lastMax;
          intervalR[intervalRLen++] = lastMin;
        }
      }
    } // Minimum in second derivative


    if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
      // TODO should we change this to have 3 arrays ? Huge overhead creating arrays
      minddY[minddYLen++] = i; // ( [X[i], Y[i], i] );

      broadMask[broadMaskLen++] = Math.abs(ddY[i]) <= options.broadRatio * maxDdy;
    }
  }

  minddY.length = minddYLen;
  intervalL.length = intervalLLen;
  intervalR.length = intervalRLen;
  broadMask.length = broadMaskLen;
  let signals = new Array(minddY.length);
  let signalsLen = 0;
  let lastK = -1;
  let possible, frequency, distanceJ, minDistance, gettingCloser;

  for (let j = 0; j < minddY.length; ++j) {
    frequency = X[minddY[j]];
    possible = -1;
    let k = lastK + 1;
    minDistance = Number.MAX_VALUE;
    distanceJ = 0;
    gettingCloser = true;

    while (possible === -1 && k < intervalL.length && gettingCloser) {
      distanceJ = Math.abs(frequency - (intervalL[k].x + intervalR[k].x) / 2); // Still getting closer?

      if (distanceJ < minDistance) {
        minDistance = distanceJ;
      } else {
        gettingCloser = false;
      }

      if (distanceJ < Math.abs(intervalL[k].x - intervalR[k].x) / 2) {
        possible = k;
        lastK = k;
      }

      ++k;
    }

    if (possible !== -1) {
      if (Math.abs(Y[minddY[j]]) > options.minMaxRatio * maxY) {
        signals[signalsLen++] = {
          index: minddY[j],
          x: frequency,
          y: (Y[minddY[j]] + yCorrection.b) / yCorrection.m,
          width: Math.abs(intervalR[possible].x - intervalL[possible].x),
          // widthCorrection
          soft: broadMask[j]
        };

        if (options.boundaries) {
          signals[signalsLen - 1].left = intervalL[possible];
          signals[signalsLen - 1].right = intervalR[possible];
        }

        if (options.heightFactor) {
          let yLeft = Y[intervalL[possible].index];
          let yRight = Y[intervalR[possible].index];
          signals[signalsLen - 1].height = options.heightFactor * (signals[signalsLen - 1].y - (yLeft + yRight) / 2);
        }
      }
    }
  }

  signals.length = signalsLen;

  if (options.realTopDetection) {
    realTopDetection(signals, X, Y);
  } // Correct the values to fit the original spectra data


  for (let j = 0; j < signals.length; j++) {
    signals[j].base = options.noiseLevel;
  }

  signals.sort(function (a, b) {
    return a.x - b.x;
  });
  return signals;
}

function getNoiseLevel(y) {
  let mean = 0;
  let stddev = 0;
  let length = y.length;

  for (let i = 0; i < length; ++i) {
    mean += y[i];
  }

  mean /= length;
  let averageDeviations = new Array(length);

  for (let i = 0; i < length; ++i) {
    averageDeviations[i] = Math.abs(y[i] - mean);
  }

  averageDeviations.sort((a, b) => a - b);

  if (length % 2 === 1) {
    stddev = averageDeviations[(length - 1) / 2] / 0.6745;
  } else {
    stddev = 0.5 * (averageDeviations[length / 2] + averageDeviations[length / 2 - 1]) / 0.6745;
  }

  return stddev;
}

function realTopDetection(peakList, x, y) {
  let alpha, beta, gamma, p, currentPoint;

  for (let j = 0; j < peakList.length; j++) {
    currentPoint = peakList[j].index; // peakList[j][2];
    // The detected peak could be moved 1 or 2 units to left or right.

    if (y[currentPoint - 1] >= y[currentPoint - 2] && y[currentPoint - 1] >= y[currentPoint]) {
      currentPoint--;
    } else {
      if (y[currentPoint + 1] >= y[currentPoint] && y[currentPoint + 1] >= y[currentPoint + 2]) {
        currentPoint++;
      } else {
        if (y[currentPoint - 2] >= y[currentPoint - 3] && y[currentPoint - 2] >= y[currentPoint - 1]) {
          currentPoint -= 2;
        } else {
          if (y[currentPoint + 2] >= y[currentPoint + 1] && y[currentPoint + 2] >= y[currentPoint + 3]) {
            currentPoint += 2;
          }
        }
      }
    } // interpolation to a sin() function


    if (y[currentPoint - 1] > 0 && y[currentPoint + 1] > 0 && y[currentPoint] >= y[currentPoint - 1] && y[currentPoint] >= y[currentPoint + 1] && (y[currentPoint] !== y[currentPoint - 1] || y[currentPoint] !== y[currentPoint + 1])) {
      alpha = 20 * Math.log10(y[currentPoint - 1]);
      beta = 20 * Math.log10(y[currentPoint]);
      gamma = 20 * Math.log10(y[currentPoint + 1]);
      p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma); // console.log(alpha, beta, gamma, `p: ${p}`);
      // console.log(x[currentPoint]+" "+tmp+" "+currentPoint);

      peakList[j].x = x[currentPoint] + (x[currentPoint] - x[currentPoint - 1]) * p;
      peakList[j].y = y[currentPoint] - 0.25 * (y[currentPoint - 1] - y[currentPoint + 1]) * p;
    }
  }
}

module.exports = gsd;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

//Code translate from Pascal source in http://pubs.acs.org/doi/pdf/10.1021/ac00205a007
var extend = __webpack_require__(15);

var stat = __webpack_require__(4);

var defaultOptions = {
  windowSize: 9,
  derivative: 0,
  polynomial: 3
};

function SavitzkyGolay(data, h, options) {
  options = extend({}, defaultOptions, options);
  if (options.windowSize % 2 === 0 || options.windowSize < 5 || !Number.isInteger(options.windowSize)) throw new RangeError('Invalid window size (should be odd and at least 5 integer number)');
  if (options.windowSize > data.length) throw new RangeError('Window size is higher than the data length ' + options.windowSize + ">" + data.length);
  if (options.derivative < 0 || !Number.isInteger(options.derivative)) throw new RangeError('Derivative should be a positive integer');
  if (options.polynomial < 1 || !Number.isInteger(options.polynomial)) throw new RangeError('Polynomial should be a positive integer');
  if (options.polynomial >= 6) console.warn('You should not use polynomial grade higher than 5 if you are' + ' not sure that your data arises from such a model. Possible polynomial oscillation problems');
  var windowSize = options.windowSize;
  var half = Math.floor(windowSize / 2);
  var np = data.length;
  var ans = new Array(np);
  var weights = fullWeights(windowSize, options.polynomial, options.derivative);
  var hs = 0;
  var constantH = true;

  if (Object.prototype.toString.call(h) === '[object Array]') {
    constantH = false;
  } else {
    hs = Math.pow(h, options.derivative);
  } //console.log("Constant h: "+constantH);
  //For the borders


  for (var i = 0; i < half; i++) {
    var wg1 = weights[half - i - 1];
    var wg2 = weights[half + i + 1];
    var d1 = 0,
        d2 = 0;

    for (var l = 0; l < windowSize; l++) {
      d1 += wg1[l] * data[l];
      d2 += wg2[l] * data[np - windowSize + l - 1];
    }

    if (constantH) {
      ans[half - i - 1] = d1 / hs;
      ans[np - half + i] = d2 / hs;
    } else {
      hs = getHs(h, half - i - 1, half, options.derivative);
      ans[half - i - 1] = d1 / hs;
      hs = getHs(h, np - half + i, half, options.derivative);
      ans[np - half + i] = d2 / hs;
    }
  } //For the internal points


  var wg = weights[half];

  for (var i = windowSize; i < np + 1; i++) {
    var d = 0;

    for (var l = 0; l < windowSize; l++) d += wg[l] * data[l + i - windowSize];

    if (!constantH) hs = getHs(h, i - half - 1, half, options.derivative);
    ans[i - half - 1] = d / hs;
  }

  return ans;
}

function getHs(h, center, half, derivative) {
  var hs = 0;
  var count = 0;

  for (var i = center - half; i < center + half; i++) {
    if (i >= 0 && i < h.length - 1) {
      hs += h[i + 1] - h[i];
      count++;
    }
  }

  return Math.pow(hs / count, derivative);
}

function GramPoly(i, m, k, s) {
  var Grampoly = 0;

  if (k > 0) {
    Grampoly = (4 * k - 2) / (k * (2 * m - k + 1)) * (i * GramPoly(i, m, k - 1, s) + s * GramPoly(i, m, k - 1, s - 1)) - (k - 1) * (2 * m + k) / (k * (2 * m - k + 1)) * GramPoly(i, m, k - 2, s);
  } else {
    if (k == 0 && s == 0) {
      Grampoly = 1;
    } else {
      Grampoly = 0;
    }
  } //console.log(Grampoly);


  return Grampoly;
}

function GenFact(a, b) {
  var gf = 1;

  if (a >= b) {
    for (var j = a - b + 1; j <= a; j++) {
      gf *= j;
    }
  }

  return gf;
}

function Weight(i, t, m, n, s) {
  var sum = 0;

  for (var k = 0; k <= n; k++) {
    //console.log(k);
    sum += (2 * k + 1) * (GenFact(2 * m, k) / GenFact(2 * m + k + 1, k + 1)) * GramPoly(i, m, k, 0) * GramPoly(t, m, k, s);
  }

  return sum;
}
/**
 *
 * @param m  Number of points
 * @param n  Polynomial grade
 * @param s  Derivative
 */


function fullWeights(m, n, s) {
  var weights = new Array(m);
  var np = Math.floor(m / 2);

  for (var t = -np; t <= np; t++) {
    weights[t + np] = new Array(m);

    for (var j = -np; j <= np; j++) {
      weights[t + np][j + np] = Weight(j, t, np, n, s);
    }
  }

  return weights;
}
/*function entropy(data,h,options){
    var trend = SavitzkyGolay(data,h,trendOptions);
    var copy = new Array(data.length);
    var sum = 0;
    var max = 0;
    for(var i=0;i<data.length;i++){
        copy[i] = data[i]-trend[i];
    }

    sum/=data.length;
    console.log(sum+" "+max);
    console.log(stat.array.standardDeviation(copy));
    console.log(Math.abs(stat.array.mean(copy))/stat.array.standardDeviation(copy));
    return sum;

}



function guessWindowSize(data, h){
    console.log("entropy "+entropy(data,h,trendOptions));
    return 5;
}
*/


module.exports = SavitzkyGolay;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }

  return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf'); // Not own constructor property must be Object

  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  } // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.


  var key;

  for (key in obj) {
    /**/
  }

  return typeof key === 'undefined' || hasOwn.call(obj, key);
}; // If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target


var setProperty = function setProperty(target, options) {
  if (defineProperty && options.name === '__proto__') {
    defineProperty(target, options.name, {
      enumerable: true,
      configurable: true,
      value: options.newValue,
      writable: true
    });
  } else {
    target[options.name] = options.newValue;
  }
}; // Return undefined instead of __proto__ if '__proto__' is not an own property


var getProperty = function getProperty(obj, name) {
  if (name === '__proto__') {
    if (!hasOwn.call(obj, name)) {
      return void 0;
    } else if (gOPD) {
      // In early versions of node, obj['__proto__'] is buggy when obj has
      // __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
      return gOPD(obj, name).value;
    }
  }

  return obj[name];
};

module.exports = function extend() {
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0];
  var i = 1;
  var length = arguments.length;
  var deep = false; // Handle a deep copy situation

  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {}; // skip the boolean and the target

    i = 2;
  }

  if (target == null || typeof target !== 'object' && typeof target !== 'function') {
    target = {};
  }

  for (; i < length; ++i) {
    options = arguments[i]; // Only deal with non-null/undefined values

    if (options != null) {
      // Extend the base object
      for (name in options) {
        src = getProperty(target, name);
        copy = getProperty(options, name); // Prevent never-ending loop

        if (target !== copy) {
          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            } // Never move original objects, clone them


            setProperty(target, {
              name: name,
              newValue: extend(deep, clone, copy)
            }); // Don't bring in undefined values
          } else if (typeof copy !== 'undefined') {
            setProperty(target, {
              name: name,
              newValue: copy
            });
          }
        }
      }
    }
  } // Return the modified object


  return target;
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var arrayStat = __webpack_require__(6);

function compareNumbers(a, b) {
  return a - b;
}

exports.max = function max(matrix) {
  var max = -Infinity;

  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] > max) max = matrix[i][j];
    }
  }

  return max;
};

exports.min = function min(matrix) {
  var min = Infinity;

  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] < min) min = matrix[i][j];
    }
  }

  return min;
};

exports.minMax = function minMax(matrix) {
  var min = Infinity;
  var max = -Infinity;

  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] < min) min = matrix[i][j];
      if (matrix[i][j] > max) max = matrix[i][j];
    }
  }

  return {
    min: min,
    max: max
  };
};

exports.entropy = function entropy(matrix, eps) {
  if (typeof eps === 'undefined') {
    eps = 0;
  }

  var sum = 0,
      l1 = matrix.length,
      l2 = matrix[0].length;

  for (var i = 0; i < l1; i++) {
    for (var j = 0; j < l2; j++) {
      sum += matrix[i][j] * Math.log(matrix[i][j] + eps);
    }
  }

  return -sum;
};

exports.mean = function mean(matrix, dimension) {
  if (typeof dimension === 'undefined') {
    dimension = 0;
  }

  var rows = matrix.length,
      cols = matrix[0].length,
      theMean,
      N,
      i,
      j;

  if (dimension === -1) {
    theMean = [0];
    N = rows * cols;

    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        theMean[0] += matrix[i][j];
      }
    }

    theMean[0] /= N;
  } else if (dimension === 0) {
    theMean = new Array(cols);
    N = rows;

    for (j = 0; j < cols; j++) {
      theMean[j] = 0;

      for (i = 0; i < rows; i++) {
        theMean[j] += matrix[i][j];
      }

      theMean[j] /= N;
    }
  } else if (dimension === 1) {
    theMean = new Array(rows);
    N = cols;

    for (j = 0; j < rows; j++) {
      theMean[j] = 0;

      for (i = 0; i < cols; i++) {
        theMean[j] += matrix[j][i];
      }

      theMean[j] /= N;
    }
  } else {
    throw new Error('Invalid dimension');
  }

  return theMean;
};

exports.sum = function sum(matrix, dimension) {
  if (typeof dimension === 'undefined') {
    dimension = 0;
  }

  var rows = matrix.length,
      cols = matrix[0].length,
      theSum,
      i,
      j;

  if (dimension === -1) {
    theSum = [0];

    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        theSum[0] += matrix[i][j];
      }
    }
  } else if (dimension === 0) {
    theSum = new Array(cols);

    for (j = 0; j < cols; j++) {
      theSum[j] = 0;

      for (i = 0; i < rows; i++) {
        theSum[j] += matrix[i][j];
      }
    }
  } else if (dimension === 1) {
    theSum = new Array(rows);

    for (j = 0; j < rows; j++) {
      theSum[j] = 0;

      for (i = 0; i < cols; i++) {
        theSum[j] += matrix[j][i];
      }
    }
  } else {
    throw new Error('Invalid dimension');
  }

  return theSum;
};

exports.product = function product(matrix, dimension) {
  if (typeof dimension === 'undefined') {
    dimension = 0;
  }

  var rows = matrix.length,
      cols = matrix[0].length,
      theProduct,
      i,
      j;

  if (dimension === -1) {
    theProduct = [1];

    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        theProduct[0] *= matrix[i][j];
      }
    }
  } else if (dimension === 0) {
    theProduct = new Array(cols);

    for (j = 0; j < cols; j++) {
      theProduct[j] = 1;

      for (i = 0; i < rows; i++) {
        theProduct[j] *= matrix[i][j];
      }
    }
  } else if (dimension === 1) {
    theProduct = new Array(rows);

    for (j = 0; j < rows; j++) {
      theProduct[j] = 1;

      for (i = 0; i < cols; i++) {
        theProduct[j] *= matrix[j][i];
      }
    }
  } else {
    throw new Error('Invalid dimension');
  }

  return theProduct;
};

exports.standardDeviation = function standardDeviation(matrix, means, unbiased) {
  var vari = exports.variance(matrix, means, unbiased),
      l = vari.length;

  for (var i = 0; i < l; i++) {
    vari[i] = Math.sqrt(vari[i]);
  }

  return vari;
};

exports.variance = function variance(matrix, means, unbiased) {
  if (typeof unbiased === 'undefined') {
    unbiased = true;
  }

  means = means || exports.mean(matrix);
  var rows = matrix.length;
  if (rows === 0) return [];
  var cols = matrix[0].length;
  var vari = new Array(cols);

  for (var j = 0; j < cols; j++) {
    var sum1 = 0,
        sum2 = 0,
        x = 0;

    for (var i = 0; i < rows; i++) {
      x = matrix[i][j] - means[j];
      sum1 += x;
      sum2 += x * x;
    }

    if (unbiased) {
      vari[j] = (sum2 - sum1 * sum1 / rows) / (rows - 1);
    } else {
      vari[j] = (sum2 - sum1 * sum1 / rows) / rows;
    }
  }

  return vari;
};

exports.median = function median(matrix) {
  var rows = matrix.length,
      cols = matrix[0].length;
  var medians = new Array(cols);

  for (var i = 0; i < cols; i++) {
    var data = new Array(rows);

    for (var j = 0; j < rows; j++) {
      data[j] = matrix[j][i];
    }

    data.sort(compareNumbers);
    var N = data.length;

    if (N % 2 === 0) {
      medians[i] = (data[N / 2] + data[N / 2 - 1]) * 0.5;
    } else {
      medians[i] = data[Math.floor(N / 2)];
    }
  }

  return medians;
};

exports.mode = function mode(matrix) {
  var rows = matrix.length,
      cols = matrix[0].length,
      modes = new Array(cols),
      i,
      j;

  for (i = 0; i < cols; i++) {
    var itemCount = new Array(rows);

    for (var k = 0; k < rows; k++) {
      itemCount[k] = 0;
    }

    var itemArray = new Array(rows);
    var count = 0;

    for (j = 0; j < rows; j++) {
      var index = itemArray.indexOf(matrix[j][i]);

      if (index >= 0) {
        itemCount[index]++;
      } else {
        itemArray[count] = matrix[j][i];
        itemCount[count] = 1;
        count++;
      }
    }

    var maxValue = 0,
        maxIndex = 0;

    for (j = 0; j < count; j++) {
      if (itemCount[j] > maxValue) {
        maxValue = itemCount[j];
        maxIndex = j;
      }
    }

    modes[i] = itemArray[maxIndex];
  }

  return modes;
};

exports.skewness = function skewness(matrix, unbiased) {
  if (typeof unbiased === 'undefined') unbiased = true;
  var means = exports.mean(matrix);
  var n = matrix.length,
      l = means.length;
  var skew = new Array(l);

  for (var j = 0; j < l; j++) {
    var s2 = 0,
        s3 = 0;

    for (var i = 0; i < n; i++) {
      var dev = matrix[i][j] - means[j];
      s2 += dev * dev;
      s3 += dev * dev * dev;
    }

    var m2 = s2 / n;
    var m3 = s3 / n;
    var g = m3 / Math.pow(m2, 3 / 2);

    if (unbiased) {
      var a = Math.sqrt(n * (n - 1));
      var b = n - 2;
      skew[j] = a / b * g;
    } else {
      skew[j] = g;
    }
  }

  return skew;
};

exports.kurtosis = function kurtosis(matrix, unbiased) {
  if (typeof unbiased === 'undefined') unbiased = true;
  var means = exports.mean(matrix);
  var n = matrix.length,
      m = matrix[0].length;
  var kurt = new Array(m);

  for (var j = 0; j < m; j++) {
    var s2 = 0,
        s4 = 0;

    for (var i = 0; i < n; i++) {
      var dev = matrix[i][j] - means[j];
      s2 += dev * dev;
      s4 += dev * dev * dev * dev;
    }

    var m2 = s2 / n;
    var m4 = s4 / n;

    if (unbiased) {
      var v = s2 / (n - 1);
      var a = n * (n + 1) / ((n - 1) * (n - 2) * (n - 3));
      var b = s4 / (v * v);
      var c = (n - 1) * (n - 1) / ((n - 2) * (n - 3));
      kurt[j] = a * b - 3 * c;
    } else {
      kurt[j] = m4 / (m2 * m2) - 3;
    }
  }

  return kurt;
};

exports.standardError = function standardError(matrix) {
  var samples = matrix.length;
  var standardDeviations = exports.standardDeviation(matrix);
  var l = standardDeviations.length;
  var standardErrors = new Array(l);
  var sqrtN = Math.sqrt(samples);

  for (var i = 0; i < l; i++) {
    standardErrors[i] = standardDeviations[i] / sqrtN;
  }

  return standardErrors;
};

exports.covariance = function covariance(matrix, dimension) {
  return exports.scatter(matrix, undefined, dimension);
};

exports.scatter = function scatter(matrix, divisor, dimension) {
  if (typeof dimension === 'undefined') {
    dimension = 0;
  }

  if (typeof divisor === 'undefined') {
    if (dimension === 0) {
      divisor = matrix.length - 1;
    } else if (dimension === 1) {
      divisor = matrix[0].length - 1;
    }
  }

  var means = exports.mean(matrix, dimension);
  var rows = matrix.length;

  if (rows === 0) {
    return [[]];
  }

  var cols = matrix[0].length,
      cov,
      i,
      j,
      s,
      k;

  if (dimension === 0) {
    cov = new Array(cols);

    for (i = 0; i < cols; i++) {
      cov[i] = new Array(cols);
    }

    for (i = 0; i < cols; i++) {
      for (j = i; j < cols; j++) {
        s = 0;

        for (k = 0; k < rows; k++) {
          s += (matrix[k][j] - means[j]) * (matrix[k][i] - means[i]);
        }

        s /= divisor;
        cov[i][j] = s;
        cov[j][i] = s;
      }
    }
  } else if (dimension === 1) {
    cov = new Array(rows);

    for (i = 0; i < rows; i++) {
      cov[i] = new Array(rows);
    }

    for (i = 0; i < rows; i++) {
      for (j = i; j < rows; j++) {
        s = 0;

        for (k = 0; k < cols; k++) {
          s += (matrix[j][k] - means[j]) * (matrix[i][k] - means[i]);
        }

        s /= divisor;
        cov[i][j] = s;
        cov[j][i] = s;
      }
    }
  } else {
    throw new Error('Invalid dimension');
  }

  return cov;
};

exports.correlation = function correlation(matrix) {
  var means = exports.mean(matrix),
      standardDeviations = exports.standardDeviation(matrix, true, means),
      scores = exports.zScores(matrix, means, standardDeviations),
      rows = matrix.length,
      cols = matrix[0].length,
      i,
      j;
  var cor = new Array(cols);

  for (i = 0; i < cols; i++) {
    cor[i] = new Array(cols);
  }

  for (i = 0; i < cols; i++) {
    for (j = i; j < cols; j++) {
      var c = 0;

      for (var k = 0, l = scores.length; k < l; k++) {
        c += scores[k][j] * scores[k][i];
      }

      c /= rows - 1;
      cor[i][j] = c;
      cor[j][i] = c;
    }
  }

  return cor;
};

exports.zScores = function zScores(matrix, means, standardDeviations) {
  means = means || exports.mean(matrix);
  if (typeof standardDeviations === 'undefined') standardDeviations = exports.standardDeviation(matrix, true, means);
  return exports.standardize(exports.center(matrix, means, false), standardDeviations, true);
};

exports.center = function center(matrix, means, inPlace) {
  means = means || exports.mean(matrix);
  var result = matrix,
      l = matrix.length,
      i,
      j,
      jj;

  if (!inPlace) {
    result = new Array(l);

    for (i = 0; i < l; i++) {
      result[i] = new Array(matrix[i].length);
    }
  }

  for (i = 0; i < l; i++) {
    var row = result[i];

    for (j = 0, jj = row.length; j < jj; j++) {
      row[j] = matrix[i][j] - means[j];
    }
  }

  return result;
};

exports.standardize = function standardize(matrix, standardDeviations, inPlace) {
  if (typeof standardDeviations === 'undefined') standardDeviations = exports.standardDeviation(matrix);
  var result = matrix,
      l = matrix.length,
      i,
      j,
      jj;

  if (!inPlace) {
    result = new Array(l);

    for (i = 0; i < l; i++) {
      result[i] = new Array(matrix[i].length);
    }
  }

  for (i = 0; i < l; i++) {
    var resultRow = result[i];
    var sourceRow = matrix[i];

    for (j = 0, jj = resultRow.length; j < jj; j++) {
      if (standardDeviations[j] !== 0 && !isNaN(standardDeviations[j])) {
        resultRow[j] = sourceRow[j] / standardDeviations[j];
      }
    }
  }

  return result;
};

exports.weightedVariance = function weightedVariance(matrix, weights) {
  var means = exports.mean(matrix);
  var rows = matrix.length;
  if (rows === 0) return [];
  var cols = matrix[0].length;
  var vari = new Array(cols);

  for (var j = 0; j < cols; j++) {
    var sum = 0;
    var a = 0,
        b = 0;

    for (var i = 0; i < rows; i++) {
      var z = matrix[i][j] - means[j];
      var w = weights[i];
      sum += w * (z * z);
      b += w;
      a += w * w;
    }

    vari[j] = sum * (b / (b * b - a));
  }

  return vari;
};

exports.weightedMean = function weightedMean(matrix, weights, dimension) {
  if (typeof dimension === 'undefined') {
    dimension = 0;
  }

  var rows = matrix.length;
  if (rows === 0) return [];
  var cols = matrix[0].length,
      means,
      i,
      ii,
      j,
      w,
      row;

  if (dimension === 0) {
    means = new Array(cols);

    for (i = 0; i < cols; i++) {
      means[i] = 0;
    }

    for (i = 0; i < rows; i++) {
      row = matrix[i];
      w = weights[i];

      for (j = 0; j < cols; j++) {
        means[j] += row[j] * w;
      }
    }
  } else if (dimension === 1) {
    means = new Array(rows);

    for (i = 0; i < rows; i++) {
      means[i] = 0;
    }

    for (j = 0; j < rows; j++) {
      row = matrix[j];
      w = weights[j];

      for (i = 0; i < cols; i++) {
        means[j] += row[i] * w;
      }
    }
  } else {
    throw new Error('Invalid dimension');
  }

  var weightSum = arrayStat.sum(weights);

  if (weightSum !== 0) {
    for (i = 0, ii = means.length; i < ii; i++) {
      means[i] /= weightSum;
    }
  }

  return means;
};

exports.weightedCovariance = function weightedCovariance(matrix, weights, means, dimension) {
  dimension = dimension || 0;
  means = means || exports.weightedMean(matrix, weights, dimension);
  var s1 = 0,
      s2 = 0;

  for (var i = 0, ii = weights.length; i < ii; i++) {
    s1 += weights[i];
    s2 += weights[i] * weights[i];
  }

  var factor = s1 / (s1 * s1 - s2);
  return exports.weightedScatter(matrix, weights, means, factor, dimension);
};

exports.weightedScatter = function weightedScatter(matrix, weights, means, factor, dimension) {
  dimension = dimension || 0;
  means = means || exports.weightedMean(matrix, weights, dimension);

  if (typeof factor === 'undefined') {
    factor = 1;
  }

  var rows = matrix.length;

  if (rows === 0) {
    return [[]];
  }

  var cols = matrix[0].length,
      cov,
      i,
      j,
      k,
      s;

  if (dimension === 0) {
    cov = new Array(cols);

    for (i = 0; i < cols; i++) {
      cov[i] = new Array(cols);
    }

    for (i = 0; i < cols; i++) {
      for (j = i; j < cols; j++) {
        s = 0;

        for (k = 0; k < rows; k++) {
          s += weights[k] * (matrix[k][j] - means[j]) * (matrix[k][i] - means[i]);
        }

        cov[i][j] = s * factor;
        cov[j][i] = s * factor;
      }
    }
  } else if (dimension === 1) {
    cov = new Array(rows);

    for (i = 0; i < rows; i++) {
      cov[i] = new Array(rows);
    }

    for (i = 0; i < rows; i++) {
      for (j = i; j < rows; j++) {
        s = 0;

        for (k = 0; k < cols; k++) {
          s += weights[k] * (matrix[j][k] - means[j]) * (matrix[i][k] - means[i]);
        }

        cov[i][j] = s * factor;
        cov[j][i] = s * factor;
      }
    }
  } else {
    throw new Error('Invalid dimension');
  }

  return cov;
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by acastillo on 9/6/15.
 */


let optimize = __webpack_require__(7);

function sampleFunction(from, to, x, y, lastIndex) {
  let nbPoints = x.length;
  let sampleX = [];
  let sampleY = [];
  let direction = Math.sign(x[1] - x[0]); // Direction of the derivative

  if (direction === -1) {
    lastIndex[0] = x.length - 1;
  }

  let delta = Math.abs(to - from) / 2;
  let mid = (from + to) / 2;
  let stop = false;
  let index = lastIndex[0];

  while (!stop && index < nbPoints && index >= 0) {
    if (Math.abs(x[index] - mid) <= delta) {
      sampleX.push(x[index]);
      sampleY.push(y[index]);
      index += direction;
    } else {
      // It is outside the range.
      if (Math.sign(mid - x[index]) === 1) {
        // We'll reach the mid going in the current direction
        index += direction;
      } else {
        // There is not more peaks in the current range
        stop = true;
      }
    } // console.log(sampleX);

  }

  lastIndex[0] = index;
  return [sampleX, sampleY];
}

module.exports = function optimizePeaks(peakList, x, y, n, fnType) {
  let i;
  let j;
  let lastIndex = [0];
  let groups = groupPeaks(peakList, n);
  let result = [];
  let factor = 1;

  if (fnType === 'gaussian') {
    factor = 1.17741;
  } // From https://en.wikipedia.org/wiki/Gaussian_function#Properties


  let sampling, error, opts;

  for (i = 0; i < groups.length; i++) {
    let peaks = groups[i].group;

    if (peaks.length > 1) {
      // Multiple peaks
      // console.log("Pending group of overlaped peaks "+peaks.length);
      // console.log("here1");
      // console.log(groups[i].limits);
      sampling = sampleFunction(groups[i].limits[0] - groups[i].limits[1], groups[i].limits[0] + groups[i].limits[1], x, y, lastIndex); // console.log(sampling);

      if (sampling[0].length > 5) {
        error = peaks[0].width / 1000;
        opts = [3, 100, error, error, error, error * 10, error * 10, 11, 9, 1]; // var gauss = Opt.optimizeSingleGaussian(sampling[0], sampling[1], opts, peaks);

        let optPeaks = [];

        if (fnType === 'gaussian') {
          optPeaks = optimize.optimizeGaussianSum(sampling, peaks, opts);
        } else {
          if (fnType === 'lorentzian') {
            optPeaks = optimize.optimizeLorentzianSum(sampling, peaks, opts);
          }
        } // console.log(optPeak);


        for (j = 0; j < optPeaks.length; j++) {
          result.push({
            x: optPeaks[j][0][0],
            y: optPeaks[j][1][0],
            width: optPeaks[j][2][0] * factor
          });
        }
      }
    } else {
      // Single peak
      peaks = peaks[0];
      sampling = sampleFunction(peaks.x - n * peaks.width, peaks.x + n * peaks.width, x, y, lastIndex); // console.log("here2");
      // console.log(groups[i].limits);

      if (sampling[0].length > 5) {
        error = peaks.width / 1000;
        opts = [3, 100, error, error, error, error * 10, error * 10, 11, 9, 1]; // var gauss = Opt.optimizeSingleGaussian(sampling[0], sampling[1], opts, peaks);
        // var gauss = Opt.optimizeSingleGaussian([sampling[0],sampling[1]], peaks, opts);

        let optPeak = [];

        if (fnType === 'gaussian') {
          optPeak = optimize.optimizeSingleGaussian([sampling[0], sampling[1]], peaks, opts);
        } else {
          if (fnType === 'lorentzian') {
            optPeak = optimize.optimizeSingleLorentzian([sampling[0], sampling[1]], peaks, opts);
          }
        } // console.log(optPeak);


        result.push({
          x: optPeak[0][0],
          y: optPeak[1][0],
          width: optPeak[2][0] * factor
        }); // From https://en.wikipedia.org/wiki/Gaussian_function#Properties}
      }
    }
  }

  return result;
};

function groupPeaks(peakList, nL) {
  let group = [];
  let groups = [];
  let i, j;
  let limits = [peakList[0].x, nL * peakList[0].width];
  let upperLimit, lowerLimit; // Merge forward

  for (i = 0; i < peakList.length; i++) {
    // If the 2 things overlaps
    if (Math.abs(peakList[i].x - limits[0]) < nL * peakList[i].width + limits[1]) {
      // Add the peak to the group
      group.push(peakList[i]); // Update the group limits

      upperLimit = limits[0] + limits[1];

      if (peakList[i].x + nL * peakList[i].width > upperLimit) {
        upperLimit = peakList[i].x + nL * peakList[i].width;
      }

      lowerLimit = limits[0] - limits[1];

      if (peakList[i].x - nL * peakList[i].width < lowerLimit) {
        lowerLimit = peakList[i].x - nL * peakList[i].width;
      }

      limits = [(upperLimit + lowerLimit) / 2, Math.abs(upperLimit - lowerLimit) / 2];
    } else {
      groups.push({
        limits: limits,
        group: group
      }); // var optmimalPeak = fitSpectrum(group,limits,spectrum);

      group = [peakList[i]];
      limits = [peakList[i].x, nL * peakList[i].width];
    }
  }

  groups.push({
    limits: limits,
    group: group
  }); // Merge backward

  for (i = groups.length - 2; i >= 0; i--) {
    // The groups overlaps
    if (Math.abs(groups[i].limits[0] - groups[i + 1].limits[0]) < (groups[i].limits[1] + groups[i + 1].limits[1]) / 2) {
      for (j = 0; j < groups[i + 1].group.length; j++) {
        groups[i].group.push(groups[i + 1].group[j]);
      }

      upperLimit = groups[i].limits[0] + groups[i].limits[1];

      if (groups[i + 1].limits[0] + groups[i + 1].limits[1] > upperLimit) {
        upperLimit = groups[i + 1].limits[0] + groups[i + 1].limits[1];
      }

      lowerLimit = groups[i].limits[0] - groups[i].limits[1];

      if (groups[i + 1].limits[0] - groups[i + 1].limits[1] < lowerLimit) {
        lowerLimit = groups[i + 1].limits[0] - groups[i + 1].limits[1];
      } // console.log(limits);


      groups[i].limits = [(upperLimit + lowerLimit) / 2, Math.abs(upperLimit - lowerLimit) / 2];
      groups.splice(i + 1, 1);
    }
  }

  return groups;
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(19);
module.exports.Matrix = __webpack_require__(2);
module.exports.Matrix.algebra = __webpack_require__(11);

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Created by acastillo on 8/5/15.
 */
var Matrix = __webpack_require__(2);

var math = __webpack_require__(11);

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
  optimize: function optimize(func, p, t, y_dat, weight, dp, p_min, p_max, c, opts) {
    var tensor_parameter = 0; // set to 1 of parameter is a tensor

    var iteration = 0; // iteration counter
    //func_calls = 0;			// running count of function evaluations

    if (typeof p[0] != "object") {
      for (var i = 0; i < p.length; i++) {
        p[i] = [p[i]];
      }
    } //p = p(:); y_dat = y_dat(:); 		// make column vectors


    var i, k;
    var eps = 2 ^ -52;
    var Npar = p.length; //length(p); 			// number of parameters

    var Npnt = y_dat.length; //length(y_dat);		// number of data points

    var p_old = Matrix.zeros(Npar, 1); // previous set of parameters

    var y_old = Matrix.zeros(Npnt, 1); // previous model, y_old = y_hat(t;p_old)

    var X2 = 1e-2 / eps; // a really big initial Chi-sq value

    var X2_old = 1e-2 / eps; // a really big initial Chi-sq value

    var J = Matrix.zeros(Npnt, Npar);

    if (t.length != y_dat.length) {
      console.log('lm.m error: the length of t must equal the length of y_dat');
      length_t = t.length;
      length_y_dat = y_dat.length;
      var X2 = 0,
          corr = 0,
          sigma_p = 0,
          sigma_y = 0,
          R_sq = 0,
          cvg_hist = 0;

      if (!tensor_parameter) {
        return;
      }
    }

    weight = weight || Math.sqrt((Npnt - Npar + 1) / math.multiply(math.transpose(y_dat), y_dat));
    dp = dp || 0.001;
    p_min = p_min || math.multiply(Math.abs(p), -100);
    p_max = p_max || math.multiply(Math.abs(p), 100);
    c = c || 1; // Algorithmic Paramters
    //prnt MaxIter  eps1  eps2  epx3  eps4  lam0  lamUP lamDN UpdateType

    opts = opts || [3, 10 * Npar, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 1];
    var prnt = opts[0]; // >1 intermediate results; >2 plots

    var MaxIter = opts[1]; // maximum number of iterations

    var epsilon_1 = opts[2]; // convergence tolerance for gradient

    var epsilon_2 = opts[3]; // convergence tolerance for parameter

    var epsilon_3 = opts[4]; // convergence tolerance for Chi-square

    var epsilon_4 = opts[5]; // determines acceptance of a L-M step

    var lambda_0 = opts[6]; // initial value of damping paramter, lambda

    var lambda_UP_fac = opts[7]; // factor for increasing lambda

    var lambda_DN_fac = opts[8]; // factor for decreasing lambda

    var Update_Type = opts[9]; // 1: Levenberg-Marquardt lambda update
    // 2: Quadratic update
    // 3: Nielsen's lambda update equations

    if (tensor_parameter && prnt == 3) prnt = 2;

    if (!dp.length || dp.length == 1) {
      var dp_array = new Array(Npar);

      for (var i = 0; i < Npar; i++) dp_array[i] = [dp];

      dp = dp_array;
    } // indices of the parameters to be fit


    var idx = [];

    for (i = 0; i < dp.length; i++) {
      if (dp[i][0] != 0) {
        idx.push(i);
      }
    }

    var Nfit = idx.length; // number of parameters to fit

    var stop = false; // termination flag

    var weight_sq = null; //console.log(weight);

    if (!weight.length || weight.length < Npnt) {
      // squared weighting vector
      //weight_sq = ( weight(1)*ones(Npnt,1) ).^2;
      //console.log("weight[0] "+typeof weight[0]);
      var tmp = math.multiply(Matrix.ones(Npnt, 1), weight[0]);
      weight_sq = math.dotMultiply(tmp, tmp);
    } else {
      //weight_sq = (weight(:)).^2;
      weight_sq = math.dotMultiply(weight, weight);
    } // initialize Jacobian with finite difference calculation
    //console.log("J "+weight_sq);


    var result = this.lm_matx(func, t, p_old, y_old, 1, J, p, y_dat, weight_sq, dp, c);
    var JtWJ = result.JtWJ,
        JtWdy = result.JtWdy,
        X2 = result.Chi_sq,
        y_hat = result.y_hat,
        J = result.J; //[JtWJ,JtWdy,X2,y_hat,J] = this.lm_matx(func,t,p_old,y_old,1,J,p,y_dat,weight_sq,dp,c);
    //console.log(JtWJ);

    if (Math.max(Math.abs(JtWdy)) < epsilon_1) {
      console.log(' *** Your Initial Guess is Extremely Close to Optimal ***');
      console.log(' *** epsilon_1 = ', epsilon_1);
      stop = true;
    }

    switch (Update_Type) {
      case 1:
        // Marquardt: init'l lambda
        lambda = lambda_0;
        break;

      default:
        // Quadratic and Nielsen
        lambda = lambda_0 * Math.max(math.diag(JtWJ));
        nu = 2;
    } //console.log(X2);


    X2_old = X2; // previous value of X2
    //console.log(MaxIter+" "+Npar);
    //var cvg_hst = Matrix.ones(MaxIter,Npar+3);		// initialize convergence history

    var h = null;

    while (!stop && iteration <= MaxIter) {
      // --- Main Loop
      iteration = iteration + 1; // incremental change in parameters

      switch (Update_Type) {
        case 1:
          // Marquardt
          //h = ( JtWJ + lambda * math.diag(math.diag(JtWJ)) ) \ JtWdy;
          //h = math.multiply(math.inv(JtWdy),math.add(JtWJ,math.multiply(lambda,math.diag(math.diag(Npar)))));
          h = math.solve(math.add(JtWJ, math.multiply(math.diag(math.diag(JtWJ)), lambda)), JtWdy);
          break;

        default:
          // Quadratic and Nielsen
          //h = ( JtWJ + lambda * math.eye(Npar) ) \ JtWdy;
          h = math.solve(math.add(JtWJ, math.multiply(Matrix.eye(Npar), lambda)), JtWdy);
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

      for (k = 0; k < idx.length; k++) {
        hidx[k] = h[idx[k]];
      }

      var p_try = math.add(p, hidx); // update the [idx] elements

      for (k = 0; k < p_try.length; k++) {
        p_try[k][0] = Math.min(Math.max(p_min[k][0], p_try[k][0]), p_max[k][0]);
      } // p_try = Math.min(Math.max(p_min,p_try),p_max);           // apply constraints


      var delta_y = math.subtract(y_dat, func(t, p_try, c)); // residual error using p_try
      //func_calls = func_calls + 1;
      //X2_try = delta_y' * ( delta_y .* weight_sq );  // Chi-squared error criteria

      var X2_try = math.multiply(math.transpose(delta_y), math.dotMultiply(delta_y, weight_sq));

      if (Update_Type == 2) {
        // Quadratic
        //    One step of quadratic line update in the h direction for minimum X2
        //var alpha =  JtWdy'*h / ( (X2_try - X2)/2 + 2*JtWdy'*h ) ;
        var JtWdy_th = math.multiply(math.transpose(JtWdy), h);
        var alpha = math.multiply(JtWdy_th, math.inv(math.add(math.multiply(math.subtract(X2_try - X2), 1 / 2)), math.multiply(JtWdy_th, 2))); //JtWdy'*h / ( (X2_try - X2)/2 + 2*JtWdy'*h ) ;

        h = math.multiply(alpha, h);

        for (var k = 0; k < idx.length; k++) {
          hidx[k] = h[idx[k]];
        }

        p_try = math.add(p, hidx); // update only [idx] elements

        p_try = math.min(math.max(p_min, p_try), p_max); // apply constraints

        delta_y = math.subtract(y_dat, func(t, p_try, c)); // residual error using p_try
        // func_calls = func_calls + 1;
        //X2_try = delta_y' * ( delta_y .* weight_sq ); // Chi-squared error criteria

        X2_try = math.multiply(math.transpose(delta_y), mat.dotMultiply(delta_y, weight_sq));
      } //rho = (X2 - X2_try) / ( 2*h' * (lambda * h + JtWdy) ); // Nielsen


      var rho = (X2 - X2_try) / math.multiply(math.multiply(math.transpose(h), 2), math.add(math.multiply(lambda, h), JtWdy)); //console.log("rho "+rho);

      if (rho > epsilon_4) {
        // it IS significantly better
        //console.log("Here");
        dX2 = X2 - X2_old;
        X2_old = X2;
        p_old = p;
        y_old = y_hat;
        p = p_try; // accept p_try

        result = this.lm_matx(func, t, p_old, y_old, dX2, J, p, y_dat, weight_sq, dp, c);
        JtWJ = result.JtWJ, JtWdy = result.JtWdy, X2 = result.Chi_sq, y_hat = result.y_hat, J = result.J; // decrease lambda ==> Gauss-Newton method

        switch (Update_Type) {
          case 1:
            // Levenberg
            lambda = Math.max(lambda / lambda_DN_fac, 1.e-7);
            break;

          case 2:
            // Quadratic
            lambda = Math.max(lambda / (1 + alpha), 1.e-7);
            break;

          case 3:
            // Nielsen
            lambda = math.multiply(Math.max(1 / 3, 1 - (2 * rho - 1) ^ 3), lambda);
            nu = 2;
            break;
        }
      } else {
        // it IS NOT better
        X2 = X2_old; // do not accept p_try

        if (iteration % (2 * Npar) == 0) {
          // rank-1 update of Jacobian
          result = this.lm_matx(func, t, p_old, y_old, -1, J, p, y_dat, weight_sq, dp, c);
          JtWJ = result.JtWJ, JtWdy = result.JtWdy, dX2 = result.Chi_sq, y_hat = result.y_hat, J = result.J;
        } // increase lambda  ==> gradient descent method


        switch (Update_Type) {
          case 1:
            // Levenberg
            lambda = Math.min(lambda * lambda_UP_fac, 1.e7);
            break;

          case 2:
            // Quadratic
            lambda = lambda + Math.abs((X2_try - X2) / 2 / alpha);
            break;

          case 3:
            // Nielsen
            lambda = lambda * nu;
            nu = 2 * nu;
            break;
        }
      }
    } // --- End of Main Loop
    // --- convergence achieved, find covariance and confidence intervals
    // equal weights for paramter error analysis


    weight_sq = math.multiply(math.multiply(math.transpose(delta_y), delta_y), Matrix.ones(Npnt, 1));
    weight_sq.apply(function (i, j) {
      weight_sq[i][j] = (Npnt - Nfit + 1) / weight_sq[i][j];
    }); //console.log(weight_sq);

    result = this.lm_matx(func, t, p_old, y_old, -1, J, p, y_dat, weight_sq, dp, c);
    JtWJ = result.JtWJ, JtWdy = result.JtWdy, X2 = result.Chi_sq, y_hat = result.y_hat, J = result.J;
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

    return {
      p: p,
      X2: X2
    };
  },
  lm_FD_J: function lm_FD_J(func, t, p, y, dp, c) {
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
    var m = y.length; // number of data points

    var n = p.length; // number of parameters

    dp = dp || math.multiply(Matrix.ones(n, 1), 0.001);
    var ps = p.clone(); //JSON.parse(JSON.stringify(p));
    //var ps = $.extend(true, [], p);

    var J = new Matrix(m, n),
        del = new Array(n); // initialize Jacobian to Zero

    for (var j = 0; j < n; j++) {
      //console.log(j+" "+dp[j]+" "+p[j]+" "+ps[j]+" "+del[j]);
      del[j] = dp[j] * (1 + Math.abs(p[j][0])); // parameter perturbation

      p[j] = [ps[j][0] + del[j]]; // perturb parameter p(j)
      //console.log(j+" "+dp[j]+" "+p[j]+" "+ps[j]+" "+del[j]);

      if (del[j] != 0) {
        y1 = func(t, p, c); //func_calls = func_calls + 1;

        if (dp[j][0] < 0) {
          // backwards difference
          //J(:,j) = math.dotDivide(math.subtract(y1, y),del[j]);//. / del[j];
          //console.log(del[j]);
          //console.log(y);
          var column = math.dotDivide(math.subtract(y1, y), del[j]);

          for (var k = 0; k < m; k++) {
            J[k][j] = column[k][0];
          } //console.log(column);

        } else {
          p[j][0] = ps[j][0] - del[j]; //J(:,j) = (y1 - feval(func, t, p, c)). / (2. * del[j]);

          var column = math.dotDivide(math.subtract(y1, func(t, p, c)), 2 * del[j]);

          for (var k = 0; k < m; k++) {
            J[k][j] = column[k][0];
          }
        } // central difference, additional func call

      }

      p[j] = ps[j]; // restore p(j)
    } //console.log("lm_FD_J: "+ JSON.stringify(J));


    return J;
  },
  // endfunction # -------------------------------------------------- LM_FD_J
  lm_Broyden_J: function lm_Broyden_J(p_old, y_old, J, p, y) {
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
    var h = math.subtract(p, p_old); //console.log("hhh "+h);

    var h_t = math.transpose(h);
    h_t.div(math.multiply(h_t, h)); //console.log(h_t);
    //J = J + ( y - y_old - J*h )*h' / (h'*h);	// Broyden rank-1 update eq'n

    J = math.add(J, math.multiply(math.subtract(y, math.add(y_old, math.multiply(J, h))), h_t));
    return J; // endfunction # ---------------------------------------------- LM_Broyden_J
  },
  lm_matx: function lm_matx(func, t, p_old, y_old, dX2, J, p, y_dat, weight_sq, dp, c, iteration) {
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
    var Npnt = y_dat.length; // number of data points

    var Npar = p.length; // number of parameters

    dp = dp || 0.001; //var JtWJ = new Matrix.zeros(Npar);
    //var JtWdy  = new Matrix.zeros(Npar,1);

    var y_hat = func(t, p, c); // evaluate model using parameters 'p'
    //func_calls = func_calls + 1;
    //console.log(J);

    if (iteration % (2 * Npar) == 0 || dX2 > 0) {
      //console.log("Par");
      J = this.lm_FD_J(func, t, p, y_hat, dp, c); // finite difference
    } else {
      //console.log("ImPar");
      J = this.lm_Broyden_J(p_old, y_old, J, p, y_hat); // rank-1 update
    } //console.log(y_dat);
    //console.log(y_hat);


    var delta_y = math.subtract(y_dat, y_hat); // residual error between model and data
    //console.log(delta_y[0][0]);
    //console.log(delta_y.rows+" "+delta_y.columns+" "+JSON.stringify(weight_sq));
    //var Chi_sq = delta_y' * ( delta_y .* weight_sq ); 	// Chi-squared error criteria

    var Chi_sq = math.multiply(math.transpose(delta_y), math.dotMultiply(delta_y, weight_sq)); //JtWJ  = J' * ( J .* ( weight_sq * ones(1,Npar) ) );

    var Jt = math.transpose(J); //console.log(weight_sq);

    var JtWJ = math.multiply(Jt, math.dotMultiply(J, math.multiply(weight_sq, Matrix.ones(1, Npar)))); //JtWdy = J' * ( weight_sq .* delta_y );

    var JtWdy = math.multiply(Jt, math.dotMultiply(weight_sq, delta_y));
    return {
      JtWJ: JtWJ,
      JtWdy: JtWdy,
      Chi_sq: Chi_sq,
      y_hat: y_hat,
      J: J
    }; // endfunction  # ------------------------------------------------------ LM_MATX
  }
};
module.exports = LM;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (!Symbol.species) {
  Symbol.species = Symbol.for('@@species');
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = exports = __webpack_require__(22);
exports.getEquallySpacedData = __webpack_require__(23).getEquallySpacedData;
exports.SNV = __webpack_require__(24).SNV;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Stat = __webpack_require__(4).array;
/**
 * Function that returns an array of points given 1D array as follows:
 *
 * [x1, y1, .. , x2, y2, ..]
 *
 * And receive the number of dimensions of each point.
 * @param array
 * @param dimensions
 * @returns {Array} - Array of points.
 */


function coordArrayToPoints(array, dimensions) {
  if (array.length % dimensions !== 0) {
    throw new RangeError('Dimensions number must be accordance with the size of the array.');
  }

  var length = array.length / dimensions;
  var pointsArr = new Array(length);
  var k = 0;

  for (var i = 0; i < array.length; i += dimensions) {
    var point = new Array(dimensions);

    for (var j = 0; j < dimensions; ++j) {
      point[j] = array[i + j];
    }

    pointsArr[k] = point;
    k++;
  }

  return pointsArr;
}
/**
 * Function that given an array as follows:
 * [x1, y1, .. , x2, y2, ..]
 *
 * Returns an array as follows:
 * [[x1, x2, ..], [y1, y2, ..], [ .. ]]
 *
 * And receives the number of dimensions of each coordinate.
 * @param array
 * @param dimensions
 * @returns {Array} - Matrix of coordinates
 */


function coordArrayToCoordMatrix(array, dimensions) {
  if (array.length % dimensions !== 0) {
    throw new RangeError('Dimensions number must be accordance with the size of the array.');
  }

  var coordinatesArray = new Array(dimensions);
  var points = array.length / dimensions;

  for (var i = 0; i < coordinatesArray.length; i++) {
    coordinatesArray[i] = new Array(points);
  }

  for (i = 0; i < array.length; i += dimensions) {
    for (var j = 0; j < dimensions; ++j) {
      var currentPoint = Math.floor(i / dimensions);
      coordinatesArray[j][currentPoint] = array[i + j];
    }
  }

  return coordinatesArray;
}
/**
 * Function that receives a coordinate matrix as follows:
 * [[x1, x2, ..], [y1, y2, ..], [ .. ]]
 *
 * Returns an array of coordinates as follows:
 * [x1, y1, .. , x2, y2, ..]
 *
 * @param coordMatrix
 * @returns {Array}
 */


function coordMatrixToCoordArray(coordMatrix) {
  var coodinatesArray = new Array(coordMatrix.length * coordMatrix[0].length);
  var k = 0;

  for (var i = 0; i < coordMatrix[0].length; ++i) {
    for (var j = 0; j < coordMatrix.length; ++j) {
      coodinatesArray[k] = coordMatrix[j][i];
      ++k;
    }
  }

  return coodinatesArray;
}
/**
 * Tranpose a matrix, this method is for coordMatrixToPoints and
 * pointsToCoordMatrix, that because only transposing the matrix
 * you can change your representation.
 *
 * @param matrix
 * @returns {Array}
 */


function transpose(matrix) {
  var resultMatrix = new Array(matrix[0].length);

  for (var i = 0; i < resultMatrix.length; ++i) {
    resultMatrix[i] = new Array(matrix.length);
  }

  for (i = 0; i < matrix.length; ++i) {
    for (var j = 0; j < matrix[0].length; ++j) {
      resultMatrix[j][i] = matrix[i][j];
    }
  }

  return resultMatrix;
}
/**
 * Function that transform an array of points into a coordinates array
 * as follows:
 * [x1, y1, .. , x2, y2, ..]
 *
 * @param points
 * @returns {Array}
 */


function pointsToCoordArray(points) {
  var coodinatesArray = new Array(points.length * points[0].length);
  var k = 0;

  for (var i = 0; i < points.length; ++i) {
    for (var j = 0; j < points[0].length; ++j) {
      coodinatesArray[k] = points[i][j];
      ++k;
    }
  }

  return coodinatesArray;
}
/**
 * Apply the dot product between the smaller vector and a subsets of the
 * largest one.
 *
 * @param firstVector
 * @param secondVector
 * @returns {Array} each dot product of size of the difference between the
 *                  larger and the smallest one.
 */


function applyDotProduct(firstVector, secondVector) {
  var largestVector, smallestVector;

  if (firstVector.length <= secondVector.length) {
    smallestVector = firstVector;
    largestVector = secondVector;
  } else {
    smallestVector = secondVector;
    largestVector = firstVector;
  }

  var difference = largestVector.length - smallestVector.length + 1;
  var dotProductApplied = new Array(difference);

  for (var i = 0; i < difference; ++i) {
    var sum = 0;

    for (var j = 0; j < smallestVector.length; ++j) {
      sum += smallestVector[j] * largestVector[i + j];
    }

    dotProductApplied[i] = sum;
  }

  return dotProductApplied;
}
/**
 * To scale the input array between the specified min and max values. The operation is performed inplace
 * if the options.inplace is specified. If only one of the min or max parameters is specified, then the scaling
 * will multiply the input array by min/min(input) or max/max(input)
 * @param input
 * @param options
 * @returns {*}
 */


function scale(input, options) {
  var y;

  if (options.inPlace) {
    y = input;
  } else {
    y = new Array(input.length);
  }

  const max = options.max;
  const min = options.min;

  if (typeof max === "number") {
    if (typeof min === "number") {
      var minMax = Stat.minMax(input);
      var factor = (max - min) / (minMax.max - minMax.min);

      for (var i = 0; i < y.length; i++) {
        y[i] = (input[i] - minMax.min) * factor + min;
      }
    } else {
      var currentMin = Stat.max(input);
      var factor = max / currentMin;

      for (var i = 0; i < y.length; i++) {
        y[i] = input[i] * factor;
      }
    }
  } else {
    if (typeof min === "number") {
      var currentMin = Stat.min(input);
      var factor = min / currentMin;

      for (var i = 0; i < y.length; i++) {
        y[i] = input[i] * factor;
      }
    }
  }

  return y;
}

module.exports = {
  coordArrayToPoints: coordArrayToPoints,
  coordArrayToCoordMatrix: coordArrayToCoordMatrix,
  coordMatrixToCoordArray: coordMatrixToCoordArray,
  coordMatrixToPoints: transpose,
  pointsToCoordArray: pointsToCoordArray,
  pointsToCoordMatrix: transpose,
  applyDotProduct: applyDotProduct,
  scale: scale
};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 *
 * Function that returns a Number array of equally spaced numberOfPoints
 * containing a representation of intensities of the spectra arguments x
 * and y.
 *
 * The options parameter contains an object in the following form:
 * from: starting point
 * to: last point
 * numberOfPoints: number of points between from and to
 * variant: "slot" or "smooth" - smooth is the default option
 *
 * The slot variant consist that each point in the new array is calculated
 * averaging the existing points between the slot that belongs to the current
 * value. The smooth variant is the same but takes the integral of the range
 * of the slot and divide by the step size between two points in the new array.
 *
 * @param x - sorted increasing x values
 * @param y
 * @param options
 * @returns {Array} new array with the equally spaced data.
 *
 */

function getEquallySpacedData(x, y, options) {
  if (x.length > 1 && x[0] > x[1]) {
    x = x.slice().reverse();
    y = y.slice().reverse();
  }

  var xLength = x.length;
  if (xLength !== y.length) throw new RangeError("the x and y vector doesn't have the same size.");
  if (options === undefined) options = {};
  var from = options.from === undefined ? x[0] : options.from;

  if (isNaN(from) || !isFinite(from)) {
    throw new RangeError("'From' value must be a number");
  }

  var to = options.to === undefined ? x[x.length - 1] : options.to;

  if (isNaN(to) || !isFinite(to)) {
    throw new RangeError("'To' value must be a number");
  }

  var reverse = from > to;

  if (reverse) {
    var temp = from;
    from = to;
    to = temp;
  }

  var numberOfPoints = options.numberOfPoints === undefined ? 100 : options.numberOfPoints;

  if (isNaN(numberOfPoints) || !isFinite(numberOfPoints)) {
    throw new RangeError("'Number of points' value must be a number");
  }

  if (numberOfPoints < 1) throw new RangeError("the number of point must be higher than 1");
  var algorithm = options.variant === "slot" ? "slot" : "smooth"; // default value: smooth

  var output = algorithm === "slot" ? getEquallySpacedSlot(x, y, from, to, numberOfPoints) : getEquallySpacedSmooth(x, y, from, to, numberOfPoints);
  return reverse ? output.reverse() : output;
}
/**
 * function that retrieves the getEquallySpacedData with the variant "smooth"
 *
 * @param x
 * @param y
 * @param from - Initial point
 * @param to - Final point
 * @param numberOfPoints
 * @returns {Array} - Array of y's equally spaced with the variant "smooth"
 */


function getEquallySpacedSmooth(x, y, from, to, numberOfPoints) {
  var xLength = x.length;
  var step = (to - from) / (numberOfPoints - 1);
  var halfStep = step / 2;
  var start = from - halfStep;
  var output = new Array(numberOfPoints);
  var initialOriginalStep = x[1] - x[0];
  var lastOriginalStep = x[x.length - 1] - x[x.length - 2]; // Init main variables

  var min = start;
  var max = start + step;
  var previousX = Number.MIN_VALUE;
  var previousY = 0;
  var nextX = x[0] - initialOriginalStep;
  var nextY = 0;
  var currentValue = 0;
  var slope = 0;
  var intercept = 0;
  var sumAtMin = 0;
  var sumAtMax = 0;
  var i = 0; // index of input

  var j = 0; // index of output

  function getSlope(x0, y0, x1, y1) {
    return (y1 - y0) / (x1 - x0);
  }

  main: while (true) {
    while (nextX - max >= 0) {
      // no overlap with original point, just consume current value
      var add = integral(0, max - previousX, slope, previousY);
      sumAtMax = currentValue + add;
      output[j] = (sumAtMax - sumAtMin) / step;
      j++;
      if (j === numberOfPoints) break main;
      min = max;
      max += step;
      sumAtMin = sumAtMax;
    }

    if (previousX <= min && min <= nextX) {
      add = integral(0, min - previousX, slope, previousY);
      sumAtMin = currentValue + add;
    }

    currentValue += integral(previousX, nextX, slope, intercept);
    previousX = nextX;
    previousY = nextY;

    if (i < xLength) {
      nextX = x[i];
      nextY = y[i];
      i++;
    } else if (i === xLength) {
      nextX += lastOriginalStep;
      nextY = 0;
    } // updating parameters


    slope = getSlope(previousX, previousY, nextX, nextY);
    intercept = -slope * previousX + previousY;
  }

  return output;
}
/**
 * function that retrieves the getEquallySpacedData with the variant "slot"
 *
 * @param x
 * @param y
 * @param from - Initial point
 * @param to - Final point
 * @param numberOfPoints
 * @returns {Array} - Array of y's equally spaced with the variant "slot"
 */


function getEquallySpacedSlot(x, y, from, to, numberOfPoints) {
  var xLength = x.length;
  var step = (to - from) / (numberOfPoints - 1);
  var halfStep = step / 2;
  var lastStep = x[x.length - 1] - x[x.length - 2];
  var start = from - halfStep;
  var output = new Array(numberOfPoints); // Init main variables

  var min = start;
  var max = start + step;
  var previousX = -Number.MAX_VALUE;
  var previousY = 0;
  var nextX = x[0];
  var nextY = y[0];
  var frontOutsideSpectra = 0;
  var backOutsideSpectra = true;
  var currentValue = 0; // for slot algorithm

  var currentPoints = 0;
  var i = 1; // index of input

  var j = 0; // index of output

  main: while (true) {
    if (previousX >= nextX) throw new Error('x must be an increasing serie');

    while (previousX - max > 0) {
      // no overlap with original point, just consume current value
      if (backOutsideSpectra) {
        currentPoints++;
        backOutsideSpectra = false;
      }

      output[j] = currentPoints <= 0 ? 0 : currentValue / currentPoints;
      j++;
      if (j === numberOfPoints) break main;
      min = max;
      max += step;
      currentValue = 0;
      currentPoints = 0;
    }

    if (previousX > min) {
      currentValue += previousY;
      currentPoints++;
    }

    if (previousX === -Number.MAX_VALUE || frontOutsideSpectra > 1) currentPoints--;
    previousX = nextX;
    previousY = nextY;

    if (i < xLength) {
      nextX = x[i];
      nextY = y[i];
      i++;
    } else {
      nextX += lastStep;
      nextY = 0;
      frontOutsideSpectra++;
    }
  }

  return output;
}
/**
 * Function that calculates the integral of the line between two
 * x-coordinates, given the slope and intercept of the line.
 *
 * @param x0
 * @param x1
 * @param slope
 * @param intercept
 * @returns {number} integral value.
 */


function integral(x0, x1, slope, intercept) {
  return 0.5 * slope * x1 * x1 + intercept * x1 - (0.5 * slope * x0 * x0 + intercept * x0);
}

exports.getEquallySpacedData = getEquallySpacedData;
exports.integral = integral;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.SNV = SNV;

var Stat = __webpack_require__(4).array;
/**
 * Function that applies the standard normal variate (SNV) to an array of values.
 *
 * @param data - Array of values.
 * @returns {Array} - applied the SNV.
 */


function SNV(data) {
  var mean = Stat.mean(data);
  var std = Stat.standardDeviation(data);
  var result = data.slice();

  for (var i = 0; i < data.length; i++) {
    result[i] = (result[i] - mean) / std;
  }

  return result;
}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

class MatrixTransposeView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.columns, matrix.rows);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(columnIndex, rowIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(columnIndex, rowIndex);
  }

}

module.exports = MatrixTransposeView;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

class MatrixRowView extends BaseView {
  constructor(matrix, row) {
    super(matrix, 1, matrix.columns);
    this.row = row;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.row, columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.row, columnIndex);
  }

}

module.exports = MatrixRowView;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

var util = __webpack_require__(3);

class MatrixSubView extends BaseView {
  constructor(matrix, startRow, endRow, startColumn, endColumn) {
    util.checkRange(matrix, startRow, endRow, startColumn, endColumn);
    super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
    this.startRow = startRow;
    this.startColumn = startColumn;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.startRow + rowIndex, this.startColumn + columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.startRow + rowIndex, this.startColumn + columnIndex);
  }

}

module.exports = MatrixSubView;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

var util = __webpack_require__(3);

class MatrixSelectionView extends BaseView {
  constructor(matrix, rowIndices, columnIndices) {
    var indices = util.checkIndices(matrix, rowIndices, columnIndices);
    super(matrix, indices.row.length, indices.column.length);
    this.rowIndices = indices.row;
    this.columnIndices = indices.column;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.rowIndices[rowIndex], this.columnIndices[columnIndex], value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.rowIndices[rowIndex], this.columnIndices[columnIndex]);
  }

}

module.exports = MatrixSelectionView;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

class MatrixColumnView extends BaseView {
  constructor(matrix, column) {
    super(matrix, matrix.rows, 1);
    this.column = column;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.column, value);
    return this;
  }

  get(rowIndex) {
    return this.matrix.get(rowIndex, this.column);
  }

}

module.exports = MatrixColumnView;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

class MatrixFlipRowView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.rows, matrix.columns);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
  }

}

module.exports = MatrixFlipRowView;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BaseView = __webpack_require__(1);

class MatrixFlipColumnView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.rows, matrix.columns);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
  }

}

module.exports = MatrixFlipColumnView;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matrix = __webpack_require__(0).Matrix;

var SingularValueDecomposition = __webpack_require__(10);

var EigenvalueDecomposition = __webpack_require__(33);

var LuDecomposition = __webpack_require__(9);

var QrDecomposition = __webpack_require__(34);

var CholeskyDecomposition = __webpack_require__(35);

function inverse(matrix) {
  matrix = Matrix.checkMatrix(matrix);
  return solve(matrix, Matrix.eye(matrix.rows));
}
/**
 * Returns the inverse
 * @memberOf Matrix
 * @static
 * @param {Matrix} matrix
 * @return {Matrix} matrix
 * @alias inv
 */


Matrix.inverse = Matrix.inv = inverse;
/**
 * Returns the inverse
 * @memberOf Matrix
 * @static
 * @param {Matrix} matrix
 * @return {Matrix} matrix
 * @alias inv
 */

Matrix.prototype.inverse = Matrix.prototype.inv = function () {
  return inverse(this);
};

function solve(leftHandSide, rightHandSide) {
  leftHandSide = Matrix.checkMatrix(leftHandSide);
  rightHandSide = Matrix.checkMatrix(rightHandSide);
  return leftHandSide.isSquare() ? new LuDecomposition(leftHandSide).solve(rightHandSide) : new QrDecomposition(leftHandSide).solve(rightHandSide);
}

Matrix.solve = solve;

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

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Matrix = __webpack_require__(0).Matrix;

const util = __webpack_require__(5);

const hypotenuse = util.hypotenuse;
const getFilled2DArray = util.getFilled2DArray;
const defaultOptions = {
  assumeSymmetric: false
}; // https://github.com/lutzroeder/Mapack/blob/master/Source/EigenvalueDecomposition.cs

function EigenvalueDecomposition(matrix, options) {
  options = Object.assign({}, defaultOptions, options);

  if (!(this instanceof EigenvalueDecomposition)) {
    return new EigenvalueDecomposition(matrix, options);
  }

  matrix = Matrix.checkMatrix(matrix);

  if (!matrix.isSquare()) {
    throw new Error('Matrix is not a square matrix');
  }

  var n = matrix.columns,
      V = getFilled2DArray(n, n, 0),
      d = new Array(n),
      e = new Array(n),
      value = matrix,
      i,
      j;
  var isSymmetric = false;

  if (options.assumeSymmetric) {
    isSymmetric = true;
  } else {
    isSymmetric = matrix.isSymmetric();
  }

  if (isSymmetric) {
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        V[i][j] = value.get(i, j);
      }
    }

    tred2(n, e, d, V);
    tql2(n, e, d, V);
  } else {
    var H = getFilled2DArray(n, n, 0),
        ort = new Array(n);

    for (j = 0; j < n; j++) {
      for (i = 0; i < n; i++) {
        H[i][j] = value.get(i, j);
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
    if (!Matrix.isMatrix(this.V)) {
      this.V = new Matrix(this.V);
    }

    return this.V;
  },

  get diagonalMatrix() {
    var n = this.n,
        e = this.e,
        d = this.d,
        X = new Matrix(n, n),
        i,
        j;

    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        X[i][j] = 0;
      }

      X[i][i] = d[i];

      if (e[i] > 0) {
        X[i][i + 1] = e[i];
      } else if (e[i] < 0) {
        X[i][i - 1] = e[i];
      }
    }

    return X;
  }

};

function tred2(n, e, d, V) {
  var f, g, h, i, j, k, hh, scale;

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
          V[k][j] -= f * e[k] + g * d[k];
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
  var g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2, iter;

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
      } while (Math.abs(e[l]) > eps * tst1);
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
      f,
      g,
      h,
      i,
      j,
      m,
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
      V[i][j] = i === j ? 1 : 0;
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

        g = g / ort[m] / H[m][m - 1];

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
      i,
      j,
      k,
      l,
      m,
      t,
      w,
      x,
      y,
      ra,
      sa,
      vr,
      vi,
      notlast,
      cdivres;

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
        z = p >= 0 ? p + z : p - z;
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
        notlast = k !== n - 1;

        if (k !== m) {
          p = H[k][k - 1];
          q = H[k + 1][k - 1];
          r = notlast ? H[k + 2][k - 1] : 0;
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
            H[i][n] = w !== 0 ? -r / w : -r / (eps * norm);
          } else {
            x = H[i][i + 1];
            y = H[i + 1][i];
            q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
            t = (x * s - z * r) / q;
            H[i][n] = t;
            H[i + 1][n] = Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z;
          }

          t = Math.abs(H[i][n]);

          if (eps * t * t > 1) {
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

            if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
              H[i + 1][n - 1] = (-ra - w * H[i][n - 1] + q * H[i][n]) / x;
              H[i + 1][n] = (-sa - w * H[i][n] - q * H[i][n - 1]) / x;
            } else {
              cdivres = cdiv(-r - y * H[i][n - 1], -s - y * H[i][n], z, q);
              H[i + 1][n - 1] = cdivres[0];
              H[i + 1][n] = cdivres[1];
            }
          }

          t = Math.max(Math.abs(H[i][n - 1]), Math.abs(H[i][n]));

          if (eps * t * t > 1) {
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
  } else {
    r = yr / yi;
    d = yi + r * yr;
    return [(r * xr + xi) / d, (r * xi - xr) / d];
  }
}

module.exports = EigenvalueDecomposition;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matrix = __webpack_require__(0).Matrix;

var hypotenuse = __webpack_require__(5).hypotenuse; //https://github.com/lutzroeder/Mapack/blob/master/Source/QrDecomposition.cs


function QrDecomposition(value) {
  if (!(this instanceof QrDecomposition)) {
    return new QrDecomposition(value);
  }

  value = Matrix.checkMatrix(value);
  var qr = value.clone(),
      m = value.rows,
      n = value.columns,
      rdiag = new Array(n),
      i,
      j,
      k,
      s;

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
  solve: function solve(value) {
    value = Matrix.checkMatrix(value);
    var qr = this.QR,
        m = qr.rows;

    if (value.rows !== m) {
      throw new Error('Matrix row dimensions must agree');
    }

    if (!this.isFullRank()) {
      throw new Error('Matrix is rank deficient');
    }

    var count = value.columns;
    var X = value.clone();
    var n = qr.columns;
    var i, j, k, s;

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
  isFullRank: function isFullRank() {
    var columns = this.QR.columns;

    for (var i = 0; i < columns; i++) {
      if (this.Rdiag[i] === 0) {
        return false;
      }
    }

    return true;
  },

  get upperTriangularMatrix() {
    var qr = this.QR,
        n = qr.columns,
        X = new Matrix(n, n),
        i,
        j;

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

  get orthogonalMatrix() {
    var qr = this.QR,
        rows = qr.rows,
        columns = qr.columns,
        X = new Matrix(rows, columns),
        i,
        j,
        k,
        s;

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

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matrix = __webpack_require__(0).Matrix; // https://github.com/lutzroeder/Mapack/blob/master/Source/CholeskyDecomposition.cs


function CholeskyDecomposition(value) {
  if (!(this instanceof CholeskyDecomposition)) {
    return new CholeskyDecomposition(value);
  }

  value = Matrix.checkMatrix(value);

  if (!value.isSymmetric()) {
    throw new Error('Matrix is not symmetric');
  }

  var a = value,
      dimension = a.rows,
      l = new Matrix(dimension, dimension),
      positiveDefinite = true,
      i,
      j,
      k;

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
    positiveDefinite &= d > 0;
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
  get lowerTriangularMatrix() {
    return this.L;
  },

  solve: function solve(value) {
    value = Matrix.checkMatrix(value);
    var l = this.L,
        dimension = l.rows;

    if (value.rows !== dimension) {
      throw new Error('Matrix dimensions do not match');
    }

    var count = value.columns,
        B = value.clone(),
        i,
        j,
        k;

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

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let Opt = __webpack_require__(7);
/**
 * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
 * @param peakList
 * @param options
 */


module.exports = function joinBroadPeaks(peakList) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let width = options.width;
  let broadLines = []; // Optimize the possible broad lines

  let max = 0;
  let maxI = 0;
  let count = 1;

  for (let i = peakList.length - 1; i >= 0; i--) {
    if (peakList[i].soft) {
      broadLines.push(peakList.splice(i, 1)[0]);
    }
  } // Push a feke peak


  broadLines.push({
    x: Number.MAX_VALUE
  });
  let candidates = [[broadLines[0].x, broadLines[0].y]];
  let indexes = [0];

  for (let i = 1; i < broadLines.length; i++) {
    // console.log(broadLines[i-1].x+" "+broadLines[i].x);
    if (Math.abs(broadLines[i - 1].x - broadLines[i].x) < width) {
      candidates.push([broadLines[i].x, broadLines[i].y]);

      if (broadLines[i].y > max) {
        max = broadLines[i].y;
        maxI = i;
      }

      indexes.push(i);
      count++;
    } else {
      if (count > 2) {
        let fitted = Opt.optimizeSingleLorentzian(candidates, {
          x: broadLines[maxI].x,
          y: max,
          width: Math.abs(candidates[0][0] - candidates[candidates.length - 1][0])
        });
        peakList.push({
          x: fitted[0][0],
          y: fitted[1][0],
          width: fitted[2][0],
          soft: false
        });
      } else {
        // Put back the candidates to the signals list
        indexes.forEach(index => {
          peakList.push(broadLines[index]);
        });
      }

      candidates = [[broadLines[i].x, broadLines[i].y]];
      indexes = [i];
      max = broadLines[i].y;
      maxI = i;
      count = 1;
    }
  }

  peakList.sort(function (a, b) {
    return a.x - b.x;
  });
  return peakList;
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This method will allow to enlarge peaks and prevent overlap between peaks
 * Because peaks may not be symmetric after we add 2 properties, from and to.
 * @param {Array} peakList
 * @param {object} [options={}]
 * @param {number} [factor=2]
 * @param {boolean} [overlap=false] by default we don't allow overlap
 * @return {Array} peakList
 */

module.exports = function broadenPeaks(peakList) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    factor = 2,
    overlap = false
  } = options;

  for (let peak of peakList) {
    peak.from = peak.x - peak.width / 2 * factor;
    peak.to = peak.x + peak.width / 2 * factor;
  }

  if (!overlap) {
    for (let i = 0; i < peakList.length - 1; i++) {
      let peak = peakList[i];
      let nextPeak = peakList[i + 1];

      if (peak.to > nextPeak.from) {
        peak.to = nextPeak.from = (peak.to + nextPeak.from) / 2;
      }
    }
  }

  for (let peak of peakList) {
    peak.width = peak.to - peak.from;
  }

  return peakList;
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=ml-gsd.js.map
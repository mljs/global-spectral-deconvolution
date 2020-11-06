const gsd = require('../src/gsd');

let X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
let Y = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
let peaks = gsd(X, Y, {
  noiseLevel: 0,
  minMaxRatio: 0.00025, // Threshold to determine if a given peak should be considered as a noise
  realTopDetection: true,
  maxCriteria: true, // inverted:false
  smoothY: false,
  sgOptions: { windowSize: 7, polynomial: 3 },
});

console.log(peaks);

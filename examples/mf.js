// to execute with `node -r esm ./mf.js`

import { IsotopicDistribution } from 'mf-global';
import { gsd, optimizePeaks } from '../src';

// generate a sample spectrum of the form {x:[], y:[]}
const data = new IsotopicDistribution('C').getGaussian();

let peaks = gsd(data, {
  noiseLevel: 0,
  minMaxRatio: 0.00025, // Threshold to determine if a given peak should be considered as a noise
  realTopDetection: true,
  maxCriteria: true, // inverted:false
  smoothY: false,
  sgOptions: { windowSize: 7, polynomial: 3 },
});

let optimized = optimizePeaks(data, peaks);
console.log(optimized);

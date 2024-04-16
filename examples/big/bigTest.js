
// run file using  ts-node examples/big/bigTest.js


import { readFileSync } from 'fs'
import { join } from 'path'

import { xMaxValue, xMinValue } from 'ml-spectra-processing'

import { gsd } from '../../src/index.ts'

console.time('loading')
const data = JSON.parse(readFileSync(join(__dirname, '1e6.json'), 'utf8'))
console.timeEnd('loading')
console.log('Number peaks: ', data.x.length)
console.time('gsd')
const peaks = gsd(data, {
  minMaxRatio: 0.00025, // Threshold to determine if a given peak should be considered as a noise
  realTopDetection: true,
  smoothY: false,
  sgOptions: { windowSize: 7, polynomial: 3 },
})
console.timeEnd('gsd')

console.log('Min Y:', xMinValue(peaks.map((peak) => peak.y)))
console.log('Max Y:', xMaxValue(peaks.map((peak) => peak.y)))

console.log('Nb peaks:', peaks.length);
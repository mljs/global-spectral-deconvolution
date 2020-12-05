/*
install vscode plugin `liveserver` and right click on index.html and `Open with liveserver`

 start this code with automatic reload using
`npm run example``
*/

import { gsd, optimizePeaks } from '../src';
import { writeFileSync } from 'fs'
import { join } from 'path'
import { generateSpectrum } from 'spectrum-generator'

const peaks = [
  { x: -0.1, y: 0.2, width: 0.3 },
  { x: 0.1, y: 0.2, width: 0.1 },
];

const original = generateSpectrum(peaks, { from: -1, to: 1, nbPoints: 101 });


let peakList = gsd(original, {
  minMaxRatio: 0,
  realTopDetection: false,
  smoothY: false,
  heightFactor: 1,
  shape: { kind: 'gaussian' },
});


let optimizedPeaks = optimizePeaks(original, peakList);

let labels = optimizedPeaks.map(peak => ({ x: peak.x, y: peak.y, dy: '-10px', dx: '3px', text: peak.x.toPrecision(4) + ' / ' + peak.y.toPrecision(4) }));
let lines = optimizedPeaks.map(peak => ([{ x: peak.x, y: peak.y }, { x: peak.x, y: peak.y, dy: '-20px' }]));
let polygons = [];
for (const peak of optimizedPeaks) {
  const peaksSpectrum = generateSpectrum([peak], { from: peak.x - peak.width * 5, to: peak.x + peak.width * 5, nbPoints: 501 });
  const polygon = [];
  for (let i = 0; i < peaksSpectrum.x.length; i++) {
    polygon.push({ x: peaksSpectrum.x[i], y: peaksSpectrum.y[i] })
  }
  polygons.push(polygon);
}



original.x = Array.from(original.x)
original.y = Array.from(original.y)

writeFileSync(join(__dirname, 'data.json'), JSON.stringify({ data: original, labels, lines, polygons }), 'utf8')
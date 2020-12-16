/*
install vscode plugin `liveserver` and right click on index.html and `Open with liveserver`

 start this code with automatic reload using
`npm run example``
*/

import { writeFileSync } from 'fs';
import { join } from 'path';

import { generateSpectrum } from 'spectrum-generator';

import { gsd, optimizePeaks } from '../../src';

const spectrum = generateSpectrum([
  [530, 0.03, 120],
  [140, 0.0025, 90],
]);
let peakList = gsd(spectrum, {
  minMaxRatio: 0,
  smoothY: false,
  shape: { kind: 'gaussian' },
});
console.log(peakList);

let optimizedPeaks = optimizePeaks(original, peakList);

let labels = optimizedPeaks.map((peak) => ({
  x: peak.x,
  y: peak.y,
  dy: '-10px',
  dx: '3px',
  text: `${peak.x.toPrecision(4)} / ${peak.y.toPrecision(4)}`,
}));
let lines = optimizedPeaks.map((peak) => [
  { x: peak.x, y: peak.y },
  { x: peak.x, y: peak.y, dy: '-20px' },
]);

let polygons = [];
for (const peak of optimizedPeaks) {
  const peaksSpectrum = generateSpectrum([peak], {
    from: peak.x - peak.width * 5,
    to: peak.x + peak.width * 5,
    nbPoints: 501,
  });
  const polygon = [];
  for (let i = 0; i < peaksSpectrum.x.length; i++) {
    polygon.push({ x: peaksSpectrum.x[i], y: peaksSpectrum.y[i] });
  }
  polygons.push(polygon);
}

let reconstructed = generateSpectrum(optimizedPeaks, {
  from,
  to,
  nbPoints: 5001,
});
reconstructed.x = Array.from(reconstructed.x);
reconstructed.y = Array.from(reconstructed.y);

original.x = Array.from(original.x);
original.y = Array.from(original.y);

writeFileSync(
  join(__dirname, 'data.json'),
  JSON.stringify({ data: original, labels, lines, polygons, reconstructed }),
  'utf8',
);

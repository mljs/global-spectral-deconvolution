import fs from 'node:fs/promises';

import { xMinMaxValues, xRescale, xyExtract } from 'ml-spectra-processing';

import { groupPeaks } from '../lib/utils/groupPeaks.js';

const examplesDir = new URL('../examples/', import.meta.url);
const cytisine = JSON.parse(
  await fs.readFile(
    new URL(
      '../node_modules/nmr-xy-testdata/data/experimental/1d/cytisine.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

const peakData = [
  { x: 2.8988963300472577, y: 1216954.1875, width: 1.1479643816216212 },
  { x: 2.901941435700796, y: 2731814.3125, width: 0.1530619175495495 },
  { x: 2.9039324663204176, y: 4378094, width: 1.3010262991711707 },
  {
    x: 2.9080909774243895,
    y: 7132708.581861134,
    width: 1.3010262991711707,
  },
  { x: 2.90908572204179, y: 6954694, width: 0.38265479387387374 },
  { x: 2.9109596332131984, y: 7006536.125, width: 0.22959287632432424 },
  {
    x: 2.911939474413536,
    y: 7271416.879079291,
    width: 1.3010262991711707,
  },
  { x: 2.9159957694863583, y: 4637703.625, width: 1.3775572579459456 },
  { x: 2.9210319057595178, y: 1301946.6875, width: 0.8418405465222321 },
  { x: 2.922085980793435, y: 827527.6875, width: 0.1530619175495495 },
  {
    x: 2.970264353746701,
    y: 4592042.070430136,
    width: 0.9183715052972969,
  },
  { x: 2.9720959851803936, y: 5955778.1875, width: 0.6887786289729728 },
  {
    x: 2.9741455752276296,
    y: 7228948.085964241,
    width: 0.7653095877477475,
  },
  {
    x: 2.975920357264761,
    y: 7480710.134810713,
    width: 0.9183715052972969,
  },
  { x: 2.979474510417814, y: 3256723.5, width: 0.1530619175495495 },
  { x: 2.980411466003518, y: 3099349, width: 0.3061238350988088 },
  { x: 2.981582660485648, y: 2831848.9375, width: 1.224495340396396 },
  { x: 2.9836908105534823, y: 1461209.375, width: 0.1530619175495495 },
  { x: 2.9900152607569854, y: 6825024.375, width: 0.8418405465225223 },
  { x: 2.992357649721246, y: 10440484.375, width: 0.7653095877477475 },
  {
    x: 2.994393305901166,
    y: 13097812.095818793,
    width: 0.6887786289729728,
  },
  {
    x: 2.996085079863752,
    y: 13513200.831781365,
    width: 0.9183715052972969,
  },
  { x: 3.001141608337222, y: 6481023.75, width: 1.6071501342702696 },
  {
    x: 3.0250125348414705,
    y: 13047539.959018823,
    width: 0.9949024640717816,
  },
  {
    x: 3.0288328471097072,
    y: 12613123.015165165,
    width: 0.9949024640720717,
  },
  {
    x: 3.0446007382525018,
    y: 5732774.643161918,
    width: 1.0714334228468465,
  },
  {
    x: 3.0484512636801235,
    y: 5441681.395075871,
    width: 0.9949024640720717,
  },
  { x: 3.0710619189203934, y: 2857487.25, width: 0.22959287632432424 },
  {
    x: 3.0717646356096715,
    y: 3717859.5625,
    width: 0.22959287632432424,
  },
  {
    x: 3.0752224860427497,
    y: 6418323.016570056,
    width: 2.372459722018017,
  },
  { x: 3.0773863691238965, y: 6073424.125, width: 0.306123835099099 },
  { x: 3.079143160847092, y: 5412032.5625, width: 1.6836810930450445 },
  { x: 3.0920263001505237, y: 2591849.5625, width: 0.1530619175495495 },
  {
    x: 3.0954664683775146,
    y: 4438276.225117802,
    width: 2.2959287632432424,
  },
  { x: 3.0977651531129617, y: 4131058.875, width: 0.306123835099099 },
  { x: 3.099404825387944, y: 3677497.5, width: 1.6836810930447543 },
];

function normalizePeakData(peaks) {
  const yPeakData = peaks.map((peak) => peak.y);
  const yPeakScaled = xRescale(yPeakData, { min: 0, max: 1 });
  peaks.forEach((peak, index, arr) => {
    arr[index].y = yPeakScaled[index];
    arr[index].width /= 600.2;
  });

  return peaks;
}

async function main() {
  const minMax = xMinMaxValues(peakData.map((p) => p.x));
  const xyData = xyExtract(cytisine, {
    zones: [{ from: minMax.min - 0.1, to: minMax.max + 0.1 }],
  });

  xRescale(xyData.y, { min: 0, max: 1, output: xyData.y });

  await fs.writeFile(
    new URL('xyData.json', examplesDir),
    JSON.stringify(xyData, null, 2),
    'utf8',
  );

  normalizePeakData(peakData);

  const groupedPeaks = groupPeaks(peakData, {
    factor: 40,
    maxNumberOfPeaks: 15,
  });

  await fs.writeFile(
    new URL('groupedPeaks.json', examplesDir),
    JSON.stringify(groupedPeaks, null, 2),
    'utf8',
  );

  console.log('Generated examples/xyData.json and examples/groupedPeaks.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

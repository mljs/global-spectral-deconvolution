import { DoubleArray } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';

export function findClosestIndex(xData: DoubleArray, xValue: number) {
  const reversed = xData[1] - xData[0] < 0;
  if (reversed) {
    xData.reverse();
  }
  const index = xFindClosestIndex(xData, xValue, { sorted: true });

  return reversed ? xData.length - index - 1 : index;
}

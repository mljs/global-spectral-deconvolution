import { DataXY } from 'cheminfo-types';

export function checkAscending(input: DataXY) {
  const x = new Float64Array(input.x);
  const y = new Float64Array(input.y);

  const reversed = x[1] - x[0] < 0;
  if (reversed) {
    x.reverse();
    y.reverse();
  }

  return { data: { x, y }, reversed };
}

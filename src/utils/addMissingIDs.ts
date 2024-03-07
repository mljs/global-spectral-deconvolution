import { v4 as generateID } from '@lukeed/uuid';

const { parse, stringify } = JSON;

export function addMissingIDs<T extends { id?: string }>(
  peaks: T[],
  options: { output?: T[] } = {},
) {
  const { output = parse(stringify(peaks)) as T[] } = options;
  for (const peak of output) {
    if (!('id' in peak)) {
      peak.id = generateID();
    }
  }

  return output as Array<T & { id: string }>;
}

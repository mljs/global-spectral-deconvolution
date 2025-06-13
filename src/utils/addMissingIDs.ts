export function addMissingIDs<T extends { id?: string }>(
  peaks: T[],
  options: { output?: T[] } = {},
) {
  const { output = structuredClone(peaks) } = options;
  for (const peak of output) {
    if (!('id' in peak)) {
      peak.id = crypto.randomUUID();
    }
  }

  return output as Array<T & { id: string }>;
}

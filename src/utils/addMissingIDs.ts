/**
 * Assign a random UUID to every peak that does not already have an `id`.
 * @param peaks - Peaks possibly missing an `id`.
 * @param options - Options.
 * @param options.output - Destination array. Defaults to a deep clone of `peaks`.
 * @returns A peak list where every peak has an `id`.
 */
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

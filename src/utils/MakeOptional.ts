export type MakeOptional<T extends object, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P] | undefined;
};

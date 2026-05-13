export interface List<T> {
  results: T[];
  next?: number | null;
  count: number;
  previous?: number | null;
}

export type ListQuery<T> = Partial<T & { limit: number; offset: number }>;

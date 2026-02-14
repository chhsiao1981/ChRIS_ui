export interface List<T> {
  list: T[];
  count: number;
}

export type ListQuery<T> = Partial<T & { limit: number; offset: number }>;

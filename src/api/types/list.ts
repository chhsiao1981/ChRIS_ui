import type { ID } from "./id";

export interface List<T> {
  results: T[];
  next?: ID | null;
  count: number;
  previous?: ID | null;
}

export type ListQuery<T> = Partial<T & { limit: number; offset: number }>;

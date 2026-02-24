import type { ID } from "./id";

export interface List<T> {
  list: T[];
  next: ID;
  count: number;
}

export type ListQuery<T> = Partial<T & { limit: number; offset: number }>;

import type { Feed } from "../../api/types";

export type ColumnDefinition = {
  id: string;
  label: string;
  comparator: (a: Feed, b: Feed) => number;
};

export interface PluginInstanceDetails {
  progress: number;
  feedProgressText: string;
  isFinished?: boolean;
  foundError?: boolean;
}

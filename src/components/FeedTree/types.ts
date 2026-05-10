import type { ID, PluginInstance } from "../../api/types";

export type OverlayScaleType = "time" | "cpu" | "memory";

export type Orientation = "vertical" | "horizontal";

export type Transform = {
  x: number;
  y: number;
  k: number;
};

export interface TreeNodeDatum {
  id: ID;
  name: string;
  parentId: ID | undefined;
  item: PluginInstance;
  children: TreeNodeDatum[];
}

export type ContextMenuPosition = {
  x: number;
  y: number;
  visible: boolean;
};

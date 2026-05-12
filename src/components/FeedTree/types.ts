import type { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";
import type { TreeNodeDatum } from "../../reducers/types";

export type Transform = {
  x: number;
  y: number;
  k: number;
};

export type DropdownPosition = {
  x: number;
  y: number;
};

export type DropdownOperation =
  | "addNode"
  | "addPipeline"
  | "deleteNode"
  | "zip";

export type D3Data = {
  rootNode: HierarchyPointNode<TreeNodeDatum>;
  nodes: HierarchyPointNode<TreeNodeDatum>[];
  links: HierarchyPointLink<TreeNodeDatum>[];
};

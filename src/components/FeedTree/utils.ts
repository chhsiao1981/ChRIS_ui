import type { HierarchyPointNode } from "d3-hierarchy";
import type { Quadtree } from "d3-quadtree";
import type { MouseEvent, SetStateAction } from "react";
import { DEFAULT_NODE_RADIUS } from "./constants";
import type { Transform, TreeNodeDatum } from "./types";

export const isNodeInViewport = (
  node: HierarchyPointNode<TreeNodeDatum>,
  transform: { x: number; y: number; k: number },
  width: number,
  height: number,
  padding = 100, // Extra padding to render slightly outside viewport
): boolean => {
  // Screen position calculation
  const screenX = node.x * transform.k + transform.x;
  const screenY = node.y * transform.k + transform.y;

  // Check if the node is within the padded viewport
  return (
    screenX >= -padding &&
    screenX <= width + padding &&
    screenY >= -padding &&
    screenY <= height + padding
  );
};

export const getHitNode = (
  event: MouseEvent<HTMLCanvasElement>,
  theCanvas: HTMLCanvasElement,
  theTree: Quadtree<HierarchyPointNode<TreeNodeDatum>>,
  transform: Transform,
) => {
  const rect = theCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const zoomedX = (mouseX - transform.x) / transform.k;
  const zoomedY = (mouseY - transform.y) / transform.k;
  const searchRadius = DEFAULT_NODE_RADIUS / transform.k;

  return theTree.find(zoomedX, zoomedY, searchRadius);
};

export const getNodeScreenCoords = (
  nodeX: number,
  nodeY: number,
  transform: Transform,
  containerRect: DOMRect,
) => {
  const canvasX = transform.x + transform.k * nodeX;
  const canvasY = transform.y + transform.k * nodeY;
  const screenX = containerRect.left + canvasX;
  const screenY = containerRect.top + canvasY;
  return { screenX, screenY };
};

export const onCanvasContextMenu = (
  evt: MouseEvent<HTMLCanvasElement>,
  theCanvas: HTMLCanvasElement,
  theTree: Quadtree<HierarchyPointNode<TreeNodeDatum>>,
  transform: Transform,
  setContextMenuNode: (value: SetStateAction<TreeNodeDatum | null>) => void,
) => {};

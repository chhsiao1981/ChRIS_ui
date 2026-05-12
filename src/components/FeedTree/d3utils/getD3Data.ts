import {
  type HierarchyPointLink,
  type HierarchyPointNode,
  hierarchy,
  tree,
} from "d3-hierarchy";
import type { ID } from "../../../api/types";
import type { TreeNodeDatum, TSIDMap } from "../../../reducers/types";
import type { Orientation } from "../../Graph/types";
import { NODE_SIZE, SEPARATION } from "../constants";
import type { D3Data } from "../types";

export const getD3Data = (
  data: TreeNodeDatum,
  orientation: Orientation,
  tsIDs: TSIDMap,
): D3Data => {
  const nodeSize: [number, number] =
    orientation === "horizontal"
      ? [NODE_SIZE.y, NODE_SIZE.x]
      : [NODE_SIZE.x, NODE_SIZE.y];

  const d3Tree = tree<TreeNodeDatum>()
    .nodeSize(nodeSize)
    .separation((a, b) =>
      a.data.parentId === b.data.parentId
        ? SEPARATION.siblings
        : SEPARATION.nonSiblings,
    );

  const root = hierarchy(data, (d) => d.children);
  const layoutRoot = d3Tree(root);
  const nodes = layoutRoot.descendants();
  const layoutLinks = layoutRoot.links();

  const theIDs = Object.keys(tsIDs);
  if (!theIDs.length) {
    return {
      rootNode: layoutRoot,
      nodes: nodes,
      links: layoutLinks,
    };
  }

  const nodeMap = nodes.reduce(
    (r: Record<ID, HierarchyPointNode<TreeNodeDatum>>, eachNode) => {
      if (!eachNode || !eachNode.id) {
        return r;
      }
      r[eachNode.id] = eachNode;
      return r;
    },
    {},
  );
  const tsIDLinks: HierarchyPointLink<TreeNodeDatum>[] = Object.keys(
    tsIDs,
  ).flatMap((eachID) => {
    const eachNode = nodeMap[eachID];
    if (!eachNode) {
      return [];
    }

    const parentIDs = tsIDs[eachID];
    const eachLinks = parentIDs
      .map((eachParentID) => nodeMap[eachParentID])
      .filter((parentNode) => parentNode)
      .map((parentNode) => ({ source: parentNode, target: eachNode }));
    return eachLinks;
  });

  return {
    rootNode: layoutRoot,
    nodes: nodes,
    links: [...layoutLinks, ...tsIDLinks],
  };
};

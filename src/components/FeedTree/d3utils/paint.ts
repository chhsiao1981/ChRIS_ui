import type { ID, PluginInstance } from "../../../api/types";
import type { D3Data, Transform } from "../types";
import { isNodeInViewport } from "../utils";
import { drawLink, drawNode } from "./draw";

export const paint = (
  canvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  theTransform: Transform,
  d3Data: D3Data,
  statuses: Record<ID, string>,
  isDarkTheme: boolean,
  isToggleLabel: boolean,
  searchFilter: string,
  selectedInstance?: PluginInstance,
) => {
  if (!canvas || !width || !height) {
    return;
  }

  console.info(
    "paint: start: width:",
    width,
    "height:",
    height,
    "statuses:",
    Object.keys(statuses).length,
  );

  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(ratio, ratio);
  ctx.translate(theTransform.x, theTransform.y);
  ctx.scale(theTransform.k, theTransform.k);

  // visibleNodes
  const isLargeTree = d3Data.nodes.length > 50;
  const visibleNodes = isLargeTree
    ? d3Data.nodes.filter((node) =>
        isNodeInViewport(node, theTransform, width, height),
      )
    : d3Data.nodes;

  visibleNodes.forEach((node) => {
    const nodeID = node.data.item.id;
    const polledStatus = statuses[nodeID];
    const finalStatus = polledStatus || node.data.item.status;
    drawNode({
      ctx,
      node,
      isDarkTheme,
      toggleLabel: isToggleLabel,
      search: searchFilter,
      selectedID: selectedInstance?.id,
      status: finalStatus,
    });
  });

  // visibleLinks
  const visibleNodeIDSet = new Set(visibleNodes.map((each) => each.data.id));
  const visibleLinks = isLargeTree
    ? d3Data.links.filter(
        (link) =>
          visibleNodeIDSet.has(link.source.data.id) ||
          visibleNodeIDSet.has(link.target.data.id),
      )
    : d3Data.links;

  visibleLinks.forEach((link) => {
    drawLink(ctx, link, isDarkTheme);
  });

  ctx.restore();
};

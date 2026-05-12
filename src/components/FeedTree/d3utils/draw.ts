import type { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";
import type { ID } from "../../../api/types";
import type { TreeNodeDatum } from "../../../reducers/types";
import { DEFAULT_NODE_RADIUS } from "../constants";

type Props = {
  ctx: CanvasRenderingContext2D;
  node: HierarchyPointNode<TreeNodeDatum>;
  isDarkTheme: boolean;
  toggleLabel: boolean;
  search: string;
  selectedID?: ID;
  status: string | undefined;
};

export const drawNode = (props: Props) => {
  const { ctx, node, isDarkTheme, toggleLabel, search, selectedID, status } =
    props;

  const { x, y } = node;
  const data = node.data;
  const statusColor = getStatusColor(status, data, search);
  const isSelected = selectedID === node.data.id;
  const nodeName = node.data.name || `Node ${node.data.id}`;

  // Calculate scale factor for overlay
  const scaleFactor = 1;

  // Save context state before drawing node
  ctx.save();

  // Limit text rendering for performance
  const shouldRenderText = toggleLabel || isSelected;

  // Draw node (circle)
  ctx.beginPath();
  ctx.arc(x, y, DEFAULT_NODE_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = statusColor;
  ctx.fill();

  // Draw time overlay if needed
  if (scaleFactor > 1) {
    ctx.beginPath();
    ctx.arc(x, y, DEFAULT_NODE_RADIUS * scaleFactor, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw selection indicator if selected
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(x, y, DEFAULT_NODE_RADIUS * 1.3, 0, 2 * Math.PI);
    ctx.strokeStyle = isDarkTheme ? "#fff" : "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Only render text if needed (major performance gain for large trees)
  if (shouldRenderText) {
    ctx.font = "12px Arial";
    const textWidth = ctx.measureText(nodeName).width;
    ctx.fillStyle = isDarkTheme ? "#fff" : "#000";
    ctx.fillText(nodeName, x - textWidth / 2, y + DEFAULT_NODE_RADIUS * 2 + 5);
  }

  // Restore context state after drawing node
  ctx.restore();
};

export const drawLink = (
  ctx: CanvasRenderingContext2D,
  linkData: HierarchyPointLink<TreeNodeDatum>,
  isDarkTheme: boolean,
) => {
  const { source, target } = linkData;
  const nodeRadius = DEFAULT_NODE_RADIUS;
  const isTs = target.data.item?.plugin_type === "ts";
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  const sourceX = source.x + nodeRadius * nx;
  const sourceY = source.y + nodeRadius * ny;
  const childOffset = nodeRadius + 4;
  const targetX = target.x - childOffset * nx;
  const targetY = target.y - childOffset * ny;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = isDarkTheme ? "#F2F9F9" : "#6A6E73";
  ctx.lineWidth = 0.5;
  if (isTs) {
    ctx.setLineDash([4, 2]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();
  drawArrowHead(ctx, sourceX, sourceY, targetX, targetY);
  ctx.restore();
};

export const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  arrowSize = 8,
) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle - Math.PI / 7),
    y2 - arrowSize * Math.sin(angle - Math.PI / 7),
  );
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle + Math.PI / 7),
    y2 - arrowSize * Math.sin(angle + Math.PI / 7),
  );
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle as string;
  ctx.fill();
};

export const getStatusColor = (
  status: string | undefined,
  data: TreeNodeDatum,
  searchFilter: string,
): string => {
  // highlight for search-filter
  if (searchFilter) {
    const term = searchFilter.toLowerCase();
    const pluginName = data.item?.plugin_name?.toLowerCase() || "";
    const title = data.item?.title?.toLowerCase() || "";
    if (pluginName.includes(term) || title.includes(term)) {
      switch (status) {
        case "started":
        case "scheduled":
        case "registeringFiles":
        case "created":
          return "#daedf7";
        case "waiting":
          return "#cacaca";
        case "finishedSuccessfully":
          return "#00eaff";
        case "finishedWithError":
        case "cancelled":
          return "#ff1100";
        default:
          return "#ffd900";
      }
    }
  }

  switch (status) {
    case "started":
    case "scheduled":
    case "registeringFiles":
    case "created":
      return "#a6cee3";
    case "waiting":
      return "#a0a0a0";
    case "finishedSuccessfully":
      return "#004080";
    case "finishedWithError":
    case "cancelled":
      return "#c30e01";
    default:
      return "#eca900";
  }
};

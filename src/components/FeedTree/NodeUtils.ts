import type { PluginInstance } from "../../api/types";
import type { Point, TreeNodeDatum } from "./data";

/**
 * Sets the transform attribute for a node based on its orientation.
 */
export const setNodeTransform = (
  orientation: "horizontal" | "vertical",
  position: Point,
) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};

/**
 * Determines the CSS class for a node based on its status.
 */
export const getStatusClass = (
  status: string | undefined,
  data: TreeNodeDatum,
  pluginInstances: PluginInstance[],
  searchFilter: string,
): string => {
  if (!status) return "";

  let statusClass = "";

  switch (status) {
    case "started":
    case "scheduled":
    case "registeringFiles":
    case "created":
      statusClass = "active";
      break;
    case "waiting":
      statusClass = "queued";
      break;
    case "finishedSuccessfully":
      statusClass = "success";
      break;
    case "finishedWithError":
    case "cancelled":
      statusClass = "error";
      break;
    default:
      break;
  }

  if (
    searchFilter.length > 0 &&
    (data.item?.plugin_name
      ?.toLowerCase()
      .includes(searchFilter.toLowerCase()) ||
      data.item?.title?.toLowerCase().includes(searchFilter.toLowerCase()))
  ) {
    statusClass = "search";
  }

  const previous_id = data.item?.previous_id;
  if (previous_id) {
    const parentNode = pluginInstances.find((node) => node.id === previous_id);

    if (
      parentNode &&
      (parentNode.status === "cancelled" ||
        parentNode.status === "finishedWithError")
    ) {
      statusClass = "notExecuted";
    }
  }

  return statusClass;
};

import api from "../api";
import type { ComputeResource, ID } from "../types";
import type { ListQuery } from "../types/list";

export const getComputeResources = (query: ListQuery<ComputeResource>) =>
  api<ComputeResource[]>({
    endpoint: "/computeresources/",
    query: query,
  });

export const getComputeResourcesByPluginID = (pluginID: ID) =>
  api<ComputeResource[]>({
    endpoint: "/computeresources/",
    query: { plugin_id: `${pluginID}` },
  });

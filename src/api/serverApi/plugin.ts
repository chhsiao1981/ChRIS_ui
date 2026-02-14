import api from "../api";
import type {
  ComputeResource,
  ID,
  List,
  Plugin,
  PluginParameter,
} from "../types";

export const searchPluginsByName = (packageName: string) =>
  api<List<Plugin>>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name: packageName,
    },
  });

export const getPluginParameters = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<PluginParameter[]>({
    endpoint: `/plugins/${pluginID}/parameters/`,
    query: { limit, offset },
  });

export const getPluginComputeResources = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<ComputeResource[]>({
    endpoint: `/plugins/${pluginID}/computeresources/`,
    query: { limit, offset },
  });

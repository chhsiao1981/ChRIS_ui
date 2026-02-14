import api from "../api";
import type { ID, PluginInstance, PluginInstanceParameter } from "../types";

export const getPluginInstances = (
  dataID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<PluginInstance[]>({
    endpoint: `/${dataID}/plugininstances/`,
    method: "get",
    query: {
      offset,
      limit,
    },
  });

export const getWorkflowPluginInstances = (
  workflowID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<PluginInstance[]>({
    endpoint: `/pipelines/workflows/${workflowID}/plugininstances/`,
    method: "get",
    query: {
      offset,
      limit,
    },
  });

export const createPluginInstance = (packageID: ID, theDirs: string[]) =>
  api<PluginInstance>({
    endpoint: `/plugins/${packageID}/instances/`,
    method: "post",
    json: {
      previous_id: null,
      dir: theDirs.join(","),
    },
  });

export const getPluginInstanceParameters = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<PluginInstanceParameter[]>({
    endpoint: `/plugins/instances/${pluginID}/parameters/`,
    query: { limit, offset },
  });

import api from "../api";
import type {
  ID,
  List,
  PluginInstance,
  PluginInstanceParameter,
} from "../types";

export const getPluginInstanceList = (
  dataID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<List<PluginInstance>>({
    endpoint: `/${dataID}/plugininstances/`,
    method: "get",
    query: {
      offset,
      limit,
    },
    isJson: true,
  });

export const getPluginInstanceListByWorkflow = (
  workflowID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<List<PluginInstance>>({
    endpoint: `/pipelines/workflows/${workflowID}/plugininstances/`,
    method: "get",
    query: {
      offset,
      limit,
    },
    isJson: true,
  });

export const createPluginInstanceByDirs = (theID: ID, theDirs: string[]) =>
  api<PluginInstance>({
    endpoint: `/plugins/${theID}/instances/`,
    method: "post",
    json: {
      previous_id: null,
      dir: theDirs.join(","),
    },
    isJson: true,
  });

export const createPluginInstance = (
  pluginID: ID,
  pluginInstance: Partial<PluginInstance>,
) =>
  api<PluginInstance>({
    endpoint: `/plugins/${pluginID}/instances/`,
    method: "post",
    json: pluginInstance,
    isJson: true,
  });

export const getPluginInstanceParameterList = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<List<PluginInstanceParameter>>({
    endpoint: `/plugins/instances/${pluginID}/parameters/`,
    query: { limit, offset },
    isJson: true,
  });

export const getPluginInstance = (theID: ID) =>
  api<PluginInstance>({
    endpoint: `/plugins/instances/${theID}/`,
    isJson: true,
  });

export const deletePluginInstance = (theID: ID) =>
  api<PluginInstance>({
    endpoint: `/plugins/instances/${theID}/`,
    method: "delete",
    isJson: true,
  });

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

export const getPluginInstanceParameters = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<PluginInstanceParameter[]>({
    endpoint: `/plugins/instances/${pluginID}/parameters/`,
    query: { limit, offset },
  });

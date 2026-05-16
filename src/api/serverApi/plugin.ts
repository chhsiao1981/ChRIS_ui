import api from "../api";
import fetchAll from "../fetchAll";
import type {
  ComputeResource,
  ID,
  List,
  Plugin,
  PluginParameter,
} from "../types";
import type { ListQuery } from "../types/list";

export const searchPluginsByName = (name: string) =>
  api<List<Plugin>>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name,
    },
  });

export const getPlugins = (query: ListQuery<Plugin>) =>
  api<List<Plugin>>({
    endpoint: "/plugins/search/",
    method: "get",
    query: query,
  });

export const getPlugin = (pluginID: ID) =>
  api<Plugin>({
    endpoint: `/plugins/${pluginID}/`,
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

export const getPluginParameterList = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<List<PluginParameter>>({
    endpoint: `/plugins/${pluginID}/parameters/`,
    query: { limit, offset },
    isJson: true,
  });

export const getAllPluginParameterList = (pluginID: ID) =>
  fetchAll<PluginParameter>(`/plugins/${pluginID}/parameters/`);

export const getPluginComputeResources = (
  pluginID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<ComputeResource[]>({
    endpoint: `/plugins/${pluginID}/computeresources/`,
    query: { limit, offset },
  });

export const getPluginsByPluginMeta = (
  metaID: ID,
  offset: number = 0,
  limit: number = 1000,
) =>
  api<Plugin[]>({
    endpoint: `/plugins/metas/${metaID}/plugins/`,
    query: { offset, limit },
  });

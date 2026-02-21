import api from "../api";
import type { ID, PluginMeta } from "../types";
import type { ListQuery } from "../types/list";

export const getPluginMeta = (metaID: ID) =>
  api<PluginMeta>({
    endpoint: `/plugins/metas/${metaID}/`,
  });

export const getPluginMetas = (query: ListQuery<PluginMeta>) =>
  api<PluginMeta[]>({
    endpoint: `/plugins/metas/`,
    query: query,
  });

import api from "../api";
import type { ID, PluginMeta } from "../types";

export const getPluginMeta = (metaID: ID) =>
  api<PluginMeta>({
    endpoint: `/plugins/metas/${metaID}/`,
  });

import api from "../api";
import type { DataTag } from "../types";

export const getDataTags = (username = "", name = "") =>
  api<DataTag[]>({
    endpoint: `/tags/search/`,
    method: "get",
    query: {
      name,
      owner_username: username,
    },
  });

export const createDataTag = (username: string, name: string) =>
  api<DataTag[]>({
    endpoint: `/tags`,
    method: "post",
    json: {
      name,
      owner_username: username,
    },
  });

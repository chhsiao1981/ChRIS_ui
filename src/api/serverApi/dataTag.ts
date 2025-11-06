import api from "../api";
import type { DataTag } from "../types";

export const getDataTags = (username = "", name = "") => {
  const query: any = {};
  if (username) {
    query.owner_username = username;
  }
  if (name) {
    query.name = name;
  }

  return api<DataTag[]>({
    endpoint: `/tags/search/`,
    method: "get",
    query,
  });
};

export const createDataTag = (username: string, name: string, color = "gray") =>
  api<DataTag[]>({
    endpoint: `/tags/`,
    method: "post",
    json: {
      name,
      owner_username: username,
      color,
    },
  });

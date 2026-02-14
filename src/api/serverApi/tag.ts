import api from "../api";
import type { Tag } from "../types";

export const getTags = (
  username = "",
  name = "",
  offset: number = 0,
  limit: number = 30,
) => {
  const query: any = {
    offset,
    limit,
  };
  if (username) {
    query.owner_username = username;
  }
  if (name) {
    query.name = name;
  }

  return api<Tag[]>({
    endpoint: `/tags/search/`,
    method: "get",
    query,
  });
};

export const createTag = (username: string, name: string, color = "gray") =>
  api<Tag[]>({
    endpoint: `/tags/`,
    method: "post",
    json: {
      name,
      owner_username: username,
      color,
    },
  });

import api, { type ApiResult } from "../api";
import type { Feed, ID } from "../types";
import { createPluginInstance } from "./pluginInstance";

export const getFeed = (dataID: ID) =>
  api<Feed>({
    endpoint: `/${dataID}/`,
    method: "get",
  });

export const getFeeds = (
  searchType?: string,
  search?: string,
  offset: number = 0,
  limit: number = 100,
) => {
  const query: any = {
    offset,
    limit,
  };
  if (searchType) {
    query[searchType] = search;
  }
  return api<Feed[]>({
    endpoint: `/`,
    method: "get",
    query,
  });
};

export const updateFeedName = (dataID: ID, dataName: string) =>
  api<Feed>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      name: dataName,
    },
  });

export const updateFeedPublic = (dataID: ID, isPublic = true) =>
  api<Feed>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      public: isPublic,
    },
  });

export const createFeedWithFilepaths = async (
  filepaths: string[],
  theName: string,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: not using tags for now.
  tags?: string[],
  isPublic: boolean = false,
): Promise<ApiResult<Feed>> => {
  const { status, data, errmsg } = await createPluginInstance(1, filepaths);
  if (!data) {
    return {
      errmsg,
      status,
    };
  }

  const { feed_id: dataID } = data;

  await updateFeedName(dataID, theName);

  if (isPublic) {
    await updateFeedPublic(dataID, true);
  }

  const dataResult = await getFeed(dataID);

  return dataResult;
};

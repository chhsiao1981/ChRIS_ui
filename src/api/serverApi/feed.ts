import api, { type ApiResult } from "../api";
import type { Feed, ID, List } from "../types";
import type { FeedSearchType } from "../types/feed";
import { createPluginInstanceByDirs } from "./pluginInstance";

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

export const getFeedList = (
  searchType?: FeedSearchType,
  search?: string,
  offset: number = 0,
  limit: number = 100,
  isPublic: boolean = false,
) => {
  if (isPublic) {
    return getPublicFeedList(searchType, search, offset, limit);
  }

  const query: any = {
    offset,
    limit,
  };
  if (searchType && search) {
    query[searchType] = search;
  }
  return api<List<Feed>>({
    endpoint: `/`,
    method: "get",
    query,
    isList: true,
  });
};

const getPublicFeedList = (
  searchType?: FeedSearchType,
  search?: string,
  offset: number = 0,
  limit: number = 100,
) => {
  const query: any = {
    offset,
    limit,
  };
  if (searchType && search) {
    query[searchType] = search;
  }
  return api<List<Feed>>({
    endpoint: `/publicfeeds/`,
    method: "get",
    query,
    isList: true,
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
  const { status, data, errmsg } = await createPluginInstanceByDirs(
    1,
    filepaths,
  );
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

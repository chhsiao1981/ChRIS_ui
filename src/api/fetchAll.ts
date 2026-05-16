import type { ApiResult } from "./api";
import api from "./api";
import type { List } from "./types";

export default async <T>(endpoint: string): Promise<ApiResult<List<T>>> => {
  const params = {
    endpoint,
    query: { offset: 0, limit: 20 },
    isJson: true,
  };
  const { status, data, errmsg } = await api<List<T>>(params);
  if (errmsg) {
    return { status, errmsg };
  }
  if (!data) {
    return { status: 599, errmsg: "unable to get data" };
  }

  while (data.next) {
    params.query.offset += params.query.limit;
    const {
      status: eachStatus,
      data: eachData,
      errmsg: eachErrmsg,
    } = await api<List<T>>(params);
    if (eachErrmsg) {
      return { status: eachStatus, errmsg: eachErrmsg };
    }
    if (!eachData) {
      return { status: 599, errmsg: "unable to get data" };
    }

    data.results = data.results.concat(eachData.results);
    data.next = eachData.next;
  }
  if (data.count !== data.results.length) {
    return {
      status: 599,
      errmsg: `count does not match results: count: ${data.count} results: ${data.results.length}`,
    };
  }

  return { status: 200, data };
};

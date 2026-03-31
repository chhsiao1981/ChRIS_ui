import type { ApiParams, ApiResult } from "./api";
import api from "./api";
import type { List } from "./types";

export default async <T>(params: ApiParams): Promise<ApiResult<List<T>>> => {
  if (!params.query) {
    params.query = { limit: 20, offset: 0 };
  }
  const { status, data, errmsg } = await api<List<T>>(params);
  if (errmsg) {
    return { status, errmsg };
  }
  if (!data) {
    return { status: 599, errmsg: "unable to get data" };
  }
  const ret = Object.assign({}, data);

  while (ret.next) {
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

    ret.results = ret.results.concat(eachData.results);
    ret.next = eachData.next;
  }
  ret.count = ret.results.length;

  return { status: 200, data: ret, errmsg };
};

import type { ApiResult } from "./api";

export default async <T>(
  func: (...params: any) => Promise<ApiResult<T>>,
  ...params: any
) => {
  const { status, data, errmsg } = await func(...params);
  if (errmsg) {
    return undefined;
  }
  if (status >= 400) {
    return undefined;
  }
  return data;
};

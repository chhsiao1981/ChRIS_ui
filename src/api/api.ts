import config from "config";
import { Cookies } from "react-cookie";
import { collectionJsonToJson } from "./collectionToJson";

export type Query = Record<string, any>;

export type Params = Record<string, any>;

export type Files = Record<string, any>;

export interface ApiParams {
  endpoint: string;
  method?: string;
  query?: Query;
  queryString?: string;
  params?: Params;
  json?: any;
  headers?: any;
  filename?: string;
  filetext?: string;
  apiroot?: string;
  isJson?: boolean;
  isLink?: boolean;
  isSignUpLogin?: boolean;
  isList?: boolean;
}

export interface ApiResult<T> {
  status: number;
  data?: T;
  errmsg?: string;
  text?: string;
  blob?: Blob;
}

const serialize = (data: any): string => {
  let dataStr = data;
  if (typeof data === "object") {
    dataStr = JSON.stringify(data);
  }

  return encodeURIComponent(dataStr);
};

const queryToString = (query: Query | Params) =>
  Object.keys(query)
    .map((k) => `${serialize(k)}=${serialize(query[k])}`)
    .join("&");

let _COOKIE: any = null;

export const refreshCookie = () => {
  _COOKIE = new Cookies(null);
};

export const getToken = () => {
  if (!_COOKIE) {
    _COOKIE = new Cookies(_COOKIE);
  }
  const username = _COOKIE.get("username");
  const token: string = _COOKIE.get(`${username}_token`);
  return token;
};

export const sanitizeAPIRootURL = (apiroot: string) => {
  if (apiroot.length >= 1 && apiroot[apiroot.length - 1] === "/") {
    return apiroot.slice(0, apiroot.length - 1);
  }

  return apiroot;
};

export default async <T>(apiParams: ApiParams): Promise<ApiResult<T>> => {
  const {
    endpoint,
    query,
    queryString,
    method = "get",
    params,
    json,
    headers: paramsHeaders,
    filename,
    filetext: paramsFiletext,
    apiroot: paramsAPIRoot,
    isJson,
    isLink,
    isSignUpLogin,
    isList,
  } = apiParams;

  const { API_ROOT: CONFIG_API_ROOT } = config;

  const default_api_root = window.location.origin;

  const theAPIRootURL = paramsAPIRoot || CONFIG_API_ROOT || default_api_root;
  const API_ROOT = sanitizeAPIRootURL(theAPIRootURL);

  let theEndpoint = endpoint;
  if (!theEndpoint.includes(API_ROOT)) {
    theEndpoint = `${API_ROOT}${endpoint}`;
  }

  if (query) {
    theEndpoint = `${theEndpoint}?${queryToString(query)}`;
  }

  if (queryString) {
    theEndpoint = `${theEndpoint}${queryString}`;
  }

  // XXX special case for uploading files.
  if (filename) {
    const filetext = paramsFiletext || "";
    return await postFile(theEndpoint, filename, filetext);
  }

  // init header with token
  const headers: HeadersInit = {};

  if (!isSignUpLogin) {
    const token = getToken();
    headers.Authorization = `Token ${token}`;
  }

  // setup body
  let body: string | undefined;
  if (params) {
    const paramsStr = queryToString(params);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = paramsStr;
  } else if (json) {
    body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }

  if (isJson) {
    headers.Accept = "application/json";
  }

  // post-setup header
  const theHeaders = paramsHeaders || {};
  Object.assign(headers, theHeaders);

  const options: RequestInit = {
    method,
    headers,
    body,
  };

  return await fetchCore<T>(theEndpoint, options, isJson, isLink, isList);
};

const postFile = async <T>(
  theEndpoint: string,
  filename: string,
  filetext: string,
) => {
  const blob = new Blob([filetext], { type: "text/plain" });
  const formData = new FormData();
  formData.append(filename, blob, filename);

  const token = getToken();

  const headers: HeadersInit = {
    Authorization: `Token ${token}`,
    Accept: "application/json",
  };

  return await fetchCore<T>(
    theEndpoint,
    { method: "POST", headers, body: formData },
    true,
  );
};

const fetchCore = async <T>(
  endpoint: string,
  options: RequestInit,
  isJson = false,
  isLink = false,
  isList = false,
): Promise<ApiResult<T>> => {
  return await fetch(endpoint, options)
    .then((res) => {
      const status = res.status;
      return res
        .json()
        .then((collectionJsonData) => {
          if (res.status >= 400) {
            const msg = collectionJsonData.error;
            return { status, errmsg: msg };
          }

          const data: T = isJson
            ? collectionJsonData
            : collectionJsonToJson(
                collectionJsonData,
                isLink,
                isList,
                `fetchCore: endpoint: ${endpoint}`,
              );

          return { status: res.status, data: data };
        })
        .catch((err) => {
          console.error("api.callApi: json: err:", err);

          return { status: 598, errmsg: err.message };
        });
    })
    .catch((err) => {
      return { status: 599, errmsg: err.message };
    });
};

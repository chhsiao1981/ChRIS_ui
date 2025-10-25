import config from "config";
import type { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";
import YAML from "yaml";
import api from "./api";
import { STATUS_OK } from "./constants";
import type { PACSqueryCore } from "./pfdcm";
import { PACSqueryCoreToJSON } from "./pfdcm/generated";
import { createPkgInstance } from "./serverApi/pkgInstance";
import type {
  AuthToken,
  ComputeEnv,
  Data,
  DownloadToken,
  Link,
  List,
  PACSSeries,
  PFDCMResult,
  Pkg,
  PkgInstance,
  PkgNodeInfo,
  PkgParameter,
  UploadPipeline,
  User,
} from "./types";

console.info("api.serverApi: config:", config);

export const createUser = (username: string, password: string, email: string) =>
  api<User>({
    endpoint: "/users/",
    apiroot: config.USER_ROOT,
    json: {
      username,
      password,
      email,
    },
    method: "post",
    isSignUpLogin: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getAuthToken = (username: string, password: string) =>
  api<AuthToken>({
    endpoint: "/auth-token/",
    apiroot: config.AUTH_ROOT,
    json: {
      username,
      password,
    },
    method: "post",
    isSignUpLogin: true,
    isJson: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getUserID = async (): Promise<string> => {
  const { status, data, errmsg } = await getLinkMap();
  if (!data) {
    return "";
  }
  if (status !== STATUS_OK) {
    return "";
  }

  const userLink = data.user;
  if (!userLink) {
    return "";
  }
  const userLinkList = userLink.split("/");
  return userLinkList[userLinkList.length - 2];
};

export const getUser = (userID: string) =>
  api<User>({
    endpoint: `/users/${userID}/`,
  });

export const getLinkMap = () =>
  api<Link>({
    endpoint: "/",
    isLink: true,
    query: { limit: 1 },
  });

export const getData = (dataID: number) =>
  api<Data>({
    endpoint: `/${dataID}/`,
    method: "get",
  });

export const updateDataName = (dataID: number, dataName: string) =>
  api<Data>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      name: dataName,
    },
  });

export const updateDataPublic = (dataID: number, isPublic = true) =>
  api<Data>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      public: isPublic,
    },
  });

export const createWorkflow = (
  pipelineID: number,
  previousPluginInstanceID: number,
  nodesInfo: PkgNodeInfo[],
) =>
  api({
    endpoint: `/pipelines/${pipelineID}/workflows/`,
    method: "post",
    json: {
      template: {
        data: [
          {
            name: "previous_plugin_inst_id",
            value: `${previousPluginInstanceID}`,
          },
          { name: "nodes_info", value: JSON.stringify(nodesInfo) },
        ],
      },
    },
    headers: {
      "Content-Type": "application/vnd.collection+json",
    },
  });

export const createDataWithFilepath = async (
  filepath: string,
  theName: string,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: not using tags for now.
  tags?: string[],
  isPublic: boolean = false,
) => {
  const pluginInstanceResult = await createPkgInstance(1, [filepath]);
  if (!pluginInstanceResult.data) {
    return {
      errmsg: pluginInstanceResult.errmsg,
      status: pluginInstanceResult.status,
    };
  }

  const {
    data: { feed_id: feedID },
  } = pluginInstanceResult;

  await updateDataName(feedID, theName);

  if (isPublic) {
    await updateDataPublic(feedID, true);
  }

  const dataResult = await getData(feedID);

  return dataResult;
};

export const createPipeline = (pipeline: UploadPipeline) =>
  api({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });

export const createDownloadToken = () =>
  api<DownloadToken>({
    endpoint: "/downloadtokens/",
    method: "post",
    json: {
      template: {
        data: [],
      },
    },
  });

import api, { type ApiResult } from "../api";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  ID,
  List,
} from "../types";

export const getFileBrowserFolderListByPath = async (path: string) =>
  api<List<FileBrowserFolder>>({
    endpoint: "/filebrowser/search/",
    query: { path },
    isJson: true,
  });

export const getFileBrowserFolderByPath = async (
  path: string,
): Promise<ApiResult<FileBrowserFolder>> => {
  const {
    status,
    data: folderList,
    errmsg,
  } = await getFileBrowserFolderListByPath(path);
  if (errmsg) {
    return { status, errmsg };
  }
  if (status >= 400) {
    return { status, errmsg };
  }
  if (!folderList || !folderList.results.length) {
    return { status: 597, errmsg: "unable to find folder" };
  }
  const folder = folderList.results[0];
  return { status, data: folder, errmsg };
};

export const getFileBrowserChildrenList = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<List<FileBrowserFolder>>({
    endpoint: `/filebrowser/${theID}/children/`,
    query: { offset, limit },
    isJson: true,
  });

export const getFileBrowserFileList = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<List<FileBrowserFolderFile>>({
    endpoint: `/filebrowser/${theID}/files/`,
    query: { offset, limit },
    isJson: true,
  });

export const getFileBrowserLinkFileList = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<FileBrowserFolderLinkFile[]>({
    endpoint: `/filebrowser/${theID}/linkfiles/`,
    query: { offset, limit },
    isJson: true,
  });

export const getFileBrowserFoldersByPath = (path: string) =>
  api<FileBrowserFolder[]>({
    endpoint: "/filebrowser/search/",
    query: { path },
  });

export const getFileBrowserChildren = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<FileBrowserFolder[]>({
    endpoint: `/filebrowser/${theID}/children/`,
    query: { offset, limit },
  });

export const getFileBrowserFiles = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<FileBrowserFolderFile[]>({
    endpoint: `/filebrowser/${theID}/files/`,
    query: { offset, limit },
  });

export const getFileBrowserLinkFiles = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<FileBrowserFolderLinkFile[]>({
    endpoint: `/filebrowser/${theID}/linkfiles/`,
    query: { offset, limit },
  });

export const updateFileBrowserFolderPath = (theID: ID, path: string) =>
  api<FileBrowserFolder>({
    endpoint: `/filebrowser/${theID}/`,
    method: "put",
    json: {
      path,
    },
  });

export const updateFileBrowserFolderFilePath = (theID: ID, path: string) =>
  api<FileBrowserFolderFile>({
    endpoint: `/filebrowser/files/${theID}/`,
    method: "put",
    json: {
      path,
    },
  });

export const updateFileBrowserFolderLinkFilePath = (theID: ID, path: string) =>
  api<FileBrowserFolderLinkFile>({
    endpoint: `/filebrowser/linkfiles/${theID}/`,
    method: "put",
    json: {
      path,
    },
  });

export const deleteFileBrowserFolder = (theID: ID) =>
  api<FileBrowserFolder>({
    endpoint: `/filebrowser/${theID}/`,
    method: "delete",
  });

export const deleteFileBrowserFolderFile = (theID: ID) =>
  api<FileBrowserFolderFile>({
    endpoint: `/filebrowser/files/${theID}/`,
    method: "delete",
  });

export const deleteFileBrowserFolderLinkFile = (theID: ID) =>
  api<FileBrowserFolderLinkFile>({
    endpoint: `/filebrowser/linkfiles/${theID}/`,
    method: "delete",
  });

export const getLinkedResource = (theID: ID) => {
  api<FileBrowserFolderFile>({
    endpoint: `filebrowser/linkfiles/${theID}/`,
  });
};

import api from "../api";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  ID,
} from "../types";

export const getFileBrowserFolders = (path: string) =>
  api<FileBrowserFolder[]>({
    endpoint: "/filebrowser/search/",
    params: { path },
  });

export const getFileBrowserChildren = (
  theID: ID,
  offset: number = 0,
  limit: number = 20,
) =>
  api<FileBrowserFolder[]>({
    endpoint: `/filebrowser/${theID}/children/`,
    params: { offset, limit },
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

export const getLinkedResource = (theID: ID) => {
  api<FileBrowserFolderFile>({
    endpoint: `filebrowser/linkfiles/${theID}/`,
  });
};

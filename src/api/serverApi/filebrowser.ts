import api from "../api";
import type { FileBrowserFolder, ID } from "../types";

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

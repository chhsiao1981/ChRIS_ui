import pagination from "antd/es/pagination";
import { fold } from "../../../../node_modules.docker/fp-ts/es6/Tree";
import { children } from "../../../../node_modules.docker/happy-dom/cjs/PropertySymbol";
import ChrisAPIClient from "../../../api/chrisapiclient";
import {
  getFileBrowserChildren,
  getFileBrowserFolders,
} from "../../../api/serverApi/filebrowser";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";

export default async (computedPath: string, pageNumber?: number) => {
  const client = ChrisAPIClient.getClient();

  const errorMessages: string[] = [];

  try {
    const { status, data, errmsg } = await getFileBrowserFolders(computedPath);
    const folders = data || [];
    if (!folders.length) {
      return;
    }
    const folder = folders[0];
    if (!folder) {
      return;
    }

    let linkFilesMap: FileBrowserFolderLinkFile[] = [];
    let filesMap: FileBrowserFolderFile[] = [];
    const initialPaginateValue = {
      totalCount: 0,
      hasNextPage: false,
    };
    let filesPagination = initialPaginateValue;
    let foldersPagination = initialPaginateValue;
    let linksPagination = initialPaginateValue;

    const limit = pageNumber ? pageNumber * 50 : 100;
    const pagination = {
      limit,
      offset: 0,
    };

    try {
      const {
        status: _status2,
        data,
        errmsg: _errmsg2,
      } = await getFileBrowserChildren(folder.id);

      const subFoldersMap = data || [];
      foldersPagination = {
        totalCount: 0,
        hasNextPage: subFoldersMap.length === limit,
      };
    } catch (error) {
      console.error("Error fetching folder children:", error);
      errorMessages.push("Failed to fetch subfolders.");
    }

    try {
      const linkFiles = await folder.getLinkFiles(pagination);
      linkFilesMap = linkFiles.getItems();
      linksPagination = {
        totalCount: linkFiles.totalCount,
        hasNextPage: linkFiles.hasNextPage,
      };
    } catch (error) {
      console.error("Error fetching link files:", error);
      errorMessages.push("Failed to fetch link files.");
    }

    try {
      const folderFiles = await folder.getFiles(pagination);
      filesMap = folderFiles.getItems();
      filesPagination = {
        totalCount: folderFiles.totalCount,
        hasNextPage: folderFiles.hasNextPage,
      };
    } catch (error) {
      errorMessages.push("Failed to fetch files.");
    }

    return {
      subFoldersMap,
      linkFilesMap,
      filesMap,
      filesPagination,
      foldersPagination,
      linksPagination,
      folderList, // return folderList to enable creating new folders
      errorMessages, // return any error messages encountered
    };
  } catch (e) {
    errorMessages.push("Failed to load folder list.");
    return { errorMessages }; // return errors in case the request fails entirely
  }
};

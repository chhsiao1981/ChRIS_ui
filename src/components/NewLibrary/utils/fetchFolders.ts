import {
  getFileBrowserChildren,
  getFileBrowserFiles,
  getFileBrowserFoldersByPath,
  getFileBrowserLinkFiles,
} from "../../../api/serverApi/filebrowser";

export default async (computedPath: string, pageNumber?: number) => {
  const errorMessages: string[] = [];

  const { status, data, errmsg } =
    await getFileBrowserFoldersByPath(computedPath);
  const folders = data || [];
  if (!folders.length) {
    return;
  }
  const folder = folders[0];
  if (!folder) {
    return;
  }

  const initialPaginateValue = {
    totalCount: 0,
    hasNextPage: false,
  };
  const filesPagination = initialPaginateValue;
  let foldersPagination = initialPaginateValue;
  const linksPagination = initialPaginateValue;

  const limit = pageNumber ? pageNumber * 50 : 100;

  const {
    status: _status2,
    data: data2,
    errmsg: _errmsg2,
  } = await getFileBrowserChildren(folder.id);

  const subFoldersMap = data2 || [];
  foldersPagination = {
    totalCount: 0,
    hasNextPage: subFoldersMap.length === limit,
  };

  const {
    status: _status3,
    data: data3,
    errmsg: _errmsg3,
  } = await getFileBrowserLinkFiles(folder.id);

  const linkFilesMap = data3 || [];

  const {
    status: _status4,
    data: data4,
    errmsg: _errmgs4,
  } = await getFileBrowserFiles(folder.id);

  const filesMap = data4 || [];

  return {
    subFoldersMap,
    linkFilesMap,
    filesMap,
    filesPagination,
    foldersPagination,
    linksPagination,
    folders, // return folderList to enable creating new folders
    errorMessages, // return any error messages encountered
  };
};

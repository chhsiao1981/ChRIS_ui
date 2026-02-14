import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types";

export interface FilesPayload {
  filesMap?: FileBrowserFolderFile[];
  subFoldersMap?: FileBrowserFolder[];
  linkFilesMap?: FileBrowserFolderLinkFile[];
  folderList?: FileBrowserFolder[];
  filesPagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };
  linksPagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };
  foldersPagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };
}

export interface Label {
  [key: string]: boolean;
}

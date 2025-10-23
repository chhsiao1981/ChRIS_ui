import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";

export const getFileName = (
  file: FileBrowserFolderFile | FileBrowserFolderLinkFile,
) => {
  return file.fname.split("/").pop() || "";
};

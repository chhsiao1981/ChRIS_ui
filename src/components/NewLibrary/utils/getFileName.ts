import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";

export default (file: FileBrowserFolderFile | FileBrowserFolderLinkFile) => {
  return file.fname.split("/").pop() || "";
};

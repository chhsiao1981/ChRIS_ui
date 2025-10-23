import type { FileBrowserFolderLinkFile } from "../../../api/types";

export default (file: FileBrowserFolderLinkFile) => {
  return file.path.split("/").pop() || "";
};

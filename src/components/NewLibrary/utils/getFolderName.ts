import type { FileBrowserFolder } from "../../../api/types";

export default (folder: FileBrowserFolder, computedPath: string) => {
  const folderPathParts = folder.path.split("/");
  const pathName = folderPathParts[folderPathParts.length - 1];
  const folderName = computedPath === "/" ? folder.path : pathName;
  return folderName;
};

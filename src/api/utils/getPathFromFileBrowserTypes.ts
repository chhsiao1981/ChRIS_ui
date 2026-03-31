import type {
  FileBrowserFolderType,
  FileBrowserType,
} from "../types/fileBrowser";

export default (
  fileBrowser: FileBrowserFolderType,
  fileBrowserType: FileBrowserType,
) => {
  // @ts-expect-error special treat for FileBrowserFolder
  return fileBrowserType === "file" ? fileBrowser.fname : fileBrowser.path;
};

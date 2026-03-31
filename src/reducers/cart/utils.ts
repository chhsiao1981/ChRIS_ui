import { getFileName } from "../../api/common";
import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types";
import type { FileBrowserFolderType } from "../../api/types/fileBrowser";
import type { CartSelection } from "../types";

export const feedToCartSelection = (feed: Feed): CartSelection => {
  return {
    path: feed.folder_path,
    type: "feed",
    isPublic: feed.public,
    name: feed.name,
    rawData: feed,
  };
};

export const fileBrowserFolderToCartSelection = (
  folder: FileBrowserFolder,
): CartSelection => {
  return {
    path: folder.path,
    type: "folder",
    isPublic: folder.public,
    name: getFileName(folder.path),
    rawData: folder,
  };
};

export const fileBrowserToCartSelection = (
  theFile: FileBrowserFolderType,
): CartSelection => {
  // @ts-expect-error fname or path
  const path = theFile.fname ? theFile.fname : theFile.path;
  return {
    path: path,
    type: "folder",
    isPublic: theFile.public,
    name: getFileName(path),
    rawData: theFile,
  };
};

export const fileBrowserLinkFileToCartSelection = (
  theFile: FileBrowserFolderLinkFile,
): CartSelection => {
  return {
    path: theFile.path,
    type: "folder",
    isPublic: theFile.public,
    name: getFileName(theFile.path),
    rawData: theFile,
  };
};

export const fileBrowserFileToCartSelection = (
  theFile: FileBrowserFolderFile,
): CartSelection => {
  return {
    path: theFile.fname,
    type: "folder",
    isPublic: theFile.public,
    name: getFileName(theFile.fname),
    rawData: theFile,
  };
};

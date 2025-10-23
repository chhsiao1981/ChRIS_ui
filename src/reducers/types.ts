import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../api/types";

export enum Role {
  Guest = "a guest",

  Clinician = "a clinician",
  Researcher = "a researcher",
  Admin = "an admin",

  DefaultRole = Guest,
}

export const Roles = [Role.Clinician, Role.Researcher];

export const StaffRoles = [Role.Clinician, Role.Researcher, Role.Admin];

export enum CartLayout {
  Grid = "grid",
  List = "list",
}

export enum PathType {
  Folder = "folder",
  FolderFile = "file",
  FolderLinkFile = "linkFile",
  File = "file",
  Link = "linkFile",
}

export type PayloadType =
  | FileBrowserFolder
  | FileBrowserFolderFile
  | FileBrowserFolderLinkFile;

export interface SelectedPath {
  path: string;
  type: PathType;
  payload: PayloadType;
}

export enum UploadStep {
  Complete = "Upload Complete",
}

export type FolderUploadObject = {
  currentStep: UploadStep;
  done: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: PathType;
};

export type FileUploadObject = {
  currentStep: UploadStep;
  progress: number;
  loaded: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: PathType;
};

export interface FolderUpload {
  [path: string]: FolderUploadObject;
}

export interface FileUpload {
  [path: string]: FileUploadObject;
}

export enum DownloadStep {
  started = "started",
  progress = "processing",
  finished = "finished",
  cancelled = "cancelled",
}

export type DownloadStatus = {
  [path: string]: {
    step: DownloadStep;
    error?: string;
    filename?: string;
    feed?: Feed;
  };
};

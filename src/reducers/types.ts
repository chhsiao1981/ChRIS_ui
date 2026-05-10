import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  ID,
  ID,
} from "../api/types";
import type { FileBrowserType } from "../api/types/fileBrowser";

export enum Role {
  Guest = "a guest",

  Clinician = "a clinician",
  Researcher = "a researcher",
  Admin = "an admin",

  DefaultRole = Guest,
}

export const Roles = [Role.Clinician, Role.Researcher];

export const StaffRoles = [Role.Clinician, Role.Researcher, Role.Admin];

export type FolderUpload = {
  currentStep: string;
  done: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: FileBrowserType;
};

export type FileUploadStepType =
  | "Uploading..."
  | "Upload Complete"
  | "Upload Cancelled"
  | "Error";

export type FileUpload = {
  currentStep: FileUploadStepType;
  progress: number;
  loaded: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: FileBrowserType;
};

export interface FolderUploadMap {
  [path: string]: FolderUpload;
}

export interface FileUploadMap {
  [path: string]: FileUpload;
}

export type DownloadStepType =
  | "started"
  | "processing"
  | "finished"
  | "cancelled";

export type DownloadStatus = {
  step: DownloadStepType;
  error?: string;
  filename?: string;
  feed?: Feed;
};

export type DownloadStatusMap = {
  [path: string]: DownloadStatus;
};

export interface FeedCreationStatus {
  type: string;
  folder_path: string;
  feed_id: number;
}

export type CartSelectionDataType =
  | Feed
  | FileBrowserFolder
  | FileBrowserFolderFile
  | FileBrowserFolderLinkFile;

export type CartSelectionType = FileBrowserType | "feed";

export interface CartSelection {
  path: string;
  type: CartSelectionType;
  isPublic: boolean;
  name: string;
  rawData?: CartSelectionDataType;
}

export interface PluginNodeParameter {
  flag: string;
  value: string;
  type: string;
  placeholder: string;
}

export interface PluginNodeParameterMap {
  [key: string]: PluginNodeParameter;
}

export type TSID = Record<ID, ID[]>;

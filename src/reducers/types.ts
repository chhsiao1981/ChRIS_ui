import type { Data } from "../api/types";

export enum Role {
  Guest = "a guest",

  Clinician = "a clinician",
  Researcher = "a researcher",
  Admin = "an admin",

  DefaultRole = Guest,
}

export const Roles = [Role.Clinician, Role.Researcher];

export const StaffRoles = [Role.Clinician, Role.Researcher, Role.Admin];

export type FolderUploadObject = {
  currentStep: string;
  done: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: string;
};

export type FileUploadObject = {
  currentStep: string;
  progress: number;
  loaded: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: string;
};

export interface FolderUpload {
  [key: string]: FolderUploadObject;
}

export interface FileUpload {
  [key: string]: FileUploadObject;
}

export enum DownloadTypes {
  started = "started",
  progress = "processing",
  finished = "finished",
  cancelled = "cancelled",
}

export type DownloadStatusObject = {
  step: DownloadTypes;
  error?: string;
  filename?: string;
  feed?: Data;
};

export type DownloadStatus = {
  [theID: number]: DownloadStatusObject;
};

export interface FeedCreationStatus {
  type: string;
  folder_path: string;
  feed_id: number;
}

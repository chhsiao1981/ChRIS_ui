import type { Datetime } from "./datetime";

export type FileBrowserFolder = {
  id: number;
  creation_date: Datetime;
  path: string;
  public: boolean;
  owner_username: string;
};

export type FileBrowserFolderFile = {
  id: number;
  creation_date: Datetime;
  fname: string;
  fsize: number;
  public: boolean;
  owner_username: string;
};

export type FileBrowserFolderLinkFile = {
  id: number;
  creation_date: Datetime;
  path: string;
  fname: string;
  fsize: number;
  public: boolean;
  owner_username: string;
};

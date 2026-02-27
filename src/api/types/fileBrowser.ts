import type { Datetime } from "./datetime";
import type { ID } from "./id";

export type FileBrowserType = "file" | "folder" | "link";

export type FileBrowserFolder = {
  id: ID;
  creation_date: Datetime;
  path: string;
  public: boolean;
  owner_username: string;
};

export type FileBrowserFolderFile = {
  id: ID;
  creation_date: Datetime;
  fname: string;
  fsize: number;
  public: boolean;
  owner_username: string;
};

export type FileBrowserFolderLinkFile = {
  id: ID;
  creation_date: Datetime;
  path: string;
  fname: string;
  fsize: number;
  public: boolean;
  owner_username: string;
};

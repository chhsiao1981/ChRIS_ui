import type { ID } from "./id";

export interface DownloadToken {
  id: ID;
  creation_date: string;
  token: string;
  owner_username: string;
}

export interface Link {
  [key: string]: string;
}

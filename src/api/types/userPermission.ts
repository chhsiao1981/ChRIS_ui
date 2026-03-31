import type { ID } from "./id";

export interface FeedUserPermission {
  id: ID;
  username: string;
}

export interface UserPermission {
  id: ID;
  username: string;
  permission: string;
}

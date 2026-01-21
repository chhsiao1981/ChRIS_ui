import type { ID } from "./id";

export interface User {
  id: ID;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface UserInfo {
  username: string;
  is_admin: boolean;
}

export interface AuthToken {
  token: string;
}

export interface UserAuthToken {
  username: string;
  email: string;
  is_staff: boolean;
  token: string;
}

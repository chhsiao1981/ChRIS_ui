import type { ID } from "./id";

export interface Tag {
  id: ID;
  name: string;
  color: string;
  owner_username: string;
}

import type { ID } from "./id";
import type { UploadPkgNodeInfo } from "./pkgNode";

export interface Pipeline {
  id: ID;
  owner_username: string;
  name: string;
  name_exact: string;
  category: string;
  description: string;
  authors: string;
  min_creation_date: string;
  max_creation_date: string;
}

export interface UploadPipeline {
  name: string;
  authors: string;
  category: string;
  description: string;
  locked: boolean;
  plugin_tree: UploadPkgNodeInfo[];
}

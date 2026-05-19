import type { Datetime } from "./datetime";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "./fileBrowser";
import type { ID } from "./id";
import type { List } from "./list";
import type { Plugin, PluginParameter, PluginType } from "./plugin";

export enum InstanceStatus {
  SUCCESS = "finishedSuccessfully",
  CANCELLED = "cancelled",
  FINISHED_WITH_ERROR = "finishedWithError",
  STARTED = "started",
  SCHEDULED = "scheduled",
  REGISTERING_FILES = "registeringFiles",
  CREATED = "created",
  WAITING = "waiting",
  UNKNOWN_ERROR = "unknownError",
}

// legacy: instance
export interface Instance {
  id: ID;
  title: string;
  previous_id: ID | null;
  compute_resource_name: string;
  plugin_id: ID;
  plugin_name: string;
  plugin_version: string;
  plugin_type: PluginType;
  feed_id: ID;
  start_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  end_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  output_path: string;
  status: InstanceStatus;
  pipeline_id: ID;
  pipeline_name: string;
  workflow_id: ID;
  summary: string;
  raw: string;
  owner_username: string;
  cpu_limit: number;
  memory_limit: number;
  number_of_workers: number;
  gpu_limit: number;
  size: number;
  error_code: string;
  plugin?: Plugin; // XXX plugin
  pluginParams?: PluginParameter[]; // XXX pluginParams
  instanceParams?: InstanceParameter[]; // XXX instanceParams

  [param_name: string]: any; // XXX for parameter naming-injection.
}

export interface InstanceParameter {
  id: ID;
  param_name: string;
  value: string;
  type: string;
}

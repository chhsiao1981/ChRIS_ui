import type { Datetime } from "./datetime";
import type { ID } from "./id";
import type { PluginType } from "./plugin";

export enum PluginInstanceStatus {
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

// legacy: plugin-instance
export interface PluginInstance {
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
  status: PluginInstanceStatus;
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
  [param_name: string]: any; // for parameters // XXX naming-injection.
}

export interface PluginInstanceParameter {
  id: ID;
  param_name: string;
  value: string;
  type: string;
}

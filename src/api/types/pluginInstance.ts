import type { Datetime } from "./datetime";
import type { ID } from "./id";

export enum PluginInstanceStatus {
  SUCCESS = "finishedSuccessfully",
  CANCELLED = "cancelled",
  FINISHED_WITH_ERROR = "finishedWithError",
  STARTED = "started",
  SCHEDULED = "scheduled",
  REGISTERING_FILES = "registeringFiles",
  CREATED = "created",
  WAITING = "waiting",
}

// legacy: plugin-instance
export interface PluginInstance {
  id: ID;
  title: string;
  previous_id: number;
  compute_resource_name: string;
  plugin_id: ID;
  plugin_name: string;
  plugin_version: string;
  plugin_type: string;
  feed_id: ID;
  start_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  end_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  output_path: string;
  status: PluginInstanceStatus;
  pipeline_id: ID;
}

export interface PluginInstanceParameter {
  id: ID;
  param_name: string;
  value: string;
  type: string;
}

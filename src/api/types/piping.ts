import type { ID } from "./id";
import type { PluginDefaultParameter } from "./plugin";

// legacy: piping
export interface Piping {
  id: ID;
  pipeline_id: ID;
  plugin_id: ID;
  plugin_name: string;
  plugin_version: string;
  title: string;
  previous_id: ID | null;
}

export interface PipingInfo {
  piping_id: ID;
  previous_piping_id: ID | null;
  compute_resource_name: string;
  title: string;
  plugin_parameter_defaults?: PluginDefaultParameter[];
}

// legacy: pipeline-default-parameter
export interface PipingDefaultParameter {
  id: ID;
  param_id: ID;
  param_name: string;
  plugin_id: ID;
  plugin_name: string;
  plugin_piping_id: ID;
  plugin_piping_title: string;
  plugin_version: string;
  previous_plugin_piping_id: ID | null;
  type: string;
  value: any;
}

export interface UploadPipingInfo {
  title: string;
  previous: string | null;
  plugin: string;
  plugin_parameter_defaults?: { [key: string | number]: any };
}

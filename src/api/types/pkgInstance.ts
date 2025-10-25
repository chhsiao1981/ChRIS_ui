import type { ID } from "./id";

export enum PkgInstanceStatus {
  SUCCESS = "finishedSuccessfully",
}

// legacy: // plugin-instance
export interface PkgInstance {
  id: ID;
  title: string;
  previous_id: ID;
  compute_resource_name: string;
  plugin_id: ID;
  plugin_name: string;
  plugin_version: string;
  plugin_type: string;
  feed_id: ID;
  start_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  end_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  output_path: string;
  status: PkgInstanceStatus;
  pipeline_id: ID;
}

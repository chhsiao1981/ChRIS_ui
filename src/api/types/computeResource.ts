import type { Datetime } from "./datetime";
import type { ID } from "./id";

export interface ComputeResource {
  id: ID;
  creation_date: Datetime;
  modification_date: Datetime;
  name: string;
  compute_url: string;
  compute_auth_url: string;
  compute_innetwork: boolean;
  description: string;
  max_job_exec_seconds: number;
}

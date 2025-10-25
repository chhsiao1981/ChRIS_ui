import type { ID } from "./id";

export interface ComputeEnv {
  id: ID;
  creation_date: string;
  modification_date: string;
  name: string;
  compute_url: string;
  compute_auth_url: string;
  compute_innetwork: boolean;
  description: string;
  max_job_exec_seconds: number;
}

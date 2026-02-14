import type { Datetime } from "./datetime";
import type { ID } from "./id";

export type Workflow = {
  id: ID;
  creation_date: Datetime;
  title: string;
  pipeline_id: ID;
  pipeline_name: string;
  owner_username: string;
  created_jobs: number;
  waiting_jobs: number;
  scheduled_jobs: number;
  started_jobs: number;
  registering_jobs: number;
  finished_jobs: number;
  errored_jobs: number;
  cancelled_jobs: number;
};

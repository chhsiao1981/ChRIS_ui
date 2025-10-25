import type { ID } from "./id";

// legacy: feed
export interface Data {
  id: ID;
  creation_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  modification_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  name: string;
  public: boolean;
  owner_username: string;
  folder_path: string; // home/{username}/feeds/feed_{id}
  created_jobs: number;
  waiting_jobs: number;
  scheduled_jobs: number;
  started_jobs: number;
  registering_jobs: number;
  finished_jobs: number;
  errored_jobs: number;
  cancelled_jobs: number;
}

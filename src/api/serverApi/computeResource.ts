import api from "../api";
import type { ComputeResource } from "../types";

export const getComputeResources = (offset: number = 0, limit: number = 100) =>
  api<ComputeResource[]>({
    endpoint: "/computeresources/",
    query: { offset, limit },
  });

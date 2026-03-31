import YAML from "yaml";
import api from "../api";
import type {
  ID,
  Pipeline,
  PipelineSourceFile,
  UploadPipeline,
} from "../types";
import type { List, ListQuery } from "../types/list";

export const createPipeline = (pipeline: UploadPipeline) =>
  api<Pipeline>({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });

export const getPipelinesByName = (name: string) =>
  api<List<Pipeline>>({
    endpoint: "/pipelines/search/",
    query: {
      name: name,
    },
    isJson: true,
  });

export const getPipeline = (theID: ID) =>
  api<Pipeline>({
    endpoint: `/pipelines/${theID}/`,
  });

export const getPipelines = (
  query: Partial<Pipeline> & { limit?: number; offset?: number },
) =>
  api<List<Pipeline>>({
    endpoint: "/pipelines/search/",
    query: query,
    isJson: true,
  });

export const getPipelineSourceFiles = (
  theID: ID,
  query: ListQuery<PipelineSourceFile>,
) =>
  api<PipelineSourceFile[]>({
    endpoint: `/pipelines/${theID}/`,
    query,
  });

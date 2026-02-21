import YAML from "yaml";
import api from "../api";
import type {
  ID,
  Pipeline,
  PipelineSourceFile,
  PipelineSourceFile,
  UploadPipeline,
} from "../types";
import type { ListQuery } from "../types/list";

export const createPipeline = (pipeline: UploadPipeline) =>
  api<Pipeline>({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });

export const getPipelinesByName = (name: string) =>
  api<Pipeline[]>({
    endpoint: "/pipelines/search/",
    query: {
      name: name,
    },
  });

export const getPipeline = (theID: ID) =>
  api<Pipeline>({
    endpoint: `/pipelines/${theID}/`,
  });

export const getPipelines = (
  query: Partial<Pipeline> & { limit: number; offset: number },
) =>
  api<Pipeline[]>({
    endpoint: "/pipelines/search/",
    query: query,
  });

export const getPipelineSourceFiles = (
  theID: ID,
  query: ListQuery<PipelineSourceFile>,
) =>
  api<PipelineSourceFile[]>({
    endpoint: `/pipelines/${theID}/`,
    query,
  });

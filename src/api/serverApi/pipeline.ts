import YAML from "yaml";
import api from "../api";
import type { Pipeline, UploadPipeline } from "../types";

export const createPipeline = (pipeline: UploadPipeline) =>
  api<Pipeline>({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });

export const getPipelines = (name: string) =>
  api<Pipeline[]>({
    endpoint: "/pipelines/search/",
    query: {
      name: name,
    },
  });

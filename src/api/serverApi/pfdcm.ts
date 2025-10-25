import config from "config";
import api from "../api";
import type { PACSqueryCore } from "../pfdcm";
import { PACSqueryCoreToJSON } from "../pfdcm/generated";
import type { PFDCMResult } from "../types";

export const queryPFDCMStudies = (service: string, query: PACSqueryCore) => {
  // @ts-expect-error study-only
  query.StudyOnly = true;

  return api<PFDCMResult>({
    endpoint: "/PACS/sync/pypx/",
    method: "post",
    json: {
      PACSdirective: query,
      PACSservice: { value: service },
      listenerService: { value: "default" },
    },
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });
};

export const queryPFDCMSeries = (service: string, query: PACSqueryCore) =>
  api<PFDCMResult>({
    endpoint: "/PACS/sync/pypx/",
    method: "post",
    json: {
      PACSdirective: query,
      PACSservice: { value: service },
      listenerService: { value: "default" },
    },
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });

export const getPFDCMServices = () =>
  api<string[]>({
    endpoint: "/PACSservice/list/",
    method: "get",
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });

export const retrievePFDCMPACS = (service: string, query: PACSqueryCore) => {
  const queryJSON = PACSqueryCoreToJSON(query);
  // biome-ignore lint/suspicious/noThenProperty: required by PACSqueryCore
  queryJSON.then = "retrieve";
  queryJSON.withFeedBack = true;

  return api<PFDCMResult>({
    endpoint: "/PACS/thread/pypx/",
    method: "post",
    json: {
      PACSdirective: queryJSON,
      PACSservice: { value: service },
      listenerService: { value: "default" },
    },
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });
};

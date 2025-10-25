import api from "../api";
import type { List, PACSSeries } from "../types";

export const getPACSSeriesListByStudyUID = (studyUID: string) =>
  api<List<PACSSeries>>({
    endpoint: "/pacs/series/search/",
    method: "get",
    query: {
      StudyInstanceUID: studyUID,
    },
  });

export const getPACSSeriesListBySeriesUID = (seriesUID: string) =>
  api<List<PACSSeries>>({
    endpoint: "/pacs/series/search/",
    method: "get",
    query: {
      SeriesInstanceUID: seriesUID,
    },
  });

export const queryPACSSeries = (service: string, seriesInstanceUID: string) =>
  api<PACSSeries[]>({
    endpoint: "/pacs/series/search/",
    method: "get",
    query: {
      pacs_name: service,
      SeriesInstanceUID: seriesInstanceUID,
      limit: 1,
    },
  });

import config from "config";
import api from "../api";
import type { SystemInfo } from "../types/system";

export const getSystemInfo = () =>
  api<SystemInfo>({
    endpoint: "/",
    apiroot: config.API_V7_ROOT,
  });

import api from "../api";
import type { List, PkgInstance } from "../types";

export const createPkgInstance = (packageID: number, theDirs: string[]) =>
  api<PkgInstance>({
    endpoint: `/plugins/${packageID}/instances/`,
    method: "post",
    json: {
      previous_id: null,
      dir: theDirs.join(","),
    },
  });

export const getPkgInstances = (dataID: number) =>
  api<List<PkgInstance>>({
    endpoint: `/${dataID}/plugininstances/`,
    method: "get",
  });

export const deletePkgInstance = (dataID: number, pkgInstanceID: number) =>
  api<null>({
    endpoint: `/${dataID}/plugininstances/${pkgInstanceID}/`,
    method: "delete",
  });

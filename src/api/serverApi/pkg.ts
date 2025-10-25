import type { List } from "lodash";
import api from "../api";
import type { ComputeEnv, Pkg, PkgParameter } from "../types";

export const searchPkgsByName = (packageName: string) =>
  api<List<Pkg>>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name: packageName,
    },
  });

export const getPkgParams = (pkgID: string) =>
  api<List<PkgParameter>>({
    endpoint: `/plugins/${pkgID}/parameters/`,
  });

export const getPkgComputeEnvs = (pkgID: string) =>
  api<List<ComputeEnv>>({
    endpoint: `/plugins/${pkgID}/computeresources/`,
  });

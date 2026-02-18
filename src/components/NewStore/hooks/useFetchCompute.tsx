// src/components/Store/utils/useComputeResources.ts

import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { useEffect } from "react";
import { getComputeResources } from "../../../api/serverApi/computeResource";
import type { ComputeResource } from "../../../api/types";

export function useComputeResources(isLoggedIn?: boolean) {
  const {
    isLoading: isLoadingCompute,
    data,
    error,
    isError,
  } = useQuery<ComputeResource[], Error>({
    queryKey: ["computeResources"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const { status, data, errmsg } = await getComputeResources(0, 100);
      const computeResources = data || [];
      return computeResources;
    },
  });

  useEffect(() => {
    if (isError && error) {
      notification.error({
        message: "Failed to fetch compute resources",
        description: error.message,
      });
    }
  }, [isError, error]);

  return {
    data,
    isLoadingCompute,
  };
}

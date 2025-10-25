import { useMemo } from "react";
import { useLocation } from "react-router";

export const useSearchQueryParams = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

import { debounce } from "lodash";
import { useState } from "react";

export interface PageState {
  perPage: number;
  page: number;
  search: string;
  searchType: string;
}

export const usePaginate = () => {
  const [pageState, setPageState] = useState<PageState>({
    perPage: 18,
    page: 1,
    search: "",
    searchType: "name",
  });

  const setPage = (_e: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };

  const setPerPage = (_e: any, perPage: number) => {
    setPageState({ ...pageState, perPage });
  };

  const setSearch = (search: string, searchType: string) => {
    setPageState({
      ...pageState,
      search,
      searchType,
    });
  };

  const debouncedSetSearch = debounce(
    (search: string, searchType: string) => setSearch(search, searchType),
    100,
  );

  return {
    pageState,
    setPage,
    setPerPage,
    setSearch,
    debouncedSetSearch,
  };
};

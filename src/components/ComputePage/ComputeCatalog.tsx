import { useEffect, useState } from "react";
import { getComputeResources } from "../../api/serverApi/computeResource";
import DisplayPage from "../DisplayPage";

export default () => {
  const [computeResources, setComputeResources] = useState<any[]>();
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState({
    page: 1,
    perPage: 10,
    search: "",
    searchType: "name",
    itemCount: 0,
  });

  const { page, perPage, search, searchType } = pageState;
  const [selectedCompute, setSelectedCompute] = useState<any>();

  const onSetPage = (_event: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };
  const onPerPageSelect = (_event: any, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    });
  };
  const onFilterChange = (value: string) => {
    setPageState({
      ...pageState,
      search: value,
    });
  };
  useEffect(() => {
    async function fetchComputeResources(
      perPage: number,
      page: number,
      search: string,
      searchType: string,
    ) {
      setLoading(true);
      const offset = perPage * (page - 1);
      const query = {
        limit: perPage,
        offset: offset,
        [searchType]: search,
      };
      const { status, data, errmsg } = await getComputeResources(query);
      const computes = data || [];
      if (computes.length) {
        setComputeResources(computes);
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: 0,
          };
        });
      }
      setLoading(false);
    }

    fetchComputeResources(perPage, page, search, searchType);
  }, [perPage, page, search, searchType]);

  const onSearch = (search: string, searchType: string) => {
    setPageState({
      ...pageState,
      search,
      searchType,
    });
  };

  return (
    <>
      <DisplayPage
        loading={loading}
        pageState={pageState}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        resources={computeResources}
        handleFilterChange={onFilterChange}
        selectedResource={selectedCompute}
        setSelectedResource={(compute: any) => {
          setSelectedCompute(compute);
        }}
        title="Compute"
        handleComputeSearch={onSearch}
        search={pageState.search}
      />
    </>
  );
};

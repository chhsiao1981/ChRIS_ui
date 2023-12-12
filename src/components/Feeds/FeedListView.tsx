import React, { useContext, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  Tooltip,
  Checkbox,
  PageSection,
  Pagination,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateHeader,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupItemProps,
  Button,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { Typography } from "antd";
import { cujs } from "chris-utility";
import { useTypedSelector } from "../../store/hooks";
import { Link } from "react-router-dom";
import { usePaginate } from "./usePaginate";
import {
  setBulkSelect,
  removeBulkSelect,
  removeAllSelect,
  toggleSelectAll,
  setAllSelect,
  getFeedSuccess,
} from "../../store/feed/actions";
import { getPluginInstancesRequest } from "../../store/pluginInstance/actions";
import { setSidebarActive } from "../../store/ui/actions";
import type { Feed, FeedList } from "@fnndsc/chrisapi";
import CreateFeed from "../CreateFeed/CreateFeed";
import IconContainer from "../IconContainer";
import WrapperConnect from "../Wrapper";
import { InfoIcon, DataTableToolbar } from "../Common";
import { CreateFeedProvider, PipelineProvider } from "../CreateFeed/context";
import { AddNodeProvider } from "../AddNode/context";
import { ThemeContext } from "../DarkTheme/useTheme";
import ChrisAPIClient from "../../api/chrisapiclient";
const { Paragraph } = Typography;

type ExampleType = "authenticatedfeeds" | "publicfeeds";

const fetchFeeds = async (filterState: any) => {
  const client = ChrisAPIClient.getClient();

  const feedsList: FeedList = await client.getFeeds({
    limit: +filterState.perPage,
    offset: filterState.perPage * (filterState.page - 1),
    [filterState.searchType]: filterState.search,
  });

  const feeds: Feed[] = feedsList.getItems();
  return {
    feeds,
    totalFeedsCount: feedsList.totalCount,
  };
};

const fetchPublicFeeds = async (filterState: any) => {
  const offset = filterState.perPage * (filterState.page - 1);
  const client = ChrisAPIClient.getClient();

  const feedsList: FeedList = await client.getPublicFeeds({
    limit: +filterState.perPage,
    offset: filterState.perPage * (filterState.page - 1),
    [filterState.searchType]: filterState.search,
  });

  const feeds: Feed[] = feedsList.getItems();
  return {
    feeds,
    totalFeedsCount: feedsList.totalCount,
  };
};

function useSearchQueryParams() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function useSearchQuery(query: URLSearchParams) {
  const page = query.get("page") || 1;
  const search = query.get("search") || "";
  const searchType = query.get("searchType") || "name";
  const perPage = query.get("perPage") || 14;

  return {
    page,
    perPage,
    search,
    searchType,
  };
}
const TableSelectable: React.FunctionComponent = () => {
  // In real usage, this data would come from some external source like an API via props.
  const query = useSearchQueryParams();
  const navigate = useNavigate();
  const searchFolderData = useSearchQuery(query);
  const username = useTypedSelector((state) => state.user.username);
  const [exampleType, setExampleType] = React.useState("");

  React.useEffect(() => {
    const exampleType = username ? "authenticatedfeeds" : "publicfeeds";
    setExampleType(exampleType);
  }, [username]);

  const { perPage, page } = searchFolderData;

  const dispatch = useDispatch();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["feeds", searchFolderData],
    queryFn: () => fetchFeeds(searchFolderData),
    enabled: !!username,
  });

  const {
    data: publicFeeds,
    isLoading: publicFeedLoading,
    isFetching: publicFeedFetching,
  } = useQuery({
    queryKey: ["publicFeeds", searchFolderData],
    queryFn: () => fetchPublicFeeds(searchFolderData),
    enabled: exampleType === "publicfeeds",
  });

  const authenticatedFeeds = data ? data.feeds : [];
  const publicFeedsToDisplay = publicFeeds ? publicFeeds.feeds : [];

  const feedsToDisplay =
    exampleType === "authenticatedfeeds"
      ? authenticatedFeeds
      : publicFeedsToDisplay;

  const { selectAllToggle, bulkSelect } = useTypedSelector(
    (state) => state.feed,
  );

  const onSetPage = (_e: any, newPage: number) => {
    navigate(`/feeds?page=${newPage}`);
  };

  const onPerPageSelect = (_e: any, newPerPage: number, newPage: number) => {
    navigate(`/feeds?page=${newPage}&&perPage=${newPerPage}`);
  };

  const handleFilterChange = (search: string, searchType: string) => {
    navigate(`/feeds?search=${search}&&searchType=${searchType}`);
  };

  const onExampleTypeChange: ToggleGroupItemProps["onChange"] = (
    event,
    _isSelected,
  ) => {
    const id = event.currentTarget.id;
    setExampleType(id as ExampleType);
  };

  const bulkData = React.useRef<Feed[]>();
  bulkData.current = bulkSelect;

  React.useEffect(() => {
    document.title = "All Analyses - ChRIS UI ";
    dispatch(
      setSidebarActive({
        activeItem: "analyses",
      }),
    );
    if (bulkData && bulkData.current) {
      dispatch(removeAllSelect(bulkData.current));
    }
  }, [dispatch]);

  const columnNames = {
    id: "ID",
    analysis: "Analysis",
    created: "Created",
    creator: "Creator",
    runtime: "Run Time",
    size: "Size",
    status: "Status",
  };

  const generatePagination = () => {
    if (!data || !data.totalFeedsCount) {
      return null;
    }

    return (
      <Pagination
        itemCount={data.totalFeedsCount}
        perPage={+perPage}
        page={+page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    );
  };

  return (
    <React.Fragment>
      <WrapperConnect>
        <PageSection className="feed-header">
          <InfoIcon
            title={`New and Existing Analyses (${
              data && data.totalFeedsCount > 0 ? data.totalFeedsCount : 0
            })`}
            p1={
              <Paragraph>
                Analyses (aka ChRIS feeds) are computational experiments where
                data are organized and processed by ChRIS plugins. In this view
                you may view your analyses and also the ones shared with you.
              </Paragraph>
            }
          />
          <CreateFeedProvider>
            <PipelineProvider>
              <AddNodeProvider>
                <CreateFeed />
              </AddNodeProvider>
            </PipelineProvider>
          </CreateFeedProvider>
        </PageSection>
        <PageSection className="feed-list">
          <div className="feed-list__split">
            <div>
              <ToggleGroup aria-label="Default with single selectable">
                <ToggleGroupItem
                  text="Authenticated Feeds"
                  buttonId="authenticatedfeeds"
                  isSelected={exampleType === "authenticatedfeeds"}
                  onChange={onExampleTypeChange}
                  isDisabled={!username}
                />
                <ToggleGroupItem
                  text="Public Feeds"
                  buttonId="publicfeeds"
                  isSelected={exampleType === "publicfeeds"}
                  onChange={onExampleTypeChange}
                />
              </ToggleGroup>
            </div>
            {generatePagination()}
          </div>
          <div className="feed-list__split">
            <DataTableToolbar
              onSearch={handleFilterChange}
              label="Filter by name"
            />

            {feedsToDisplay && <IconContainer allFeeds={feedsToDisplay} />}
          </div>
          {isLoading ||
          isFetching ||
          publicFeedLoading ||
          publicFeedFetching ? (
            <LoadingTable />
          ) : feedsToDisplay.length > 0 ? (
            <Table variant="compact" aria-label="Selectable table">
              <Thead>
                <Tr>
                  <Th>
                    <Checkbox
                      id="test"
                      isChecked={selectAllToggle}
                      onChange={() => {
                        if (!selectAllToggle) {
                          if (data) {
                            dispatch(setAllSelect(feedsToDisplay));
                          }

                          dispatch(toggleSelectAll(true));
                        } else {
                          if (data) {
                            dispatch(removeAllSelect(feedsToDisplay));
                          }
                          dispatch(toggleSelectAll(false));
                        }
                      }}
                    />
                  </Th>
                  <Th>{columnNames.id}</Th>
                  <Th>{columnNames.analysis}</Th>
                  <Th>{columnNames.created}</Th>
                  <Th>{columnNames.creator}</Th>
                  <Th>{columnNames.runtime}</Th>
                  <Th>{columnNames.size}</Th>
                  <Th>{columnNames.status}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {feedsToDisplay.map((feed, rowIndex) => {
                  return (
                    <TableRow
                      key={feed.data.id}
                      feed={feed}
                      rowIndex={rowIndex}
                      bulkSelect={bulkSelect}
                      columnNames={columnNames}
                      allFeeds={feedsToDisplay}
                    />
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <EmptyStateTable />
          )}
        </PageSection>
      </WrapperConnect>
    </React.Fragment>
  );
};

export default TableSelectable;

interface TableRowProps {
  rowIndex: number;
  feed: Feed;
  allFeeds: Feed[];
  bulkSelect: Feed[];
  columnNames: {
    id: string;
    analysis: string;
    created: string;
    creator: string;
    runtime: string;
    size: string;
    status: string;
  };
}

function TableRow({ feed, allFeeds, bulkSelect, columnNames }: TableRowProps) {
  const navigate = useNavigate();
  const [intervalMs, setIntervalMs] = React.useState(2000);
  const { isDarkTheme } = useContext(ThemeContext);

  const { data } = useQuery({
    queryKey: ["feedResources", feed],
    queryFn: async () => {
      try {
        const client = ChrisAPIClient.getClient();
        const res = await cujs.getPluginInstanceDetails(feed);

        if (res.progress === 100 || res.error === true) {
          setIntervalMs(0);
        }

        return {
          [feed.data.id]: {
            details: res,
          },
        };
      } catch (error) {
        setIntervalMs(0);
        return {};
      }
    },

    refetchInterval: intervalMs,
  });

  const feedResources = data || {};

  const { id, name: feedName, creation_date, creator_username } = feed.data;

  const { dispatch } = usePaginate();
  const progress = feedResources[id] && feedResources[id].details.progress;

  const size = feedResources[id] && feedResources[id].details.size;
  const feedError = feedResources[id] && feedResources[id].details.error;
  const runtime = feedResources[id] && feedResources[id].details.time;

  const feedProgressText =
    feedResources[id] && feedResources[id].details.feedProgressText;

  let threshold = Infinity;

  // If error in a feed => reflect in progres

  let title = (progress ? progress : 0) + "%";
  let color = "blue";

  if (feedError) {
    color = "#ff0000";
    threshold = progress;
  }

  // If initial node in a feed fails
  if (progress == 0 && feedError) {
    color = "#00ff00";
    title = "❌";
  }

  // If progress less than 100%, display green
  if (progress < 100 && !feedError) {
    color = "#00ff00";
    threshold = progress;
  }
  if (progress == 100) {
    title = "✔️";
  }

  const circularProgress = (
    <div
      style={{
        textAlign: "right",
        height: "50px",
        width: "50px",
        display: "block",
      }}
    >
      <ChartDonutUtilization
        ariaTitle={feedProgressText}
        data={{ x: "Analysis Progress", y: progress }}
        height={125}
        title={title}
        thresholds={[{ value: threshold, color: color }]}
        width={125}
      />
    </div>
  );

  const name = (
    <Tooltip content={<div>View feed details</div>}>
      <Button
        variant="link"
        onClick={() => {
          dispatch(getFeedSuccess(feed));
          dispatch(getPluginInstancesRequest(feed));
          navigate(`/feeds/${id}`);
        }}
      >
        {feedName}
      </Button>
    </Tooltip>
  );

  const created = (
    <span>
      {creation_date && (
        <span>{format(new Date(creation_date), "dd MMM yyyy, HH:mm")}</span>
      )}
    </span>
  );
  const isSelected = (bulkSelect: any, feed: Feed) => {
    for (const selectedFeed of bulkSelect) {
      if (selectedFeed.data.id == feed.data.id) {
        return true;
      }
    }
    return false;
  };
  const bulkCheckbox = (
    <Checkbox
      isChecked={isSelected(bulkSelect, feed)}
      id="check"
      aria-label="toggle icon bar"
      onChange={() => {
        if (!isSelected(bulkSelect, feed)) {
          const newBulkSelect = [...bulkSelect, feed];
          const selectAllToggle = newBulkSelect.length === allFeeds.length;
          dispatch(setBulkSelect(newBulkSelect, selectAllToggle));
        } else {
          const filteredBulkSelect = bulkSelect.filter((selectedFeed) => {
            return selectedFeed.data.id !== feed.data.id;
          });
          const selectAllToggle = filteredBulkSelect.length === allFeeds.length;

          dispatch(removeBulkSelect(filteredBulkSelect, selectAllToggle));
        }
      }}
    />
  );

  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  const backgroundRow =
    progress && progress < 100 && !feedError ? backgroundColor : "inherit";
  const selectedBgRow = isSelected(bulkSelect, feed)
    ? backgroundColor
    : backgroundRow;

  return (
    <Tr
      isSelectable
      key={feed.data.id}
      style={{
        backgroundColor: selectedBgRow,
      }}
    >
      <Td>{bulkCheckbox}</Td>
      <Td dataLabel={columnNames.id}>{id}</Td>
      <Td dataLabel={columnNames.analysis}>{name}</Td>
      <Td dataLabel={columnNames.created}>{created}</Td>
      <Td dataLabel={columnNames.creator}>{creator_username}</Td>
      <Td dataLabel={columnNames.runtime}>{runtime}</Td>
      <Td dataLabel={columnNames.size}>{size}</Td>
      <Td dataLabel={columnNames.status}>{circularProgress}</Td>
    </Tr>
  );
}

function EmptyStateTable() {
  return (
    <Table variant="compact" aria-label="Empty state table">
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Analysis</Th>
          <Th>Created</Th>
          <Th>Creator</Th>
          <Th>Run Time</Th>
          <Th>Size</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td colSpan={12}>
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.sm}>
                <EmptyStateHeader
                  icon={<EmptyStateIcon icon={SearchIcon} />}
                  titleText="No results found"
                  headingLevel="h2"
                />
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
}

function LoadingTable() {
  return (
    <div style={{ height: "100%" }}>
      <Skeleton
        height="100%"
        screenreaderText="Loading large rectangle contents"
      />
    </div>
  );
}

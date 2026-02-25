import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
  useThunk,
} from "@chhsiao1981/use-thunk";

import { ChartDonutUtilization } from "@patternfly/react-charts";
import {
  Button,
  PageSection,
  Pagination,
  Skeleton,
  Tooltip,
} from "@patternfly/react-core";
import {
  SortByDirection,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type React from "react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";
import type { Feed, FileBrowserFolder, ID } from "../../api/types";
import type { FeedSearchType } from "../../api/types/feed";
import * as DoCart from "../../reducers/cart";
import * as DoFeedList from "../../reducers/feedList";
import * as DoUser from "../../reducers/user";
import { InfoSection } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import Operations from "../NewLibrary/components/Operations";
import { OperationContext } from "../NewLibrary/context";
import useLongPress from "../NewLibrary/utils/longpress";
import Wrapper from "../Wrapper";
import { COLUMN_DEFINITIONS } from "./constants";
import EmptyStateTable from "./EmptyStateTable";
import FeedsSearch from "./FeedsSearch";
import LoadingTable from "./LoadingTable";
import {
  fetchAuthenticatedFeed,
  fetchPublicFeed,
  getPluginInstanceDetails,
  type PluginInstanceDetails,
} from "./utilties";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

type Props = {
  title: string;
  isPublic: boolean;
};

export default (props: Props) => {
  const { title, isPublic } = props;
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn, username, isInit: isInitUser, isStaff } = user;
  const theType = isPublic ? "public" : "private";

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const useFeedList = useThunk<DoFeedList.State, TDoFeedList>(DoFeedList);
  const [classStateFeedList, doFeedList] = useFeedList;
  const feedListID = getDefaultID(classStateFeedList);
  const feedList = getState(classStateFeedList) || DoFeedList.defaultState;
  const {
    count,
    data: feedsToDisplay,
    page,
    perPage,
    searchType,
    search,
    isLoading,
    error,
  } = feedList;

  const navigate = useNavigate();

  /**
   * Sorted Table data / parameters
   */
  // https://www.patternfly.org/components/table/
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] =
    useState<SortByDirection>(SortByDirection.desc);

  const getSortParams = (columnIndex: number) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (
      _event: React.MouseEvent,
      index: number,
      direction: SortByDirection,
    ) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  /**
   * sortedFeeds
   *
   * 1. required to manually setup.
   * 2. useMemo to reduce the sort issues.
   */
  const sortedFeeds = useMemo(() => {
    const comparator = COLUMN_DEFINITIONS[activeSortIndex].comparator;

    // activeSortIndex is always number and never the null.
    return [...feedsToDisplay].sort((a, b) =>
      activeSortDirection === SortByDirection.asc
        ? comparator(a, b)
        : comparator(b, a),
    );
  }, [feedsToDisplay, activeSortIndex, activeSortDirection]);

  /**
   * Handle pagination changes
   * @param _ - Event object
   * @param newPage - New page number
   */
  const onSetPage = (
    _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number,
  ) => {
    navigate(
      `?search=${search}&searchType=${searchType}&page=${newPage}&perPage=${perPage}`,
    );

    doFeedList.getFeedList(
      feedListID,
      searchType,
      search,
      newPage,
      perPage,
      isPublic,
    );
  };

  /**
   * Handle per-page changes
   * @param _ - Event object
   * @param newPerPage - New per-page value
   * @param newPage - New page number
   */
  const onPerPageSelect = (
    _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    navigate(
      `?search=${search}&searchType=${searchType}&page=${newPage}&perPage=${newPerPage}`,
    );

    doFeedList.getFeedList(
      feedListID,
      searchType,
      search,
      newPage,
      perPage,
      isPublic,
    );
  };

  /**
   * Debounced function to handle filter changes
   * @param search - Search query
   * @param searchType - Search type
   */
  const onChangeFilter = (search: string, searchType: FeedSearchType) => {
    navigate(`?search=${search}&searchType=${searchType}`);

    doFeedList.getFeedList(
      feedListID,
      searchType,
      search,
      0,
      perPage,
      isPublic,
    );
  };

  /**
   * Redirect to public feeds if user is not logged in and type is private
   */
  useEffect(() => {
    if (!isInitUser) {
      return;
    }

    if (!theType || (!isLoggedIn && theType === "private")) {
      navigate(
        `/shared?search=${search}&searchType=${searchType}&page=${page}&perPage=${perPage}`,
      );
    }
  }, [
    isLoggedIn,
    isInitUser,
    navigate,
    perPage,
    page,
    searchType,
    search,
    theType,
  ]);

  /**
   * Generate pagination component
   * @param count - Total count of feeds
   * @returns Pagination component
   */
  const generatePagination = (count?: number) => {
    if (!count && isLoading) {
      return <Skeleton width="25%" screenreaderText="Loading Count" />;
    }

    return (
      <Pagination
        style={{
          marginTop: "0.5em",
        }}
        itemCount={count}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        isCompact
        aria-label="Feed table pagination"
      />
    );
  };

  const feedCountText =
    !count && isLoading ? "Fetching..." : count === -1 ? 0 : count;

  const TitleComponent = (
    <InfoSection
      title={`${title} (${feedCountText})`}
      content="In this view, you can view your data and the ones shared with you."
    />
  );

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Wrapper title={TitleComponent}>
      <PageSection
        stickyOnBreakpoint={{ default: "top" }}
        style={{ paddingTop: "0.25em", paddingBottom: "0" }}
      >
        <div className="feed-header">
          <div>
            <FeedsSearch
              loading={isLoading}
              search={search}
              searchType={searchType}
              onChange={onChangeFilter}
            />
          </div>
          {generatePagination(count)}
        </div>

        {isLoggedIn && (
          <Operations
            username={username}
            isStaff={isStaff}
            useCart={useCart}
            origin={{
              type: OperationContext.FEEDS,
              additionalKeys: [perPage, page, theType, search, searchType],
            }}
            customStyle={{
              toolbarItem: { paddingInlineStart: "0" },
              toolbar: {
                paddingTop: "0",
                paddingBottom: "0",
                background: "inherit",
                marginTop: isMobile ? "0.5em" : undefined,
              },
            }}
          />
        )}
      </PageSection>
      <PageSection style={{ paddingBlockStart: "0.5em" }}>
        {isLoading ? (
          <LoadingTable />
        ) : feedsToDisplay.length > 0 ? (
          <Table
            className="feed-table"
            variant="compact"
            aria-label="Feed Table"
          >
            <Thead>
              <Tr>
                <Th scope="col" screenReaderText="Select Feed" />
                {COLUMN_DEFINITIONS.map((column, columnIndex) => (
                  <Th key={column.id} sort={getSortParams(columnIndex)}>
                    {column.label}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {sortedFeeds.map((feed, rowIndex) => (
                <TableRow
                  username={username}
                  key={feed.id}
                  feed={feed}
                  rowIndex={rowIndex}
                  allFeeds={feedsToDisplay}
                  type={theType}
                  additionalKeys={[perPage, page, theType, search, searchType]}
                  useCart={useCart}
                />
              ))}
            </Tbody>
          </Table>
        ) : (
          <EmptyStateTable />
        )}
      </PageSection>
    </Wrapper>
  );
};

// -------------- TableRow Props --------------
type TableRowProps = {
  rowIndex: number;
  feed: Feed;
  allFeeds: Feed[];
  type: string;
  additionalKeys: string[];
  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

// -------------- TableRow --------------
const TableRow = (props: TableRowProps) => {
  const { rowIndex, feed, additionalKeys, type, username, useCart } = props;

  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);

  // Add a cache for folder data with proper typing
  const folderCache = useRef<FileBrowserFolder | null>(null);

  /**
   * Track row progress state for background color
   */
  const [rowProgress, setRowProgress] = useState<number | null>(null);
  const [rowError, setRowError] = useState<boolean>(false);

  /**
   * Get folder for this feed - with caching
   */
  const getFolderForThisFeed = async () => {
    // Return cached data if available
    if (folderCache.current) {
      return folderCache.current;
    }

    // Otherwise fetch and cache
    const payload = await feed.getFolder();
    folderCache.current = payload;
    return payload;
  };

  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";
  /**
   * Only show special background if progress is being tracked and less than 100%
   */
  const backgroundRow =
    rowProgress !== null && rowProgress < 100 && !rowError
      ? backgroundColor
      : "inherit";

  const isSelected = selectedPaths.some(
    (payload) => payload.path === feed.folder_path,
  );

  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  /**
   * Handle feed name click
   */
  const onFeedNameClick = () => {
    navigate(`/data/${feed.id}?type=${feed.public ? "public" : "private"}`);
  };

  return (
    <FolderContextMenu
      username={username}
      origin={{
        type: OperationContext.FEEDS,
        additionalKeys: additionalKeys,
      }}
    >
      <Tr
        key={feed.id}
        id={`feed-row-${feed.id}`}
        style={{ backgroundColor: selectedBgRow, cursor: "pointer" }}
        data-test-id={`${feed.name}-test`}
        onContextMenu={async (e) => {
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.folder_path, "folder");
        }}
        onClick={async (e) => {
          e?.stopPropagation();
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.folder_path, "folder", () => {
            onFeedNameClick();
          });
        }}
        isRowSelected={isSelected}
      >
        <Td
          onClick={(e) => e.stopPropagation()}
          select={{
            rowIndex: rowIndex,
            isSelected: isSelected,
            onSelect: async (event) => {
              event.stopPropagation();
              const isChecked = event.currentTarget.checked;

              // Only fetch folder data if the checkbox is being checked
              // This prevents the delay when simply rendering checkboxes
              let payload: FileBrowserFolder | null = null;
              if (isChecked) {
                payload = await getFolderForThisFeed();
              } else if (isSelected) {
                // If unchecking, we don't need to fetch again, just use the path
                handlers.handleCheckboxChange(
                  event,
                  feed.folder_path,
                  null,
                  "folder",
                );
                return;
              }

              /**
               * Create a new event object with the captured value
               */
              const newEvent = {
                ...event,
                stopPropagation: () => event.stopPropagation(),
                preventDefault: () => event.preventDefault(),
                target: {
                  ...event.currentTarget,
                  checked: isChecked,
                },
                // Make sure currentTarget also has the checked property
                currentTarget: {
                  ...event.currentTarget,
                  checked: isChecked,
                },
              };

              handlers.handleCheckboxChange(
                newEvent as unknown as React.FormEvent<HTMLInputElement>,
                feed.folder_path,
                payload,
                "folder",
              );
            },
          }}
        />
        <Td dataLabel="ID">{feed.id}</Td>
        <Td dataLabel="analysis">
          <FeedInfoColumn feed={feed} onClick={onFeedNameClick} />
        </Td>
        <Td dataLabel="created">
          {format(new Date(feed.creation_date), "dd MMM yyyy, HH:mm")}
        </Td>
        <Td dataLabel="creator">{feed.owner_username}</Td>
        {/* Status column with progress donut */}
        <Td dataLabel="status">
          <DonutUtilization
            feed={feed}
            type={type}
            onProgressUpdate={(progress, error) => {
              setRowProgress(progress);
              setRowError(error);
            }}
          />
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

/**
 * Helper function to check if a feed is completed based on its details
 * Used to determine if polling is needed
 *
 * @param details - Feed details from getPluginInstanceDetails
 * @returns boolean - True if feed is completed or has error
 */
const isFeedCompleted = (details: PluginInstanceDetails | null): boolean => {
  if (!details) return false;
  return details.progress === 100 || Boolean(details.foundError);
};

/**
 * Helper function to fetch updated feed data
 *
 * @param feedId - ID of the feed to fetch
 * @param type - Type of feed (public or private)
 * @returns Promise with updated feed details
 */
const fetchFeedDetails = async (
  feedId: ID,
  type: string,
): Promise<PluginInstanceDetails> => {
  let updatedFeed: Feed | undefined;

  try {
    if (type === "private") {
      updatedFeed = await fetchAuthenticatedFeed(feedId);
    } else if (type === "public") {
      updatedFeed = await fetchPublicFeed(feedId);
    } else {
      throw new Error(`Invalid feed type: ${type}`);
    }

    if (!updatedFeed) throw new Error("Failed to fetch feed");
    return getPluginInstanceDetails(updatedFeed);
  } catch (error) {
    console.error("Error fetching feed details:", error);
    throw error;
  }
};

/**
 * DonutUtilization component displays the current progress of a feed
 * and notifies the parent component of progress/error changes.
 *
 * @param feed - The feed object to monitor
 * @param type - The type of feed (public or private)
 * @param onProgressUpdate - Callback function to notify parent of progress changes
 * @returns JSX.Element - A progress donut or loading skeleton
 */
function DonutUtilization({
  feed,
  type,
  onProgressUpdate,
}: {
  feed: Feed;
  type: string;
  onProgressUpdate: (progress: number | null, error: boolean) => void;
}): JSX.Element {
  const { isDarkTheme } = useContext(ThemeContext);

  /**
   * Calculate initial details synchronously and check if feed is completed
   */
  const initialDetails = useMemo(() => getPluginInstanceDetails(feed), [feed]);
  const feedCompleted = useMemo(
    () => isFeedCompleted(initialDetails),
    [initialDetails],
  );

  /**
   * Notify parent of initial progress status
   */
  useEffect(() => {
    onProgressUpdate(
      initialDetails.progress,
      Boolean(initialDetails.foundError),
    );
  }, [initialDetails, onProgressUpdate]);

  /**
   * Only fetch updates for feeds that aren't completed
   */
  const {
    data: fetchedDetails,
    isLoading,
    status,
  } = useQuery({
    queryKey: ["feedDetails", feed.id, type],
    queryFn: () => fetchFeedDetails(feed.id, type),
    refetchInterval: (query) => {
      // Check data from the current query state
      const data = query.state.data;
      if (!data) return false;

      // Stop polling if feed is completed or has error
      if (isFeedCompleted(data)) {
        return false;
      }

      // Continue polling every 5 seconds
      return 5000;
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    enabled: !feedCompleted,
  });

  /**
   * Use fetched details for active feeds, initial details for completed feeds
   */
  const details = fetchedDetails || initialDetails;

  /**
   * Notify parent of status updates for active feeds
   */
  useEffect(() => {
    if (feedCompleted) {
      // Already handled via initial details
      return;
    }

    if (status === "success" && fetchedDetails) {
      onProgressUpdate(
        fetchedDetails.progress,
        Boolean(fetchedDetails.foundError),
      );
    } else if (status === "error") {
      onProgressUpdate(null, true);
    }
  }, [status, fetchedDetails, feedCompleted, onProgressUpdate]);

  const mode = isDarkTheme ? "dark" : "light";

  if (isLoading) {
    return <Skeleton height="40px" width="40px" />;
  }

  if (!details) {
    /**
     * Show a greyed out donut labeled "N/A" when no details available
     */
    return (
      <Tooltip content="No feed progress data available">
        <div className={`chart ${mode}`}>
          <ChartDonutUtilization
            ariaTitle="Unknown Status"
            data={{ x: "Analysis", y: 0 }}
            labels={() => null}
            title="?"
            thresholds={[{ value: 100, color: "#d2d2d2" }]}
            width={125}
            height={125}
          />
        </div>
      </Tooltip>
    );
  }

  /**
   * Extract progress and error state with safe defaults
   */
  const { progress = 0, feedProgressText = "" } = details;
  const foundError = details.foundError === true;

  /**
   * Decide the donut color & label based on progress and error state
   */
  let title = `${progress}%`;
  /**
   * Default color for the donut
   */
  let color = "#0066cc";
  let threshold = 100;

  if (foundError) {
    /**
     * PF Red-100 for error state
     */
    color = "#c9190b";
    threshold = progress;
  } else if (progress === 100) {
    title = "✓";
  } else {
    /**
     * PF Blue-400 for partial progress
     */
    color = "#06c";
    threshold = progress;
  }

  return (
    <Tooltip content={feedProgressText}>
      <div className={`chart ${mode}`}>
        <ChartDonutUtilization
          ariaTitle={feedProgressText}
          data={{ x: "Analysis", y: progress }}
          labels={() => null}
          title={title}
          thresholds={[{ value: threshold, color }]}
          width={125}
          height={125}
        />
      </div>
    </Tooltip>
  );
}

// -------------- FeedInfoColumn --------------
const FeedInfoColumn = ({
  feed,
  onClick,
}: {
  feed: Feed;
  onClick: (feed: Feed) => void;
}) => (
  <Button
    variant="link"
    onClick={(e) => {
      e.stopPropagation();
      onClick(feed);
    }}
    style={{ padding: 0 }}
    aria-label={`View details for ${feed.name}`}
  >
    {feed.name}
  </Button>
);

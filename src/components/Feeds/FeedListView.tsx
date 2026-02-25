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
import FeedTableRow from "./FeedTableRow";
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
                <FeedTableRow
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

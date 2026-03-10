import {
  genUUID,
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import {
  SortByDirection,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useLocation, useNavigate, useParams } from "react-router";
import type { FeedSearchType } from "../../api/types/feed";
import * as DoCart from "../../reducers/cart";
import * as DoFeedList from "../../reducers/feedList";
import * as DoOperation from "../../reducers/operation";
import * as DoUser from "../../reducers/user";
import { InfoSection } from "../Common";
import Operations from "../NewLibrary/components/Operations";
import { OperationContext } from "../NewLibrary/context";
import Wrapper from "../Wrapper";
import { COLUMN_DEFINITIONS } from "./constants";
import EmptyStateTable from "./EmptyStateTable";
import styles from "./FeedListView.module.css";
import FeedsSearch from "./FeedsSearch";
import FeedTableRow from "./FeedTableRow";
import LoadingTable from "./LoadingTable";
import Pagination from "./Pagination";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;
type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;

type Props = {
  title: string;
  isPublic: boolean;
};

//The very top Feed List View for routes.
//
//XXX expecting react-router-dom clears use-hook orders.
export default (props: Props) => {
  const { title, isPublic } = props;
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classUser, _] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { isLoggedIn, username, isInit: isInitUser, isStaff } = user;
  const privateType = isPublic ? "public" : "private";

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const useFeedList = useThunk<DoFeedList.State, TDoFeedList>(DoFeedList);
  const [classFeedList, doFeedList] = useFeedList;
  const feedListID = getDefaultID(classFeedList);
  const feedList = getState(classFeedList) || DoFeedList.defaultState;
  const {
    count,
    feeds: feedsToDisplay,
    page,
    perPage,
    searchType,
    search,
    isLoading,
    error,
  } = feedList;

  const useOperation = useThunk<DoOperation.State, TDoOperation>(DoOperation);
  const [_classsOperation, doOperation] = useOperation;
  const [operationID, _setOperationID] = useState(genUUID());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useParams();
  const { tagID } = routeParams;

  const theTitle = tagID ? `${title}: ${tagID}` : title;

  console.info("FeedListView: tagID:", tagID);

  // Sorted Table data / parameters
  // https://www.patternfly.org/components/table/
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] =
    useState<SortByDirection>(SortByDirection.desc);

  useEffect(() => {
    console.info("FeedListView: to doOperation.init");
    doOperation.init(operationID, fileInputRef, folderInputRef);
  }, []);

  useEffect(() => {
    if (!feedListID) {
      return;
    }
    if (!location.pathname.startsWith("/data")) {
      return;
    }

    const pathSplit = location.pathname.split("/");
    if (pathSplit.length === 3) {
      // FeedView
      return;
    }

    doFeedList.getFeedList(
      feedListID,
      searchType,
      search,
      0,
      perPage,
      isPublic,
      tagID,
    );
  }, [feedListID, location.pathname, location.search, tagID]);

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

  // sortedFeeds
  //
  // 1. required to manually setup.
  // 2. useMemo to reduce the sort issues.
  const sortedFeeds = useMemo(() => {
    const comparator = COLUMN_DEFINITIONS[activeSortIndex].comparator;

    // activeSortIndex is always number and never the null.
    return [...feedsToDisplay].sort((a, b) =>
      activeSortDirection === SortByDirection.asc
        ? comparator(a, b)
        : comparator(b, a),
    );
  }, [feedsToDisplay, activeSortIndex, activeSortDirection]);

  // change feeds search
  const onChangeFeedsSearch = (search: string, searchType: FeedSearchType) => {
    navigate(`?search=${search}&searchType=${searchType}`);

    doFeedList.getFeedList(
      feedListID,
      searchType,
      search,
      0,
      perPage,
      isPublic,
      tagID,
    );
  };

  // Redirect to public feeds if user is not logged in and type is private
  useEffect(() => {
    if (!isInitUser) {
      return;
    }

    if (!isLoggedIn && privateType === "private") {
      navigate(
        `/data/tag/public?search=${search}&searchType=${searchType}&page=${page}&perPage=${perPage}`,
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
    privateType,
  ]);

  const feedCountText =
    !count && isLoading ? "Fetching..." : count === -1 ? 0 : count;

  const TitleComponent = (
    <InfoSection
      title={`${theTitle} (${feedCountText})`}
      content="In this view, you can view your data and the ones shared with you."
    />
  );

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const toolbarClassName = !isLoggedIn
    ? styles.hide
    : isMobile
      ? styles["toolbar-mobile"]
      : styles.toolbar;
  const operationsClassNames: {
    toolbarItem?: string;
    toolbar?: string;
  } = {
    toolbarItem: styles["toolbar-item"],
    toolbar: toolbarClassName,
  };

  const loadingTableClassName = isLoading ? undefined : styles.hide;
  const tableClassName =
    !isLoading && feedsToDisplay.length ? "feed-table" : styles.hide;
  const emptyStateTableClassName =
    !isLoading && !feedsToDisplay.length ? undefined : styles.hide;

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
              onChange={onChangeFeedsSearch}
            />
          </div>
          <Pagination
            count={count}
            isLoading={isLoading}
            page={page}
            perPage={perPage}
            searchType={searchType}
            search={search}
            navigate={navigate}
            useFeedList={useFeedList}
            isPublic={isPublic}
            tag={tagID}
          />
        </div>

        <Operations
          username={username}
          isStaff={isStaff}
          origin={{
            type: OperationContext.FEEDS,
          }}
          classNames={operationsClassNames}
          useCart={useCart}
          operationID={operationID}
          useOperation={useOperation}
          useUser={useUser}
          feedListID={feedListID}
          useFeedList={useFeedList}
        />
      </PageSection>
      <PageSection className={styles["page-section-table"]}>
        <LoadingTable className={loadingTableClassName} />
        <Table
          className={tableClassName}
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
                type={privateType}
                useCart={useCart}
              />
            ))}
          </Tbody>
        </Table>
        <EmptyStateTable className={emptyStateTableClassName} />
      </PageSection>
    </Wrapper>
  );
};

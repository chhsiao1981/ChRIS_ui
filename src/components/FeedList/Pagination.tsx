import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Pagination, Skeleton } from "@patternfly/react-core";
import type { NavigateFunction } from "react-router";
import type { FeedSearchType, FeedSearchValueType } from "../../api/types/feed";
import type * as DoFeedList from "../../reducers/feedList";

type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

type Props = {
  count?: number;
  isLoading: boolean;
  perPage: number;
  page: number;
  searchType: FeedSearchType;
  search: FeedSearchValueType;
  navigate: NavigateFunction;
  useFeedList: UseThunk<DoFeedList.State, TDoFeedList>;
  isPublic: boolean;
  tag?: string;
};

export default (props: Props) => {
  const {
    count,
    isLoading,
    perPage,
    page,
    searchType,
    search,
    navigate,
    useFeedList,
    isPublic,
    tag,
  } = props;

  const [classStateFeedList, doFeedList] = useFeedList;
  const feedListID = getDefaultID(classStateFeedList);

  if (!count && isLoading) {
    return <Skeleton width="25%" screenreaderText="Loading Count" />;
  }

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
      tag,
    );
  };

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
      tag,
    );
  };

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

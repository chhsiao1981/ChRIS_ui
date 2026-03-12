import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { getFeedList as apiGetFeedList } from "../api/serverApi/feed";
import type { Feed } from "../api/types";
import type {
  FeedSearchType,
  FeedSearchValueType,
  FeedType,
} from "../api/types/feed";

export const myClass = "chris-ui/feed-list";

export interface State extends rState {
  feeds: Feed[];
  count: number;
  theType: FeedType;

  page: number; // starting from 1, defined by PatternFly
  perPage: number;
  searchType: FeedSearchType;
  search: FeedSearchValueType;

  error: string;
  isLoading: boolean;
  isInit: boolean;
}

export const defaultState: State = {
  feeds: [],
  count: 0,
  theType: "private",

  page: 1, // starting from 1, defined by PatternFly
  perPage: 20,
  searchType: "name",
  search: "",

  error: "",
  isLoading: false,
  isInit: false,
};

export const init = (): Thunk<State> => {
  return (dispatch, _getClassState) => {
    const state: State = Object.assign({}, defaultState, { isInit: true });
    dispatch(_init({ state }));
  };
};

export const prepandList = (myID: string, feed: Feed): Thunk<State> => {
  return (dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { feeds, page } = me;
    if (page !== 1) {
      return;
    }
    const newFeeds = [feed].concat(feeds);
    dispatch(setData<State>(myID, { feeds: newFeeds }));
  };
};

export const getFeedList = (
  myID: string,
  searchType?: FeedSearchType,
  search?: FeedSearchValueType,
  page: number = 1, // starting from 1, defined by PatternFly
  perPage: number = 100,
  isPublic: boolean = false,
  tag?: string,
): Thunk<State> => {
  return async (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { isLoading: true }));
    const offset = (page - 1) * perPage;
    const { status, data, errmsg } = await apiGetFeedList(
      searchType,
      search,
      offset,
      perPage,
      isPublic,
      tag,
    );
    console.info(
      "feedList.getFeedList: after apiGetFeedList: status:",
      status,
      "data:",
      data,
      "errmsg:",
      errmsg,
    );
    dispatch(setData<State>(myID, { isLoading: false }));
    if (errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
    if (!data) {
      return;
    }
    const { results, count } = data;
    console.info(
      "feedList.getFeedList: to setData: myID:",
      myID,
      "results:",
      results,
      "count:",
      count,
      "page:",
      page,
      "perPage:",
      perPage,
    );
    dispatch(
      setData<State>(myID, {
        feeds: results,
        count,
        page,
        perPage,
        searchType,
        search,
      }),
    );
  };
};

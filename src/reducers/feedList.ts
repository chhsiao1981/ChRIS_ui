import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { getFeedList as apiGetFeedList } from "../api/serverApi/feed";
import type { Feed } from "../api/types";
import type { FeedSearchType, FeedType } from "../api/types/feed";

export const myClass = "chris-ui/feed-list";

export interface State extends rState {
  data: Feed[];
  count: number;
  theType: FeedType;

  page: number;
  perPage: number;
  searchType: FeedSearchType;
  search: string;

  error: string;
  isLoading: boolean;
}

export const defaultState: State = {
  data: [],
  count: 0,
  theType: "private",

  page: 0,
  perPage: 20,
  searchType: "name",
  search: "",

  error: "",
  isLoading: false,
};

export const init = (): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const getFeedList = (
  myID: string,
  searchType?: FeedSearchType,
  search?: string,
  page: number = 0,
  perPage: number = 100,
): Thunk<State> => {
  return async (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { isLoading: true }));
    const { status, data, errmsg } = await apiGetFeedList(
      searchType,
      search,
      page,
      perPage,
    );
    dispatch(setData<State>(myID, { isLoading: false }));
    if (errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
    if (!data) {
      return;
    }
    const { list, count } = data;
    dispatch(
      setData<State>(myID, {
        data: list,
        count,
        page,
        perPage,
        searchType,
        search,
      }),
    );
  };
};

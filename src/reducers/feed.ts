import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { getFeed } from "../api/serverApi";
import type { Feed, ID } from "../api/types";
import type { FeedType } from "../api/types/feed";
import type * as DoPluginInstance from "./pluginInstance";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

export const myClass = "chris-ui/feed";

export interface State extends rState {
  data?: Feed;
  error: string;
  loading: boolean;

  showToolbar: boolean;
}

export const defaultState: State = {
  data: undefined,
  loading: false,
  error: "",
  showToolbar: false,
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const feedSuccess = (myID: string, feed: Feed): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { data: feed, error: "", loading: false }));
  };
};

export const resetFeed = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, defaultState));
  };
};

export const setShowToolbar = (
  myID: string,
  showToolbar: boolean,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { showToolbar }));
  };
};

export const getFeedDetail = (
  myID: string,
  feedID: ID,
  theType: FeedType,
  usePluginInstance: UseThunk<DoPluginInstance.State, TDoPluginInstance>,
  pluginInstanceID: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data, errmsg } = await getFeed(
      feedID,
      theType === "public",
    );
    if (errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
    if (!data) {
      dispatch(setData<State>(myID, { error: "unable to get data" }));
      return;
    }

    dispatch(setData<State>(myID, { data }));

    console.info(
      "feed.getFeedDetail: to pluginInstance.fetchPluginInstances: feedID:",
      feedID,
    );
    const [_classPluginInstance, doPluginInstance] = usePluginInstance;
    doPluginInstance.fetchAllInstanceList(pluginInstanceID, data);
  };
};

import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { Feed } from "@fnndsc/chrisapi";

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

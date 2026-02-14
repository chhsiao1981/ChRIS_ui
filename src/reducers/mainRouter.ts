import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";

export const myClass = "chris-ui/main-router";

export interface State extends rState {
  selectData: any[];
}

export const defaultState: State = {
  selectData: [],
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const createFeedWithData = (
  myID: string,
  selectData: any[],
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, { selectData }));
  };
};

export const clearFeedData = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, { selectData: [] }));
  };
};

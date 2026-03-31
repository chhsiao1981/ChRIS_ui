import { getState, setData, type Thunk } from "@chhsiao1981/use-thunk";
import type { Feed } from "../../api/types";
import type { CartSelection } from "../types";
import type { State } from "./state";
import { feedToCartSelection } from "./utils";

export const setSelectedPath = (
  myID: string,
  path: CartSelection,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths } = me;
    const newSelectedPaths = selectedPaths.concat([path]);
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const setBulkSelectedPaths = (
  myID: string,
  paths: CartSelection[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths } = me;
    const newSelectedPaths = selectedPaths.concat(paths);
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const removeSelected = (
  myID: string,
  selected: CartSelection,
): Thunk<State> => removeSelectedPath(myID, selected.path);

export const removeSelectedPath = (
  myID: string,
  path: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths } = me;
    const newSelected = selectedPaths.filter(
      (eachSelected) => eachSelected.path !== path,
    );
    dispatch(setData(myID, { selectedPaths: newSelected }));
  };
};

export const clearAllPaths = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedPaths: [] }));
  };
};

export const toggleSelectedFeed = (
  myID: string,
  feed: Feed,
  isChecked: boolean,
): Thunk<State> => {
  return async (dispatch, getClass) => {
    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }
    const { selectedPaths } = me;
    const isSelected = selectedPaths.some(
      (each) => each.path === feed.folder_path,
    );
    if (isChecked === isSelected) {
      return;
    }

    if (!isChecked) {
      dispatch(removeSelectedPath(myID, feed.folder_path));
    } else {
      const selection = feedToCartSelection(feed);
      dispatch(setSelectedPath(myID, selection));
    }
  };
};

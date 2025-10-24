import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { set } from "lodash";
import { STATUS_OK } from "../api/constants";
import {
  deletePkgInstance as apiDeletePkgInstance,
  getPkgInstances,
} from "../api/serverApi";
import type { PkgInstance } from "../api/types";

export const myClass = "chris-ui/pkg-instance";

export interface State extends rState {
  selectedPkgInstance?: PkgInstance;
  pkgInstances: PkgInstance[];
  errmsg: string;
  loading: boolean;
}

export const defaultState: State = {
  selectedPkgInstance: undefined,
  pkgInstances: [],
  errmsg: "",
  loading: false,
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const fetchPkgInstances = (
  myID: string,
  dataID: number,
): Thunk<State> => {
  return async (dispatch, _) => {
    const {
      status,
      data: pkgInstances,
      errmsg,
    } = await getPkgInstances(dataID);
    if (status !== STATUS_OK) {
      return;
    }
    if (errmsg) {
      return;
    }

    if (!pkgInstances) {
      return;
    }

    const selectedPkgInstance = pkgInstances[pkgInstances.length - 1];
    dispatch(
      setPkgInstancesAndSelectedPkgInstance(
        myID,
        pkgInstances,
        selectedPkgInstance,
      ),
    );
  };
};

export const addPkgInstance = (
  myID: string,
  pkgInstance: PkgInstance,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { pkgInstances } = me;
    const newPkgInstances = pkgInstances.concat([pkgInstance]);
    dispatch(
      setPkgInstancesAndSelectedPkgInstance(myID, newPkgInstances, pkgInstance),
    );
  };
};

export const deletePkgInstance = (
  myID: string,
  pkgInstance: PkgInstance,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { pkgInstances } = me;
    const idx = pkgInstances.findIndex((each) => each.id === pkgInstance.id);
    if (idx === -1) {
      dispatch(setData(myID, { errmsg: "no such package instance" }));
      return;
    }

    const parentID = pkgInstance.previous_id;

    const {
      status,
      data: _2,
      errmsg,
    } = await apiDeletePkgInstance(pkgInstance.feed_id, pkgInstance.id);
    if (status !== STATUS_OK) {
      return;
    }
    if (errmsg) {
      return;
    }

    const {
      status: status2,
      data: newPkgInstances,
      errmsg: errmsg2,
    } = await getPkgInstances(pkgInstance.feed_id);
    if (status2 !== STATUS_OK) {
      return;
    }
    if (errmsg2) {
      return;
    }
    if (!newPkgInstances) {
      return;
    }
    if (newPkgInstances.length === 0) {
      dispatch(setPkgInstancesAndSelectedPkgInstance(myID, [], undefined));
      return;
    }

    const selectedID = parentID ? parentID : newPkgInstances[0].id;
    const selectedPkgInstance = newPkgInstances.find(
      (each) => each.id === selectedID,
    );
    if (!selectedPkgInstance) {
      dispatch(
        setPkgInstancesAndSelectedPkgInstance(
          myID,
          newPkgInstances,
          newPkgInstances[newPkgInstances.length - 1],
        ),
      );
      return;
    }

    dispatch(
      setPkgInstancesAndSelectedPkgInstance(
        myID,
        newPkgInstances,
        selectedPkgInstance,
      ),
    );
  };
};

export const setSelectedPluginInstance = (
  myID: string,
  selectedPkgInstance?: PkgInstance,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedPkgInstance }));
  };
};

export const resetSelectedPkgInstance = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedPkgInstance: undefined }));
  };
};

export const updateSelectedPkgInstance = (
  myID: string,
  pkgInstance: PkgInstance,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { pkgInstances } = me;
    const idx = pkgInstances.findIndex((each) => each.id === pkgInstance.id);
    if (idx === -1) {
      return;
    }

    const newPkgInstances = pkgInstances
      .slice(0, idx - 1)
      .concat([pkgInstance])
      .concat(pkgInstances.slice(idx + 1));

    dispatch(
      setPkgInstancesAndSelectedPkgInstance(myID, newPkgInstances, pkgInstance),
    );
  };
};

export const setPkgInstancesAndSelectedPkgInstance = (
  myID: string,
  pkgInstances: PkgInstance[],
  selectedPkgInstance?: PkgInstance,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(
      setData(myID, {
        selectedPkgInstance: selectedPkgInstance,
        pkgInstances: pkgInstances,
      }),
    );
  };
};

export const resetPkgInstances = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, defaultState));
  };
};

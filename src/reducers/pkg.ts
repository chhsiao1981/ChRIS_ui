import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { STATUS_OK } from "../api/constants";
import { getPkgCompEnvs, getPkgParams } from "../api/serverApi";
import type { ComputeEnv, PkgParameter } from "../api/types";
import { PkgNodeOperation } from "./types";

export const myClass = "chris-ui/pkg";

export interface State extends rState {
  nodeOperations: { [key: string]: boolean };
  requiredParams: PkgParameter[];
  optionalParams: PkgParameter[];
  computeEnvs: ComputeEnv[];
}

export const defaultState: State = {
  nodeOperations: {
    [PkgNodeOperation.ChildNode]: true,
    [PkgNodeOperation.ChildPipeline]: true,
    [PkgNodeOperation.GraphNode]: false,
    [PkgNodeOperation.DeleteNode]: true,
  },
  requiredParams: [],
  optionalParams: [],
  computeEnvs: [],
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const fetchParamsAndComputeEnv = (
  myID: string,
  pkgID: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data: params, errmsg } = await getPkgParams(pkgID);
    if (status !== STATUS_OK) {
      return;
    }
    if (errmsg) {
      return;
    }
    if (!params) {
      return;
    }

    const {
      status: status2,
      data: compEnvs,
      errmsg: errmsg2,
    } = await getPkgCompEnvs(pkgID);
    if (status2 !== STATUS_OK) {
      return;
    }
    if (errmsg2) {
      return;
    }
    if (!compEnvs) {
      return;
    }

    const requiredParams = params.filter((each) => !each.optional);
    const optionalParams = params.filter((each) => each.optional);
    const toUpdate = {
      requiredParams,
      optionalParams,
      computeEnvs: compEnvs,
    };

    dispatch(setData(myID, toUpdate));
  };
};

export const toggleNodeOperation = (
  myID: string,
  operation: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { nodeOperations } = me;
    const newNodeOperations = Object.assign({}, nodeOperations);
    newNodeOperations[operation] = !nodeOperations[operation];
    dispatch(setData(myID, { nodeOperations: newNodeOperations }));
  };
};

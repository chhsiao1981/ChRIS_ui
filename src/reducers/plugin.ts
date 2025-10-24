import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { STATUS_OK } from "../api/constants";
import { getPluginCompEnvs, getPluginParams } from "../api/serverApi";
import type { ComputeEnv, PluginParameter } from "../api/types";
import { NodeOperation } from "./types";

export const myClass = "chris-ui/plugin";

export interface State extends rState {
  nodeOperations: { [key: string]: boolean };
  requiredParams: PluginParameter[];
  optionalParams: PluginParameter[];
  computeEnvs: ComputeEnv[];
}

export const defaultState: State = {
  nodeOperations: {
    [NodeOperation.ChildNode]: true,
    [NodeOperation.ChildPipeline]: true,
    [NodeOperation.GraphNode]: false,
    [NodeOperation.DeleteNode]: true,
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
  pluginID: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data: params, errmsg } = await getPluginParams(pluginID);
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
    } = await getPluginCompEnvs(pluginID);
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

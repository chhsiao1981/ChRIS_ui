import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import {
  getPluginComputeResources,
  getPluginParameters,
} from "../api/serverApi/plugin";
import type { ComputeResource, Plugin, PluginParameter } from "../api/types";
import type { NodeOperation } from "../api/types/feed";

export const myClass = "chris-ui/plugin";

export interface State extends rState {
  parameters: {
    required: PluginParameter[];
    dropdown: PluginParameter[];
  };
  computeEnv: ComputeResource[];
  resourceError: string;
  nodeOperations: NodeOperation;
}

export const defaultState: State = {
  parameters: {
    dropdown: [],
    required: [],
  },
  computeEnv: [],
  resourceError: "",
  nodeOperations: {
    terminal: false,
    childNode: false,
    childPipeline: false,
    childGraph: false,
    deleteNode: false,
  },
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const fetchParamsAndComputeEnv = (
  myID: string,
  plugin: Plugin,
): Thunk<State> => {
  return async (dispatch, _) => {
    const limit = 20;
    const offset = 0;
    const {
      status: _status,
      data,
      errmsg,
    } = await getPluginParameters(plugin.id, offset, limit);
    if (errmsg) {
      dispatch(setData<State>(myID, { resourceError: errmsg }));
      return;
    }

    const params = data || [];
    const limit2 = 20;
    const offset2 = 0;
    const {
      status: _status2,
      data: data2,
      errmsg: errmsg2,
    } = await getPluginComputeResources(plugin.id, offset2, limit2);
    if (errmsg2) {
      dispatch(setData<State>(myID, { resourceError: errmsg2 }));
      return;
    }
    const computeEnvs = data2 || [];

    const required = params.filter(
      (param: PluginParameter) => param.optional === false,
    );
    const dropdown = params.filter(
      (param: PluginParameter) => param.optional === true,
    );

    const parameters = { required, dropdown };

    dispatch(setData<State>(myID, { parameters, computeEnv: computeEnvs }));
  };
};

export const getNodeOperations = (
  myID: string,
  operation: keyof NodeOperation,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { nodeOperations } = me;
    const newValue = !nodeOperations[operation];
    const newNnodeOperations = Object.assign({}, nodeOperations, {
      [operation]: newValue,
    });
    dispatch(setData<State>(myID, { nodeOperations: newNnodeOperations }));
  };
};

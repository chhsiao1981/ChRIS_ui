import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { ID, Plugin, PluginInstance, PluginMeta } from "../api/types";
import type { PluginNodeParameterMap } from "./types";

export const myClass = "chris-ui/add-node";

export interface State extends rState {
  stepIdReached: ID;
  nodes?: PluginInstance[];
  pluginMeta?: PluginMeta;
  selectedPluginFromMeta?: Plugin;
  selectedComputeEnv: string;
  errors?: Record<string, string>;
  editorValue: string;
  loading: boolean;
  isOpen: boolean;
  componentList: ID[];
  showPreviousRun: boolean;
  advancedConfig: {
    [key: string]: string;
  };
  memoryLimit: string;

  dropdownInput: PluginNodeParameterMap;
  requiredInput: PluginNodeParameterMap;
}

export const defaultState: State = {
  stepIdReached: 0,
  selectedComputeEnv: "",
  editorValue: "",
  loading: false,
  isOpen: false,
  componentList: [],
  showPreviousRun: false,
  advancedConfig: {},
  memoryLimit: "",

  dropdownInput: {},
  requiredInput: {},
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const setStepIdReached = (myID: string, theID: ID): Thunk<State> => {
  return (dispatch, _getClass) => {
    if (theID === 1) {
      dispatch(
        setData<State>(myID, {
          dropdownInput: {},
          requiredInut: {},
          stepIdReached: theID,
          showPreviousRun: false,
        }),
      );
      return;
    }

    dispatch(setData<State>(myID, { stepIdReached: theID }));
  };
};

export const setPluginMeta = (
  myID: string,
  pluginMeta: PluginMeta,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { pluginMeta }));
  };
};

export const deleteComponentList = (myID: string, theID: ID): Thunk<State> => {
  return (dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID) || defaultState;
    if (!me) {
      return;
    }
    const { componentList, dropdownInput } = me;
    const newComponentList = componentList.filter((key) => key !== theID);
    const newDropdownInput = Object.entries(dropdownInput)
      .filter(([key, _val]) => key !== theID)
      .reduce((r: PluginNodeParameterMap, [key, value], _i) => {
        r[key] = value;
        return r;
      }, {});
    dispatch(
      setData<State>(myID, {
        componentList: newComponentList,
        dropdownInput: newDropdownInput,
      }),
    );
  };
};

export const setComponentList = (
  myID: string,
  componentList: string[],
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { componentList }));
  };
};

export const setSelectedPluginFromMeta = (
  myID: string,
  plugin: Plugin,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { selectedPluginFromMeta: plugin }));
  };
};

export const toggleWizard = (myID: string, isOpen: boolean): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { isOpen }));
  };
};

export const setDropdownInput = (
  myID: string,
  input: PluginNodeParameterMap,
  editorValue: string,
): Thunk<State> => {
  return (dispatch, getClass) => {
    if (editorValue) {
      return dispatch(setData<State>(myID, { dropdownInput: input }));
    }

    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }
    const { dropdownInput } = me;
    const newDropdownInput = Object.assign({}, dropdownInput, input);
    dispatch(setData<State>(myID, { dropdownInput: newDropdownInput }));
  };
};

export const setRequiredInput = (
  myID: string,
  input: PluginNodeParameterMap,
  editorValue: string,
): Thunk<State> => {
  return (dispatch, getClass) => {
    if (editorValue) {
      return dispatch(setData<State>(myID, { requiredInput: input }));
    }

    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }
    const { requiredInput } = me;
    const newRequiredInput = Object.assign({}, requiredInput, input);
    dispatch(setData<State>(myID, { requiredInput: newRequiredInput }));
  };
};

export const setEditorValue = (
  myID: string,
  editorValue: string,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { editorValue }));
  };
};

export const setComputeEnv = (
  myID: string,
  computeEnv: string,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { selectedComputeEnv: computeEnv }));
  };
};

export const setShowPreviousRun = (
  myID: string,
  showPreviousRun: boolean,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { showPreviousRun }));
  };
};

export const setError = (
  myID: string,
  error: Record<string, string>,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { errors: error }));
  };
};

export const advancedConfig = (
  myID: string,
  key: string,
  value: string,
): Thunk<State> => {
  return (dispatch, getClass) => {
    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }
    const { advancedConfig } = me;
    const newAdvancedConfig = Object.assign({}, advancedConfig, {
      [key]: value,
    });
    dispatch(setData<State>(myID, { advancedConfig: newAdvancedConfig }));
  };
};

export const setMemoryLimit = (
  myID: string,
  memoryLimit: string,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, { memoryLimit }));
  };
};

export const reset = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, defaultState));
  };
};

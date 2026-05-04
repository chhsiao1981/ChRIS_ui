import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { TreeNode } from "../api/common";
import {
  deletePluginInstance as apiDeletePluginInstance,
  getPluginInstances,
} from "../api/serverApi";
import type { Feed, ID, List, PluginInstance } from "../api/types";

export const myClass = "chris-ui/plugin-instance";

// XXX TODO: flatten pluginInstances
export interface State extends rState {
  selectedPlugin?: PluginInstance;
  pluginInstances: {
    data: PluginInstance[];
    error: string;
    loading: boolean;
  };
  pluginInstanceList: List<PluginInstance>;
  chunkSize: number;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isProcessing: boolean;
  processingProgress: number;
  rootNode?: TreeNode;
}

export const defaultState: State = {
  pluginInstances: {
    data: [],
    error: "",
    loading: false,
  },
  pluginInstanceList: { results: [], count: 0 },
  chunkSize: 0,
  isFetchingNextPage: false,
  isProcessing: false,
  processingProgress: 0,
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

// XXX need to replace the name as setSelectedPluginInstance
export const getSelectedPlugin = (
  myID: string,
  pluginInstance: PluginInstance,
): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { selectedPlugin: pluginInstance }));
  };
};

export const resetSelectedPlugin = (myID: string): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { selectedPlugin: undefined }));
  };
};

export const setPluginTitle = (
  myID: string,
  pluginInstance: PluginInstance,
): Thunk<State> => {
  // XXX need to replace the name as setPluginInstance
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { pluginInstances } = me;
    const idx = pluginInstances.data.findIndex(
      (eachInstance) => eachInstance.id === pluginInstance.id,
    );
    if (idx === -1) {
      return;
    }
    const newPluginInstancesData = pluginInstances.data.map((each) => each);
    newPluginInstancesData[idx] = pluginInstance;
    const newPluginInstances = Object.assign({}, pluginInstances, {
      data: newPluginInstancesData,
    });

    dispatch(
      setData<State>(myID, {
        pluginInstances: newPluginInstances,
        selectedPlugin: pluginInstance,
      }),
    );
  };
};

export const setPluginInstancesAndSelectedPlugin = (
  myID: string,
  selectedPluginInstance?: PluginInstance,
  pluginInstances?: PluginInstance[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { pluginInstances: origPluginInstances } = me;
    const newPluginInstances = Object.assign({}, origPluginInstances, {
      data: pluginInstances,
    });
    dispatch(
      setData<State>(myID, {
        selectedPlugin: selectedPluginInstance,
        pluginInstances: newPluginInstances,
      }),
    );
  };
};

export const resetPluginInstances = (myID: string): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, defaultState));
  };
};

export const fetchPluginInstances = (
  myID: string,
  feed: Feed,
  offset: number = 0,
  limit: number = 15,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { pluginInstances } = me;

    const { status, data, errmsg } = await getPluginInstances(
      feed.id,
      offset,
      limit,
    );

    if (errmsg) {
      const newPluginInstances = Object.assign({}, pluginInstances, {
        error: errmsg,
      });
      dispatch(setData<State>(myID, newPluginInstances));
      return;
    }
    const newPluginInstancesData = data || [];

    if (!newPluginInstancesData.length) {
      return;
    }
    // default by selecting the last pluginInstance.
    const selectedPluginInstance =
      newPluginInstancesData[newPluginInstancesData.length - 1];

    dispatch(
      setPluginInstancesAndSelectedPlugin(
        myID,
        selectedPluginInstance,
        newPluginInstancesData,
      ),
    );
  };
};

export const addNode = (
  myID: string,
  pluginInstance: PluginInstance,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { pluginInstances } = me;
    const newPluginInstancesData = pluginInstances.data.concat([
      pluginInstance,
    ]);
    dispatch(
      setPluginInstancesAndSelectedPlugin(
        myID,
        pluginInstance,
        newPluginInstancesData,
      ),
    );
  };
};

export const deletePluginInstance = (
  myID: string,
  pluginInstance: PluginInstance,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { pluginInstances, selectedPlugin } = me;
    const descendantIds = getAllDescendantIDs(
      pluginInstances.data,
      pluginInstance.id,
    );

    const {
      status: _status,
      status: _data,
      errmsg,
    } = await apiDeletePluginInstance(pluginInstance.id);
    if (errmsg) {
      const newPluginInstances = Object.assign({}, pluginInstances, {
        error: errmsg,
      });
      dispatch(setData<State>(myID, { pluginInstances: newPluginInstances }));
      return;
    }
    const newPluginInstancesData = pluginInstances.data.filter(
      (instance) => !descendantIds.includes(instance.id),
    );

    if (selectedPlugin?.id !== pluginInstance.id) {
      dispatch(
        setPluginInstancesAndSelectedPlugin(
          myID,
          selectedPlugin,
          newPluginInstancesData,
        ),
      );
      return;
    }

    if (!pluginInstance.previous_id) {
      if (!newPluginInstancesData.length) {
        dispatch(
          setPluginInstancesAndSelectedPlugin(
            myID,
            undefined,
            newPluginInstancesData,
          ),
        );
        return;
      }

      const newSelected = newPluginInstancesData[0];
      dispatch(
        setPluginInstancesAndSelectedPlugin(
          myID,
          newSelected,
          newPluginInstancesData,
        ),
      );
      return;
    }

    const newSelectedList = newPluginInstancesData.filter(
      (each) => each.id === pluginInstance.previous_id,
    );
    if (newSelectedList.length !== 1) {
      dispatch(
        setPluginInstancesAndSelectedPlugin(
          myID,
          undefined,
          newPluginInstancesData,
        ),
      );
    }

    dispatch(
      setPluginInstancesAndSelectedPlugin(
        myID,
        newSelectedList[0],
        newPluginInstancesData,
      ),
    );
  };
};

const getAllDescendantIDs = (
  instances: PluginInstance[],
  parentId: ID,
): ID[] => {
  const parentIdToChildrenMap = new Map<ID, PluginInstance[]>();
  instances.forEach((instance) => {
    const previous_id = instance.previous_id;

    if (previous_id !== undefined && previous_id !== null) {
      if (!parentIdToChildrenMap.has(previous_id)) {
        parentIdToChildrenMap.set(previous_id, []);
      }
      parentIdToChildrenMap.get(previous_id)!.push(instance);
    }
  });

  const result: ID[] = [];
  getAllDescendantIDsCore(parentId, parentIdToChildrenMap, result);
  return result;
};

const getAllDescendantIDsCore = (
  theID: ID,
  parentIDToChildrenMap: Map<ID, PluginInstance[]>,
  result: ID[],
) => {
  result.push(theID);
  const children = parentIDToChildrenMap.get(theID) || [];
  for (const child of children) {
    getAllDescendantIDsCore(child.id, parentIDToChildrenMap, result);
  }
};

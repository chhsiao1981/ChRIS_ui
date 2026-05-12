import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import {
  createPluginInstance as apiCreatePluginInstance,
  deletePluginInstance as apiDeletePluginInstance,
  getPluginInstances,
} from "../api/serverApi";
import { getPluginParameters } from "../api/serverApi/plugin";
import type { Feed, ID, List, PluginInstance } from "../api/types";
import type { Err } from "../types";
import type * as DoAddNode from "./addNode";
import type {
  PluginNodeParameter,
  PluginNodeParameterMap,
  TreeNodeDatum,
  TSIDMap,
} from "./types";

export const myClass = "chris-ui/plugin-instance";

// XXX TODO: flatten pluginInstances
export interface State extends rState {
  selectedInstance?: PluginInstance;
  pluginInstances: {
    results: PluginInstance[];
    error: Err;
    loading: boolean;
  };
  pluginInstanceList: List<PluginInstance>;
  chunkSize: number;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;

  isLoading: boolean;
  processingProgress: number;
  rootNode?: TreeNodeDatum;
  tsIDs: TSIDMap;

  statuses: Record<ID, string>;
  errors: Record<string, string>;
}

export const defaultState: State = {
  pluginInstances: {
    results: [],
    error: "",
    loading: false,
  },
  pluginInstanceList: { results: [], count: 0 },
  chunkSize: 0,
  isFetchingNextPage: false,
  isLoading: false,
  processingProgress: 0,
  statuses: {},
  errors: {},
  tsIDs: {},
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

// XXX need to replace the name as setSelectedPluginInstance
export const setSelectedInstance = (
  myID: string,
  pluginInstance: PluginInstance,
): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { selectedInstance: pluginInstance }));
  };
};

export const resetSelectedInstance = (myID: string): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { selectedInstance: undefined }));
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
    const idx = pluginInstances.results.findIndex(
      (eachInstance) => eachInstance.id === pluginInstance.id,
    );
    if (idx === -1) {
      return;
    }
    const newPluginInstancesData = pluginInstances.results.map((each) => each);
    newPluginInstancesData[idx] = pluginInstance;
    const newPluginInstances = Object.assign({}, pluginInstances, {
      data: newPluginInstancesData,
    });

    dispatch(
      setData<State>(myID, {
        pluginInstances: newPluginInstances,
        selectedInstance: pluginInstance,
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
        selectedInstance: selectedPluginInstance,
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
    const newPluginInstancesData = pluginInstances.results.concat([
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
    const { pluginInstances, selectedInstance: selectedPlugin } = me;
    const descendantIds = getAllDescendantIDs(
      pluginInstances.results,
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
    const newPluginInstancesData = pluginInstances.results.filter(
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

export const createPluginInstance = (
  myID: string,
  selectedInstance: PluginInstance,
  addNode: DoAddNode.State,
): Thunk<State> => {
  return async (dispatch, _) => {
    const {
      dropdownInput,
      requiredInput,
      selectedPluginFromMeta,
      selectedComputeEnv,
      advancedConfig,
      memoryLimit,
    } = addNode;

    const [sanitizedAdvancedConfig, advancedConfigErrors] = sanitizeExtraConfig(
      advancedConfig,
      memoryLimit,
    );
    if (Object.keys(advancedConfigErrors).length > 0) {
      dispatch(setData<State>(myID, { errors: advancedConfigErrors }));
      return;
    }

    const [pluginInstance, pluginInstanceError] = await getPluginInstance(
      addNode,
      sanitizedAdvancedConfig,
    );
    if (pluginInstanceError) {
      const errors = { parameterInput: pluginInstanceError };
      dispatch(setData<State>(myID, { errors }));
      return;
    }

    if (!selectedPluginFromMeta) {
      return;
    }

    const {
      status,
      data: instance,
      errmsg,
    } = await apiCreatePluginInstance(selectedPluginFromMeta.id, {
      previous_id: selectedInstance.id,
      ...pluginInstance,
    });
    if (!instance) {
      dispatch(
        setData<State>(myID, {
          errors: { createPluginInstance: errmsg || "" },
        }),
      );
      return;
    }
  };
};

const sanitizeExtraConfig = (
  extraConfig: Record<string, string>,
  memoryLimit: string,
): [Record<string, string>, Record<string, string>] => {
  return [{}, {}];
};

const getPluginInstance = async (
  addNode: DoAddNode.State,
  extraConfig: Record<string, string>,
): Promise<[Partial<PluginInstance> | undefined, Err | undefined]> => {
  const [pluginParameters, err] = await compilePluginParameters(addNode);
  if (err) {
    return [undefined, err];
  }

  const fullPluginInstance: Partial<PluginInstance> = {
    ...pluginParameters,
    compute_resource_name: addNode.selectedComputeEnv,
    ...extraConfig,
  };
  return [fullPluginInstance, undefined];
};

const compilePluginParameters = async (
  addNode: DoAddNode.State,
): Promise<[Partial<PluginInstance> | undefined, Err | undefined]> => {
  const { dropdownInput, requiredInput, selectedPluginFromMeta } = addNode;
  if (!selectedPluginFromMeta) {
    return [undefined, "no plugin selected"];
  }

  const {
    status,
    data: params,
    errmsg,
  } = await getPluginParameters(selectedPluginFromMeta.id);
  if (errmsg) {
    return [undefined, errmsg];
  }
  if (!params) {
    return [undefined, "no params"];
  }

  const dropdownByFlag = toParameterByFlag(dropdownInput);
  const requiredByFlag = toParameterByFlag(requiredInput);

  const nodeParams = { ...dropdownByFlag, ...requiredByFlag };
  const nodeParamsWithDefaultByName = params.reduce(
    (r: Record<string, any>, eachParam, i) => {
      const { flag, default: defaultValue, name } = eachParam;
      const eachNodeParam = nodeParams[flag];
      if (!eachNodeParam) {
        return r;
      }

      const { value: nodeParamValue, type: theType } = eachNodeParam;

      // with valid sanitizedValue
      const sanitizedValue = stripQuotes(nodeParamValue);
      if (sanitizedValue || sanitizedValue === 0) {
        r[name] = sanitizedValue;
        return r;
      }
      // XXX we have "" as "", not defaultValue, if the type is string.
      //     implying that the updated value for this string-typed variable is ""
      if (theType === "string" && sanitizedValue === "") {
        r[name] = "";
        return r;
      }

      r[name] = defaultValue;
      return r;
    },
    {},
  );

  return [nodeParamsWithDefaultByName, undefined];
};

const stripQuotes = (value: any) => {
  if (typeof value === "string") {
    const singleQuoted = value.startsWith("'") && value.endsWith("'");
    const doubleQuoted = value.startsWith('"') && value.endsWith('"');
    if (singleQuoted || doubleQuoted) {
      return value.slice(1, -1);
    }
  }
  return value;
};

const toParameterByFlag = (input: PluginNodeParameterMap) => {
  return Object.keys(input).reduce(
    (r: Record<string, PluginNodeParameter>, key: string) => {
      const flag = input[key].flag;
      r[flag] = input[key];
      return r;
    },
    {},
  );
};

const appendPluginInstances = () => {
  /*
      if (!rootNode) return;
      const newItems = Array.isArray(arg) ? arg : [arg];
      const addedItems: PluginInstance[] = [];
      let updatedRoot = rootNode;

      for (const newItem of newItems) {
        const parentId = newItem.previous_id ?? undefined;
        if (!parentId) continue;

        const newChild: TreeNodeDatum = {
          id: newItem.id,
          name: newItem.title || newItem.plugin_name || `Node ${newItem.id}`,
          parentId,
          item: newItem,
          children: [],
        };

        const nextRoot = insertChildImmutable(updatedRoot, parentId, newChild);
        if (nextRoot !== updatedRoot) {
          updatedRoot = nextRoot;
          addedItems.push(newItem);
        }
      }

      if (addedItems.length > 0) {
        setRootNode(updatedRoot);
        setLocalItems((prev) => [...prev, ...addedItems]);
        const lastAdded = addedItems[addedItems.length - 1];
        doPluginInstance.getSelectedPlugin(pluginInstanceID, lastAdded);
        await queryClient.invalidateQueries({
          queryKey: ["feedPluginInstances", feed?.id, "countOnly"],
        });
      }
    },
    */
};

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
} from "../api/serverApi";
import { getPluginParameters } from "../api/serverApi/plugin";
import {
  getPluginInstanceList,
  getPluginInstanceParameters,
} from "../api/serverApi/pluginInstance";
import type {
  Feed,
  ID,
  List,
  PluginInstance,
  PluginInstanceStatus,
} from "../api/types";
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
  instanceList: List<PluginInstance>;
  treeNodeMap: Record<ID, TreeNodeDatum>;
  rootNode?: TreeNodeDatum;

  chunkSize: number;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;

  isLoading: boolean;
  processingProgress: number;
  tsIDs: TSIDMap;

  statuses: Record<ID, string>;
  errors: Record<string, Err>;
}

export const defaultState: State = {
  instanceList: { results: [], count: 0 },
  chunkSize: 0,
  isFetchingNextPage: false,
  isLoading: false,
  processingProgress: 0,
  statuses: {},
  errors: {},
  tsIDs: {},
  treeNodeMap: {},
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

// XXX need to replace the name as setSelectedPluginInstance
export const setSelectedInstance = (
  myID: string,
  selectedInstance: PluginInstance,
): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { selectedInstance }));
  };
};

export const setError = (
  myID: string,
  prompt: string,
  error: Err,
): Thunk<State> => {
  return (dispatch, getClass) => {
    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }
    const { errors } = me;
    const newErrors = Object.assign({}, errors, { [prompt]: error });
    dispatch(setData(myID, { errors: newErrors }));
  };
};

export const setErrors = (
  myID: string,
  errors: Record<string, Err>,
): Thunk<State> => {
  return (dispatch, getClass) => {
    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }
    const { errors: origErrors } = me;
    const newErrors = Object.assign({}, origErrors, errors);
    dispatch(setData(myID, { errors: newErrors }));
  };
};

export const resetSelectedInstance = (myID: string): Thunk<State> => {
  return (dispatch, _getClassState) => {
    dispatch(setData<State>(myID, { selectedInstance: undefined }));
  };
};

export const updateInstance = (
  myID: string,
  instance: PluginInstance,
): Thunk<State> => {
  // update the instance with same ID
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { instanceList, treeNodeMap } = me;

    // 1. check existence
    const idx = instanceList.results.findIndex(
      (eachInstance) => eachInstance.id === instance.id,
    );
    if (idx === -1) {
      // XXX silent death if not found.
      return;
    }

    // 2. newInstanceList.
    const newResults = instanceList.results.map((each) => each);
    newResults[idx] = instance;
    const newInstanceList: List<PluginInstance> = Object.assign(
      {},
      instanceList,
      {
        results: newResults,
      },
    );

    // 3. newNode
    const newNode = instanceToTreeNode(instance);
    const { id: theID, previous_id: parentID } = instance;
    const origNode = treeNodeMap[theID];
    newNode.children = origNode.children;

    // 4. newParentNode
    const newParentNode = updateInstanceUpdateParentNode(
      newNode,
      theID,
      parentID,
      treeNodeMap,
    );

    // 5. setup toUpdateNode
    const toUpdateNode = { [theID]: newNode };
    if (newParentNode && parentID) {
      toUpdateNode[parentID] = newParentNode;
    }

    // 6. newTreeNodeMap
    const newTreeNodeMap: Record<ID, TreeNodeDatum> = Object.assign(
      {},
      treeNodeMap,
      toUpdateNode,
    );

    // 4. setup to-update
    const toUpdate: Partial<State> = {
      instanceList: newInstanceList,
      treeNodeMap: newTreeNodeMap,
    };
    if (!parentID) {
      toUpdate.rootNode = newNode;
    }

    dispatch(setData<State>(myID, toUpdate));
  };
};

const updateInstanceUpdateParentNode = (
  node: TreeNodeDatum,
  theID: ID,
  parentID: ID | null,
  treeNodeMap: Record<ID, TreeNodeDatum>,
): TreeNodeDatum | undefined => {
  if (!parentID) {
    return;
  }

  const parentNode = treeNodeMap[parentID];
  if (!parentNode) {
    return;
  }
  const { children } = parentNode;
  const newChildren = children.map((each) => each);
  const idx = newChildren.findIndex((eachNode) => eachNode.id === theID);
  if (idx === -1) {
    return;
  }

  newChildren[idx] = node;

  return Object.assign({}, parentNode, {
    children: newChildren,
  });
};

export const setInstanceListAndSelectedInstance = (
  myID: string,
  selectedInstance?: PluginInstance,
  instanceList?: List<PluginInstance>,
): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(
      setData<State>(myID, {
        selectedInstance,
        instanceList: instanceList,
      }),
    );
  };
};

export const reset = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData<State>(myID, defaultState));
  };
};

export const fetchAllInstanceList = (
  myID: string,
  feed: Feed,
): Thunk<State> => {
  return async (dispatch, _getClass) => {
    const allResults: PluginInstance[] = [];
    let count = 0;
    let offset: number | null | undefined = 0;
    const limit = 15;
    dispatch(setData<State>(myID, { isLoading: true }));
    while (true) {
      const {
        status,
        data: eachInstanceList,
        errmsg,
      } = await getPluginInstanceList(feed.id, offset as number, limit);
      if (errmsg) {
        dispatch(setData<State>(myID, { isLoading: false }));
        dispatch(setError(myID, "fetchAllInstanceList", errmsg));
        return;
      }
      if (!eachInstanceList) {
        dispatch(setData<State>(myID, { isLoading: false }));
        dispatch(setError(myID, "fetchAllInstanceList", "no instanceList"));
        return;
      }
      allResults.push(...eachInstanceList.results);
      count = eachInstanceList.count;

      offset = eachInstanceList.next;
      if (!offset) {
        break;
      }

      const progress = (allResults.length * 100) / count;
      dispatch(
        setData<State>(myID, {
          processingProgress: progress,
        }),
      );
    }

    const instanceList: List<PluginInstance> = {
      results: allResults,
      count,
    };

    const statuses: Record<ID, PluginInstanceStatus> = allResults.reduce(
      (r, eachResult) => {
        // @ts-expect-error id is a number or string
        r[eachResult.id] = eachResult.status;
        return r;
      },
      {},
    );

    const [tsIDs, errmsg] = await getTSIDMapByInstances(allResults);
    if (errmsg) {
      dispatch(
        setError(myID, "fetchAllInstanceList: unable to get tsIDs", errmsg),
      );
      return;
    }

    const [rootNode, treeNodeMap] = compileTreeNode(allResults);

    dispatch(
      setData<State>(myID, {
        isLoading: false,
        processingProgress: 100,
        instanceList,
        statuses,
        tsIDs,
        rootNode,
        treeNodeMap,
      }),
    );
  };
};

const getTSIDMapByInstances = async (
  instances: PluginInstance[],
): Promise<[TSIDMap, Err]> => {
  const tsIDMap: TSIDMap = {};
  for (const eachInstance of instances) {
    if (eachInstance.plugin_type !== "ts") {
      continue;
    }

    const { status, data, errmsg } = await getPluginInstanceParameters(
      eachInstance.id,
      0,
      15,
    );
    if (errmsg) {
      return [tsIDMap, errmsg];
    }
    const parameters = data || [];
    const filteredParameters = parameters.filter(
      (param) => param.param_name === "plugininstances",
    );
    if (!filteredParameters.length) {
      continue;
    }

    tsIDMap[eachInstance.id] = filteredParameters[0].value
      .split(",")
      .map(Number);
  }

  return [tsIDMap, ""];
};

const compileTreeNode = (
  instances: PluginInstance[],
): [TreeNodeDatum | undefined, Record<ID, TreeNodeDatum>] => {
  let rootNode: TreeNodeDatum | undefined;
  const childrenMap: Record<ID, ID[]> = {};
  const treeNodeMap: Record<ID, TreeNodeDatum> = {};

  for (const eachInstance of instances) {
    const { id: theID, previous_id: parentID } = eachInstance;

    // 1. compile tree-node
    const node = instanceToTreeNode(eachInstance);
    treeNodeMap[theID] = node;

    // 2. check already-visited children
    if (childrenMap[theID]) {
      const children = childrenMap[theID];
      for (const eachChildID of children) {
        const childNode = treeNodeMap[eachChildID];
        if (!childNode) continue;

        node.children.push(childNode);
      }
    }

    // 3. check parent
    // 3.1. root node
    if (!parentID) {
      rootNode = node;
      continue;
    }
    // 3.2. already visited parentNode
    const parentNode = treeNodeMap[parentID];
    if (parentNode) {
      parentNode.children.push(node);
      continue;
    }
    // 3.3. put to childrenMap
    if (!childrenMap[parentID]) {
      childrenMap[parentID] = [];
    }
    childrenMap[parentID].push(theID);
  }

  return [rootNode, treeNodeMap];
};

const instanceToTreeNode = (instance: PluginInstance): TreeNodeDatum => {
  return {
    id: instance.id,
    name: instance.plugin_name,
    parentId: instance.previous_id,
    item: instance,
    children: [],
  };
};

export const addNode = (
  myID: string,
  instance: PluginInstance,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { instanceList } = me;
    const newResults = instanceList.results.concat([instance]);
    const newInstanceList: List<PluginInstance> = Object.assign(
      {},
      instanceList,
      { results: newResults },
    );
    dispatch(
      setInstanceListAndSelectedInstance(myID, instance, newInstanceList),
    );
  };
};

export const deletePluginInstance = (
  myID: string,
  instance: PluginInstance,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { instanceList, selectedInstance } = me;
    const descendantIds = getAllDescendantIDs(
      instanceList.results,
      instance.id,
    );

    const {
      status: _status,
      status: _data,
      errmsg,
    } = await apiDeletePluginInstance(instance.id);

    if (errmsg) {
      dispatch(setError(myID, "deleteInstance", errmsg));
      return;
    }
    const newResults = instanceList.results.filter(
      (instance) => !descendantIds.includes(instance.id),
    );
    const newCount =
      newResults.length === instanceList.results.length
        ? instanceList.count
        : instanceList.count - 1;
    const newInstanceList: List<PluginInstance> = Object.assign(
      {},
      instanceList,
      { results: newResults, count: newCount },
    );

    if (selectedInstance?.id !== instance.id) {
      dispatch(
        setInstanceListAndSelectedInstance(
          myID,
          selectedInstance,
          newInstanceList,
        ),
      );
      return;
    }

    if (!instance.previous_id) {
      if (!newResults.length) {
        dispatch(
          setInstanceListAndSelectedInstance(myID, undefined, newInstanceList),
        );
        return;
      }

      const newSelectedInstance = newResults[0];
      dispatch(
        setInstanceListAndSelectedInstance(
          myID,
          newSelectedInstance,
          newInstanceList,
        ),
      );
      return;
    }

    const newSelectedInstances = newResults.filter(
      (each) => each.id === instance.previous_id,
    );
    if (!newSelectedInstances.length) {
      dispatch(
        setInstanceListAndSelectedInstance(myID, undefined, newInstanceList),
      );
    }

    dispatch(
      setInstanceListAndSelectedInstance(
        myID,
        newSelectedInstances[0],
        newInstanceList,
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

export const createInstance = (
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

    const [sanitizedExtraConfig, extraConfigErrors] = sanitizeExtraConfig(
      advancedConfig,
      memoryLimit,
    );
    if (Object.keys(extraConfigErrors).length > 0) {
      dispatch(setErrors(myID, extraConfigErrors));
      return;
    }

    const [instanceParameter, instanceParameterError] =
      await compileInstanceConfig(addNode, sanitizedExtraConfig);
    if (instanceParameterError) {
      dispatch(
        setError(
          myID,
          "createInstance: compileInstanceParameter",
          instanceParameterError,
        ),
      );
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
      ...instanceParameter,
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

const compileInstanceConfig = async (
  addNode: DoAddNode.State,
  extraConfig: Record<string, string>,
): Promise<[Partial<PluginInstance> | undefined, Err | undefined]> => {
  const [pluginParameters, err] = await compilePluginParameters(addNode);
  if (err) {
    return [undefined, err];
  }

  const fullParameters: Partial<PluginInstance> = {
    ...pluginParameters,
    compute_resource_name: addNode.selectedComputeEnv,
    ...extraConfig,
  };
  return [fullParameters, undefined];
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

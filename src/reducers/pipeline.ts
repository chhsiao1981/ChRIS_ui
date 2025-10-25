import {
  init as _init,
  genUUID,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type {
  ComputeEnv,
  ID,
  Pipeline,
  Pkg,
  PkgNode,
  PkgNodeDefaultParameter,
} from "../api/types";
import type { ComputeEnvByNameMap, PipelineInfo } from "./types";

export const myClass = "chris-ui/pipeline";

export interface State extends rState {
  pipelineInfoMap: { [pipelineID: ID]: PipelineInfo };
  activePkgNodeIDMap: { [pipelineID: ID]: string };
  computeInfoMap: { [pipelineID: ID]: ComputeEnvByNameMap };
  // XXX used for changed title.
  titleInfoMap: { [pipelineID: ID]: { [pkgNodeID: ID]: string } };
  selectedComputeEnvMap: { [pipelineID: ID]: string };
  pipelineToAdd?: Pipeline;
}

export const defaultState: State = {
  pipelineInfoMap: {},
  activePkgNodeIDMap: {},
  computeInfoMap: {},
  titleInfoMap: {},
  selectedComputeEnvMap: {},
  pipelineToAdd: undefined,
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    const myID = genUUID();
    dispatch(_init({ myID, state: defaultState }));
    dispatch(fetchPipelines(myID));
  };
};

export const fetchPipelines = (
  myID: string,
  page = 1,
  perPage = 20,
  search = "",
): Thunk<State> => {
  return () => {};
};

export const setPipeline = (
  myID: string,
  pipelineID: ID,
  pipeline: Pipeline,
  pkgNodes: PkgNode[],
  parameters: PkgNodeDefaultParameter[],
  pkgs: Pkg[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { pipelineInfoMap: pipelineMap } = me;

    const pipelineInfo: PipelineInfo = {
      pipeline,
      parameters,
      pkgNodes,
      pkgs,
    };

    const newPipelineMap = Object.assign({}, pipelineMap, {
      [pipelineID]: pipelineInfo,
    });

    dispatch(setData<State>(myID, { pipelineInfoMap: newPipelineMap }));
  };
};

export const setComputeEnvs = (
  myID: string,
  pipelineID: ID,
  computeEnvs: ComputeEnv[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { computeInfoMap } = me;

    const computeEnvMap = computeEnvs.reduce((r: ComputeEnvByNameMap, each) => {
      r[each.name] = each;
      return r;
    }, {});
    const newComputeInfoMap = Object.assign({}, computeInfoMap, {
      [pipelineID]: { computeEnvMap },
    });

    dispatch(setData<State>(myID, { computeInfoMap: newComputeInfoMap }));
  };
};

export const changeTitle = (
  myID: string,
  pipelineID: ID,
  pkgNodeID: ID,
  title: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState);
    if (!me) {
      return;
    }

    const { titleInfoMap: titleInfo } = me;
    const titleByPipeline = titleInfo[pipelineID] || {};
    const newTitleByPipeline = Object.assign({}, titleByPipeline, {
      [pkgNodeID]: title,
    });
    const newTitleInfo = Object.assign({}, titleInfo, {
      [pipelineID]: newTitleByPipeline,
    });
    dispatch(setData<State>(myID, { titleInfoMap: newTitleInfo }));
  };
};

export const setSelectedComputeEnv = (
  myID: string,
  pipelineID: number,
  computeEnvName: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedComputeEnvMap } = me;
    const newSelectedComputeEnvMap = Object.assign({}, selectedComputeEnvMap, {
      [pipelineID]: computeEnvName,
    });

    dispatch(
      setData<State>(myID, { selectedComputeEnvMap: newSelectedComputeEnvMap }),
    );
  };
};

export const setActivePkgNode = (
  myID: string,
  pipelineID: ID,
  pkgNodeID: ID,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { activePkgNodeIDMap } = me;
    const newActivePkgNodeIDMap = Object.assign({}, activePkgNodeIDMap, {
      [pipelineID]: pkgNodeID,
    });
    dispatch(
      setData<State>(myID, { activePkgNodeIDMap: newActivePkgNodeIDMap }),
    );
  };
};

export const pipelineToAdd = (
  myID: string,
  pipeline?: Pipeline,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, { pipelineToAdd: pipeline }));
  };
};

export const resetPipelineToAdd = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, { pipelineToAdd: undefined }));
  };
};

export const reset = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, defaultState));
  };
};

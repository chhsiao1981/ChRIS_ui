import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { Data } from "../api/types";
import type { SelectionPayload } from "../store/cart/types";
import {
  type DownloadStatus,
  type DownloadStatusObject,
  DownloadTypes,
  type FileUpload,
  type FileUploadObject,
  type FolderUpload,
  type FolderUploadObject,
} from "./types";

export const myClass = "chris-ui/user";

export interface State extends rState {
  currentLayout: string;
  selectedPaths: SelectionPayload[];
  openCart: boolean;
  folderDownloadStatus: DownloadStatus;
  fileDownloadStatus: DownloadStatus;
  folderUploadStatus: FolderUpload;
  fileUploadStatus: FileUpload;
}

export const defaultState: State = {
  currentLayout: "list",
  selectedPaths: [],
  openCart: false,
  folderDownloadStatus: {},
  fileDownloadStatus: {},
  folderUploadStatus: {},
  fileUploadStatus: {},
};

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const switchLibraryLayout = (
  myID: string,
  layout: string,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { currentLayout: layout }));
  };
};

export const startUpload = (
  myID: string,
  files: File[],
  isFolder: boolean,
  currentPath: string,
  createFeed?: boolean,
  nameForFeed?: string,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { openCart: true }));
  };
};

export const startDownload = (
  myID: string,
  paths: SelectionPayload[],
  username: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

export const startAnonymize = (
  myID: string,
  paths: SelectionPayload[],
  username: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

export const setSelectedPaths = (
  myID: string,
  path: SelectionPayload,
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
  paths: SelectionPayload[],
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

export const clearSelectedPaths = (
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
    const newSelectedPaths = selectedPaths.filter(
      (pathObj) => pathObj.path !== path,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const clearAllPaths = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedPaths: [] }));
  };
};

export const clearDownloadStatus = (
  myID: string,
  theID: number,
  theType: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { folderDownloadStatus, fileDownloadStatus } = me;
    if (theType === "folder") {
      const newFolderDownloadStatus = Object.assign({}, folderDownloadStatus);
      delete newFolderDownloadStatus[theID];
      dispatch(
        setData(myID, { folderDownloadStatus: newFolderDownloadStatus }),
      );
    } else if (theType === "file") {
      const newFileDownloadStatus = Object.assign({}, fileDownloadStatus);
      delete newFileDownloadStatus[theID];
      dispatch(setData(myID, { fileDownloadStatus: newFileDownloadStatus }));
    }
  };
};

export const setToggleCart = (myID: string): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { openCart } = me;

    dispatch(setData(myID, { openCart: !openCart }));
  };
};

export const setFileDownloadStatus = (
  myID: string,
  fileID: number,
  step: DownloadTypes,
  filename: string,
  error?: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { fileDownloadStatus, selectedPaths } = me;
    const downloadStatusObj: DownloadStatusObject = {
      step,
      filename,
      error,
    };
    const downloadStatus: DownloadStatus = { [fileID]: downloadStatusObj };
    const newFileDownloadStatus = Object.assign(
      {},
      fileDownloadStatus,
      downloadStatus,
    );
    dispatch(setData(myID, { fileDownloadStatus: newFileDownloadStatus }));

    if (step !== DownloadTypes.finished) {
      return;
    }

    const newSelectedPaths = selectedPaths.filter(
      (selected) => selected.path !== filename,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const setFolderDownloadStatus = (
  myID: string,
  folderID: number,
  step: DownloadTypes,
  filename: string,
  error?: string,
  feed?: Data,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { folderDownloadStatus, selectedPaths } = me;
    const downloadStatusObj: DownloadStatusObject = {
      step,
      filename,
      error,
      feed,
    };
    const downloadStatus: DownloadStatus = { [folderID]: downloadStatusObj };
    const newFolderDownloadStatus = Object.assign(
      {},
      folderDownloadStatus,
      downloadStatus,
    );
    dispatch(setData(myID, { folderDownloadStatus: newFolderDownloadStatus }));

    if (step !== DownloadTypes.finished) {
      return;
    }

    const newSelectedPaths = selectedPaths.filter(
      (selected) => selected.path !== filename,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const setFileUploadStatus = (
  myID: string,
  step: string,
  filename: string,
  progress: number,
  loaded: number,
  total: number,
  controller: AbortController | null,
  path: string,
  theType: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { fileUploadStatus, selectedPaths } = me;
    const fileUploadObj: FileUploadObject = {
      currentStep: step,
      progress: progress,
      loaded,
      total,
      controller,
      path,
      type: theType,
    };
    const fileUpload: FileUpload = { [filename]: fileUploadObj };
    const newFileUploadStatus = Object.assign({}, fileUploadStatus, fileUpload);
    dispatch(setData(myID, { fileUploadStatus: newFileUploadStatus }));

    if (step !== "Upload Complete") {
      return;
    }

    const newSelectedPaths = selectedPaths.filter(
      (selected) => selected.path !== path,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const setFolderUploadStatus = (
  myID: string,
  step: string,
  filename: string,
  totalCount: number,
  currentCount: number,
  controller: AbortController | null,
  path: string,
  theType: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { folderUploadStatus, selectedPaths } = me;
    const folderUploadObj: FolderUploadObject = {
      currentStep: step,
      done: currentCount,
      total: totalCount,
      controller,
      path,
      type: theType,
    };
    const folderUpload = { [filename]: folderUploadObj };
    const newFolderUploadStatus = Object.assign(
      {},
      folderUploadStatus,
      folderUpload,
    );
    dispatch(setData(myID, { folderUploadStatus: newFolderUploadStatus }));

    if (step !== "Upload Complete") {
      return;
    }

    const newSelectedPaths = selectedPaths.filter(
      (selected) => selected.path !== path,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const removeSelectedPayload = (
  myID: string,
  payload: SelectionPayload,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths } = me;
    const newSelectedPaths = selectedPaths.filter(
      (each) => each.path !== payload.path,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const clearUploadState = (
  myID: string,
  theID: number,
  theType: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { folderUploadStatus, fileUploadStatus } = me;
    if (theType === "folder") {
      const newFolderUploadStatus = Object.assign({}, folderUploadStatus);
      delete newFolderUploadStatus[theID];
      dispatch(setData(myID, { folderUploadStatus: newFolderUploadStatus }));
    } else {
      const newFileUploadStatus = Object.assign({}, fileUploadStatus);
      delete newFileUploadStatus[theID];
      dispatch(setData(myID, { fileUploadStatus: newFileUploadStatus }));
    }
  };
};

export const clearCart = (myID: string): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const {
      folderUploadStatus,
      fileUploadStatus,
      folderDownloadStatus,
      fileDownloadStatus,
    } = me;

    const newFolderUploadStatus = Object.fromEntries(
      Object.entries(folderUploadStatus).filter(
        ([_, value]) => value.currentStep !== "Upload Complete",
      ),
    );
    const newFileUploadStatus = Object.fromEntries(
      Object.entries(fileUploadStatus).filter(
        ([_, value]) => value.currentStep !== "Upload Complete",
      ),
    );
    const newFolderDownloadStatus = Object.fromEntries(
      Object.entries(folderDownloadStatus).filter(
        ([_, value]) => value.step !== DownloadTypes.finished,
      ),
    );
    const newFileDownloadStatus = Object.fromEntries(
      Object.entries(fileDownloadStatus).filter(
        ([_, value]) => value.step !== DownloadTypes.finished,
      ),
    );
    const toUpdate: Partial<State> = {
      selectedPaths: [],
      folderUploadStatus: newFolderUploadStatus,
      fileUploadStatus: newFileUploadStatus,
      folderDownloadStatus: newFolderDownloadStatus,
      fileDownloadStatus: newFileDownloadStatus,
    };
    dispatch(setData(myID, toUpdate));
  };
};

export const clearCartOnLogout = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    const toUpdate: Partial<State> = {
      selectedPaths: [],
      folderDownloadStatus: {},
      fileDownloadStatus: {},
      folderUploadStatus: {},
      fileUploadStatus: {},
    };
    dispatch(setData(myID, toUpdate));
  };
};

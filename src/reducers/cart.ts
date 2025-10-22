import {
  init as _init,
  genUUID,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { select } from "d3-selection";
import type { Feed } from "../api/types";
import {
  CartLayout,
  type DownloadStatus,
  DownloadStep,
  type FileUpload,
  type FolderUpload,
  PathType,
  type SelectedPath,
  UploadStep,
} from "./types";

export const myClass = "chris-ui/cart";

export interface State extends rState {
  currentLayout: CartLayout;
  selectedPaths: SelectedPath[];
  openCart: boolean;
  folderDownloadStatus: DownloadStatus;
  fileDownloadStatus: DownloadStatus;
  folderUploadStatus: FolderUpload;
  fileUploadStatus: FileUpload;
}

export const defaultState: State = {
  currentLayout: CartLayout.List,
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

export const switchLayout = (
  myID: string,
  layout: CartLayout,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { currentLayout: layout }));
  };
};

export const startUpload = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { openCart: true }));
  };
};

export const addSelectedPath = (
  myID: string,
  selectedPath: SelectedPath,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths: origSelectedPaths } = me;
    const newSelectedPaths = origSelectedPaths.concat([selectedPath]);
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const bulkAddSelectedPaths = (
  myID: string,
  selectedPaths: SelectedPath[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths: origSelectedPaths } = me;
    const newSelectedPaths = origSelectedPaths.concat(selectedPaths);
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const removeSelectedPath = (
  myID: string,
  path: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths: origSelectedPaths } = me;
    const newSelectedPaths = origSelectedPaths.filter(
      (each) => each.path !== path,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

export const clearSelectedPaths = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedPaths: [] }));
  };
};

export const removeDownloadStatus = (
  myID: string,
  path: string,
  theType: PathType,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const downloadStatus =
      theType === PathType.Folder
        ? me.folderDownloadStatus
        : me.fileDownloadStatus;

    const newDownloadStatus = Object.assign({}, downloadStatus);
    delete newDownloadStatus[path];

    const downloadStatusPrompt =
      theType === PathType.Folder
        ? "folderDownloadStatus"
        : "fileDownloadStatus";

    dispatch(setData(myID, { [downloadStatusPrompt]: newDownloadStatus }));
  };
};

export const setFileDownloadStatus = (
  myID: string,
  path: string,
  step: DownloadStep,
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
    const newFileDownloadStatus = Object.assign({}, fileDownloadStatus);
    newFileDownloadStatus[path] = { step, filename, error };

    const toUpdate: Partial<State> = {
      fileDownloadStatus: newFileDownloadStatus,
    };

    if (step === DownloadStep.finished) {
      const newSelectedPaths = selectedPaths.filter(
        (each) => each.path !== filename,
      );
      toUpdate.selectedPaths = newSelectedPaths;
    }
    dispatch(setData(myID, toUpdate));
  };
};

export const setFolderDownloadStatus = (
  myID: string,
  path: string,
  step: DownloadStep,
  filename: string,
  error?: string,
  feed?: Feed,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { folderDownloadStatus, selectedPaths } = me;
    const newFolderDownloadStatus = Object.assign({}, folderDownloadStatus);
    newFolderDownloadStatus[path] = { step, filename, error, feed };

    const toUpdate: Partial<State> = {
      folderDownloadStatus: newFolderDownloadStatus,
    };

    if (step === DownloadStep.finished) {
      const newSelectedPaths = selectedPaths.filter(
        (each) => each.path !== filename,
      );
      toUpdate.selectedPaths = newSelectedPaths;
    }
    dispatch(setData(myID, toUpdate));
  };
};

export const setFileUploadStatus = (
  myID: string,
  step: UploadStep,
  filename: string,
  progress: number,
  loaded: number,
  total: number,
  controller: AbortController | null,
  path: string,
  pathType: PathType,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { fileUploadStatus, selectedPaths } = me;
    const newFileUploadStatus = Object.assign({}, fileUploadStatus);
    newFileUploadStatus[filename] = {
      currentStep: step,
      progress,
      loaded,
      total,
      controller,
      path,
      type: pathType,
    };

    const toUpdate: Partial<State> = { fileUploadStatus: newFileUploadStatus };
    if (step === UploadStep.Complete) {
      const newSelectedPaths = selectedPaths.filter(
        (each) => each.path !== path,
      );
      toUpdate.selectedPaths = newSelectedPaths;
    }
    dispatch(setData(myID, toUpdate));
  };
};

export const setFolderUploadStatus = (
  myID: string,
  step: UploadStep,
  filename: string,
  totalCount: number,
  currentCount: number,
  controller: AbortController | null,
  path: string,
  pathType: PathType,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { folderUploadStatus, selectedPaths } = me;
    const newFolderUploadStatus = Object.assign({}, folderUploadStatus);
    newFolderUploadStatus[filename] = {
      currentStep: step,
      done: currentCount,
      total: totalCount,
      controller,
      path,
      type: pathType,
    };

    const toUpdate: Partial<State> = {
      folderUploadStatus: newFolderUploadStatus,
    };
    if (step === UploadStep.Complete) {
      const newSelectedPaths = selectedPaths.filter(
        (each) => each.path !== path,
      );
      toUpdate.selectedPaths = newSelectedPaths;
    }
    dispatch(setData(myID, toUpdate));
  };
};

export const removeUploadStatus = (
  myID: string,
  path: string,
  theType: PathType,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const uploadStatus =
      theType === PathType.Folder ? me.folderUploadStatus : me.fileUploadStatus;

    const newUploadStatus = Object.assign({}, uploadStatus);
    delete newUploadStatus[path];

    const uploadStatusPrompt =
      theType === PathType.Folder ? "folderUploadStatus" : "fileUploadStatus";

    dispatch(setData(myID, { [uploadStatusPrompt]: newUploadStatus }));
  };
};

export const clearCart = (myID: string): Thunk<State> => {
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

export const toggle = (myID: string): Thunk<State> => {
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

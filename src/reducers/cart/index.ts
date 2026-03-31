import {
  init as _init,
  getState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { CartSelection } from "../types";
import { deleteSelectedPaths } from "./delete";
import { clearDownloadStatus, startDownload } from "./download";
import { merge } from "./merge";
import { rename } from "./rename";
import {
  clearAllPaths,
  removeSelected,
  removeSelectedPath,
  setBulkSelectedPaths,
  setSelectedPath,
  toggleSelectedFeed,
} from "./selected";
import { share } from "./share";
import { defaultState, type State } from "./state";
import { cancelUpload, clearUploadState, startUpload } from "./upload";

export { startUpload, cancelUpload, clearUploadState };
export { type State, defaultState };
export { startDownload, clearDownloadStatus };
export { share };
export {
  clearAllPaths,
  removeSelectedPath,
  removeSelected,
  setBulkSelectedPaths,
  setSelectedPath,
  toggleSelectedFeed,
};
export { deleteSelectedPaths };
export { rename };
export { merge };

export const myClass = "chris-ui/cart";

export const init = (): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const switchLayout = (myID: string, layout: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { currentLayout: layout }));
  };
};

export const startAnonymize = (
  myID: string,
  paths: CartSelection[],
  username: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

export const toggle = (myID: string): Thunk<State> => {
  return (dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { openCart } = me;

    dispatch(setData(myID, { openCart: !openCart }));
  };
};

export const open = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData(myID, { openCart: true }));
  };
};

export const close = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setData(myID, { openCart: false }));
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
        ([_, value]) => value.step !== "finished",
      ),
    );
    const newFileDownloadStatus = Object.fromEntries(
      Object.entries(fileDownloadStatus).filter(
        ([_, value]) => value.step !== "finished",
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

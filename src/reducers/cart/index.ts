import {
  init as _init,
  getState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { Feed } from "../../api/types";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types/fileBrowser";
import {
  type CartSelectionPayload,
  type DownloadStatus,
  type DownloadStatusObject,
  DownloadTypes,
} from "../types";
import type { State } from "./state";
import { cancelUpload, clearUploadState, startUpload } from "./upload";

export const myClass = "chris-ui/cart";

export type { State };

export { startUpload, cancelUpload, clearUploadState };

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

export const startDownload = (
  myID: string,
  paths: CartSelectionPayload[],
  username: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

export const startAnonymize = (
  myID: string,
  paths: CartSelectionPayload[],
  username: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

export const setSelectedPaths = (
  myID: string,
  path: CartSelectionPayload,
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
  paths: CartSelectionPayload[],
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
  theID: string,
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
      // @ts-expect-error unsure theID is number or string
      delete newFolderDownloadStatus[theID];
      dispatch(
        setData(myID, { folderDownloadStatus: newFolderDownloadStatus }),
      );
    } else if (theType === "file") {
      const newFileDownloadStatus = Object.assign({}, fileDownloadStatus);
      // @ts-expect-error unsure theID is number or string
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
  feed?: Feed,
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

export const removeSelectedPayload = (
  myID: string,
  payload: CartSelectionPayload,
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

// downloadSaga
const setStatus = (
  myID: string,
  theType: string,
  theID: number,
  step: DownloadTypes,
  filename: string,
  error?: string,
  feed?: Feed,
): Thunk<State> => {
  return (dispatch, _) => {
    if (theType === "file") {
      dispatch(setFileDownloadStatus(myID, theID, step, filename, error));
    } else {
      dispatch(
        setFolderDownloadStatus(myID, theID, step, filename, error, feed),
      );
    }
  };
};

export const createFeed = (
  myID: string,
  path: string[],
  feedname: string,
  invalidateFunc?: () => void,
): Thunk<State> => {
  return (dispatch, _) => {};
};

const downloadFolder = (
  myID: string,
  payload:
    | FileBrowserFolder
    | FileBrowserFolderFile
    | FileBrowserFolderLinkFile,
  username: string,
  pipelineType: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

const downloadEach = (
  myID: string,
  path: CartSelectionPayload,
  username: string,
  pipelineType: string,
): Thunk<State> => {
  return (dispatch, _) => {};
};

const download = (
  myID: string,
  theType: string,
  payload?: any,
  meta?: any,
  error?: any,
): Thunk<State> => {
  return (dispatch, _) => {
    const { paths, username } = payload;
    for (const path of paths) {
      dispatch(downloadEach(myID, path, username, "Download Pipeline"));
    }
  };
};

const anonymize = (
  myID: string,
  theType: string,
  payload?: any,
  meta?: any,
  error?: any,
): Thunk<State> => {
  return (dispatch, _) => {
    const { paths, username } = payload;
    for (const path of paths) {
      dispatch(downloadEach(myID, path, username, "Anonymize Pipeline"));
    }
  };
};

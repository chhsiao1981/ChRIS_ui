import {
  init as _init,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { RefObject } from "react";
import type { FileBrowserType } from "../api/types/fileBrowser";

export const myClass = "chris-ui/operation";

export type ModalStateType =
  | ""
  | "group"
  | "share"
  | "rename"
  | "createFeed"
  | "createFeedWithFile"
  | "delete"
  | "merge"
  | "default";

export type ModalState = {
  type: ModalStateType;
  ID: string;
  isOpen: boolean;
  additionalProps?: Record<string, any>;
};

export interface State extends rState {
  modalState: ModalState;
  userRelatedError: string;

  uploadData: {
    theType: FileBrowserType;
    defaultFeedName: string;
  };

  fileInputRef?: RefObject<HTMLInputElement>;
  folderInputRef?: RefObject<HTMLInputElement>;

  error: string;

  files: File[];

  isInit: boolean;
}

export const defaultState: State = {
  modalState: {
    type: "",
    ID: "",
    isOpen: false,
  },
  userRelatedError: "",

  uploadData: { theType: "file", defaultFeedName: "" },

  files: [],

  error: "",
  isInit: false,
};

export const init = (
  myID: string,
  fileInputRef: RefObject<HTMLInputElement>,
  folderInputRef: RefObject<HTMLInputElement>,
): Thunk<State> => {
  return (dispatch, _) => {
    const state: State = Object.assign({}, defaultState, {
      isInit: true,
      fileInputRef,
      folderInputRef,
    });
    dispatch(_init({ myID, state }));
  };
};

export const clearError = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, { error: "", userRelatedError: "" }));
  };
};

export const createFeedWithFile = (
  myID: string,
  fileList: FileList | null,
  theType: FileBrowserType,
): Thunk<State> => {
  return (dispatch, _) => {
    const files = Array.from(fileList || []);
    if (!files.length) {
      dispatch(setData<State>(myID, { error: "no file selected" }));
      return;
    }

    const defaultFeedName =
      theType === "folder"
        ? `${files[0].webkitRelativePath.split("/")[0]}`
        : files.length === 1
          ? `Data from ${files[0].name}`
          : "Multiple Data Upload";

    console.info(
      "doOperation.createFeedWithFile: defaultFeedName:",
      defaultFeedName,
      "files:",
      files,
    );

    dispatch(
      setData<State>(myID, {
        modalState: {
          type: "createFeedWithFile",
          ID: myID,
          isOpen: true,
        },
        uploadData: { theType, defaultFeedName },
        files,
      }),
    );
  };
};

export const closeModal = (myID: string): Thunk<State> => {
  return (dispatch) => {
    const toUpdate = Object.assign({}, defaultState, { isInit: true });
    dispatch(setData<State>(myID, toUpdate));
  };
};

export const merge = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setModalStateType(myID, "merge"));
  };
};

export const share = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setModalStateType(myID, "share"));
  };
};

export const remove = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setModalStateType(myID, "delete"));
  };
};

export const rename = (myID: string): Thunk<State> => {
  return (dispatch, _getClass) => {
    dispatch(setModalStateType(myID, "rename"));
  };
};

export const setModalStateType = (
  myID: string,
  theType: ModalStateType,
): Thunk<State> => {
  return (dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { modalState } = me;
    const toUpdate: Partial<ModalState> = {
      type: theType,
      ID: myID,
      isOpen: true,
    };
    const newModalState: ModalState = Object.assign({}, modalState, toUpdate);
    dispatch(setData<State>(myID, { modalState: newModalState }));
  };
};

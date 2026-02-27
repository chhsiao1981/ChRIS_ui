import {
  init as _init,
  type DispatchFuncMap,
  getState,
  type State as rState,
  setData,
  type Thunk,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type { ChangeEvent, RefObject } from "react";
import type { FileBrowserType } from "../api/types/fileBrowser";
import { randomStr } from "../utils/randomStr";
import * as DoCart from "./cart";
import type * as DoUser from "./user";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

export const myClass = "chris-ui/folder-operation";

export interface State extends rState {
  modalStateType: string;
  modalStateID: string;
  modalStateIsOpen: boolean;
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
  modalStateType: "",
  modalStateID: "",
  modalStateIsOpen: false,
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

export const onFileChange = (
  myID: string,
  e: ChangeEvent<HTMLInputElement>,
  name: string,

  username: string,
  cartID: string,
  doCart: DispatchFuncMap<DoCart.State, TDoCart>,
): Thunk<State> => {
  return async (dispatch, _) => {
    const files = Array.from(e.target.files || []);
    dispatch(upload(myID, files, username, false, name, cartID, doCart));
  };
};

export const onFolderChange = (
  myID: string,
  e: ChangeEvent<HTMLInputElement>,
  name: string,

  username: string,
  cartID: string,
  doCart: DispatchFuncMap<DoCart.State, TDoCart>,
): Thunk<State> => {
  return (dispatch, _) => {
    const files = Array.from(e.target.files || []);
    dispatch(upload(myID, files, username, true, name, cartID, doCart));
  };
};

export const upload = (
  myID: string,
  files: File[],
  username: string,
  isFolder: boolean,
  name: string,

  cartID: string,
  doCart: DispatchFuncMap<DoCart.State, TDoCart>,
): Thunk<State> => {
  return () => {
    const uniqueName = name ? `${name}_${randomStr()}` : randomStr();

    const uploadPath = `home/${username}/uploads/${uniqueName}`;

    doCart.startUpload(cartID, files, isFolder, uploadPath, true, name);
  };
};

export const onModalSubmit = (myID: string): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
  };
};

export const onDeduplicate = (
  myID: string,
  useCart: UseThunk<DoCart.State, TDoCart>,
): Thunk<State> => {
  return () => {};
};

export const onMerge = (
  myID: string,
  useCart: UseThunk<DoCart.State, TDoCart>,
): Thunk<State> => {
  return () => {};
};

export const onOperations = (myID: string): Thunk<State> => {
  return () => {};
};

export const download = (
  myID: string,
  username: string,

  cartID: string,
  useCart: UseThunk<DoCart.State, TDoCart>,
): Thunk<State> => {
  return () => {
    const [classStateCart, doCart] = useCart;
    const cart = getState(classStateCart, cartID) || DoCart.defaultState;
    const { selectedPaths } = cart;

    doCart.setToggleCart(cartID);
    doCart.startDownload(cartID, selectedPaths, username);
  };
};

export const clearAllSelections = (myID: string): Thunk<State> => {
  return () => {};
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
        modalStateType: "createFeedWithFile",
        modalStateID: myID,
        modalStateIsOpen: true,
        uploadData: { theType, defaultFeedName },
        files,
      }),
    );
  };
};

export const closeModal = (myID: string): Thunk<State> => {
  return (dispatch) => {
    dispatch(
      setData<State>(myID, {
        modalStateIsOpen: false,
        modalStateID: "",
        modalStateType: "",
      }),
    );
  };
};

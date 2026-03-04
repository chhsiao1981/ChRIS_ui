import {
  type ClassState,
  getState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import axios, { type AxiosProgressEvent } from "axios";
import config from "config";
import { chunk } from "lodash";
import { createFeedWithFilepaths } from "../../api/serverApi";
import type { FileBrowserType } from "../../api/types/fileBrowser";
import type {
  FileUpload,
  FileUploadObject,
  FolderUploadObject,
} from "../types";
import type { State } from "./state";

export const startUpload = (
  myID: string,
  files: File[],
  isFolder: boolean,
  currentPath: string,
  nameForFeed?: string,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { openCart: true }));
    dispatch(upload(myID, files, isFolder, currentPath, nameForFeed));
  };
};

export const cancelUpload = (
  myID: string,
  theType: FileBrowserType,
  theID: string,
): Thunk<State> => {
  return (_dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { fileUploadStatus, folderUploadStatus } = me;
    console.info(
      "cart.cancelUpload: theType:",
      theType,
      "theID:",
      theID,
      "controller:",
      fileUploadStatus[theID]?.controller,
    );
    if (theType === "file") {
      fileUploadStatus[theID]?.controller?.abort();
    } else {
      folderUploadStatus[theID]?.controller?.abort();
    }
  };
};

export const clearUploadState = (
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

const upload = (
  myID: string,
  files: File[],
  isFolder: boolean,
  currentPath: string,
  nameForFeed?: string,
): Thunk<State> => {
  return async (dispatch, _getClass) => {
    if (isFolder) {
      dispatch(uploadFolder(myID, files, currentPath, nameForFeed));
    } else {
      dispatch(uploadFiles(myID, files, currentPath, nameForFeed));
    }
  };
};

/***
 * Upload Folder
 */
const uploadFolder = (
  myID: string,
  files: File[],
  currentPath: string,
  nameForFeed?: string,
): Thunk<State> => {
  return async (dispatch, getClass) => {
    const batchSize = 50;
    const firstFiles = files.slice(0, 1); // upload the 1st file.
    const batchFiles = chunk(files.slice(1), batchSize);
    const totalFiles = files.length;

    const uploadInfo = {
      count: 0,
      isCancelled: false,
      lastError: "",
    };

    const folderController = new AbortController();

    setInitialFolderUploadStatus(
      myID,
      files[0],
      totalFiles,
      currentPath,
      folderController,
      dispatch,
    );

    // createFeed only when all are successfully done.
    if (!nameForFeed) {
      return;
    }

    const { status, data, errmsg } = await createFeedWithFilepaths(
      [currentPath],
      nameForFeed,
      ["uploaded"],
      false,
    );
    if (errmsg) {
      console.error(
        "cart.uploadFolder: unable to createFeedWithFilepaths: e:",
        errmsg,
      );
      return;
    }
  };
};

const setInitialFolderUploadStatus = (
  myID: string,
  file: File,
  totalFiles: number,
  currentPath: string,
  controller: AbortController,
  dispatch: any,
) => {
  const name = file.webkitRelativePath;
  const fileName = name.split("/")[0];
  dispatch(
    setFolderUploadStatus(
      myID,
      "Upload Started",
      fileName,
      totalFiles,
      0,
      controller,
      currentPath,
      "folder",
    ),
  );
};

/***
 * Upload Files
 */
const uploadFiles = (
  myID: string,
  files: File[],
  currentPath: string,
  nameForFeed?: string,
): Thunk<State> => {
  return async (dispatch, getClass) => {
    const batchSize = 50;
    const firstFiles = files.slice(0, 1); // upload the 1st file.
    const batchFiles = chunk(files.slice(1), batchSize);
    const allBatchFiles = [firstFiles].concat(batchFiles);

    for (const idx in allBatchFiles) {
      const eachBatchFiles = allBatchFiles[idx];
      const error = await uploadBatchFiles(
        myID,
        dispatch,
        getClass,
        eachBatchFiles,
        currentPath,
      );
      if (error) {
        console.error(
          `cart.uploadFiles (${idx}): unable to upload files: files:`,
          eachBatchFiles,
          "e:",
          error,
        );
        return;
      }
    }

    // createFeed only when all are successfully done.
    if (!nameForFeed) {
      return;
    }

    const { status, data, errmsg } = await createFeedWithFilepaths(
      [currentPath],
      nameForFeed,
      ["uploaded"],
      false,
    );
    if (errmsg) {
      console.error(
        "cart.uploadFiles: unable to createFeedWithFilepaths: e:",
        errmsg,
      );
      return;
    }
  };
};

const uploadBatchFiles = async (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  files: File[],
  currentPath: string,
): Promise<Error | null> => {
  const rets = await Promise.all(
    files.map(async (eachFile): Promise<Error | null> => {
      await uploadBatchFile(myID, dispatch, getClass, eachFile, currentPath);

      return null;
    }),
  );

  const errors = rets.filter((each) => each !== null);
  if (errors.length) {
    return errors[errors.length - 1];
  }

  return null;
};

const uploadBatchFile = async (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  file: File,
  currentPath: string,
) => {
  const url = `${config.API_ROOT}/userfiles/`;

  const { formData, name, controller } = prepareUploadFile(file, currentPath);
  const uploadConfig = createUploadConfig(url, formData, controller);
  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.progress) {
      const { loaded, total: propsTotal } = progressEvent;
      const total = propsTotal || file.size;
      const progress = Math.round(progressEvent.progress * 100);
      processUploadBatchFileProgress(
        myID,
        dispatch,
        getClass,
        name,
        currentPath,
        controller,
        progress,
        loaded,
        total,
      );
    }
  };

  const source = axios.CancelToken.source();
  const axiosConfig = {
    ...uploadConfig,
    cancelToken: source.token,
    onUploadProgress,
  };

  const onAbort = () => {
    console.info("cart.uploadBatchFile.onAbort: start");
    source.cancel("Operation canceled by the user.");
  };
  axiosConfig.signal.addEventListener("abort", onAbort);

  axios
    .post(uploadConfig.url, uploadConfig.data, axiosConfig)
    .then((resp) => {
      processUploadBatchFileResponse(
        myID,
        dispatch,
        getClass,
        name,
        currentPath,
        controller,
        file.size,
      );
    })
    .catch((error) => {
      if (axios.isCancel(error)) {
        processUploadBatchFileError(
          myID,
          dispatch,
          getClass,
          false,
          name,
          currentPath,
          true,
          "",
        );
      } else if (axios.isAxiosError(error)) {
        processUploadBatchFileError(
          myID,
          dispatch,
          getClass,
          false,
          name,
          currentPath,
          false,
          error.message,
        );
      } else {
        const errmsg = "Unexpected Error while uploading the file";
        processUploadBatchFileError(
          myID,
          dispatch,
          getClass,
          false,
          name,
          currentPath,
          false,
          errmsg,
        );
      }
    });

  axiosConfig.signal.removeEventListener("abort", onAbort);
};

const processUploadBatchFileProgress = (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  name: string,
  path: string,
  controller: AbortController,
  progress: number,
  loaded: number,
  total: number,
) => {
  const step = "Uploading...";
  dispatch(
    setFileUploadStatus(
      myID,
      step,
      name,
      progress,
      loaded,
      total,
      controller,
      path,
    ),
  );
};

const processUploadBatchFileResponse = (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  name: string,
  path: string,
  controller: AbortController,
  total: number,
) => {
  const step = "Upload Complete";
  dispatch(
    setFileUploadStatus(myID, step, name, 100, total, total, controller, path),
  );
};

const processUploadBatchFileError = (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  isFolder: boolean,
  name: string,
  path: string,
  isCancelled: boolean,
  errmsg: string,
) => {
  const step = isCancelled ? "Upload Cancelled" : `Error: ${errmsg}`;
  if (isFolder) {
    dispatch(
      setFolderUploadStatus(myID, step, name, 0, 0, null, path, "folder"),
    );
  } else {
    dispatch(setFileUploadStatus(myID, step, name, 0, 0, 0, null, path));
  }
};

const prepareUploadFile = (file: File, currentPath: string) => {
  const formData = new FormData();
  const filename = file.name;
  const path = `${currentPath}/${filename}`;
  formData.append("upload_path", path);
  formData.append("fname", file, filename);
  const controller = new AbortController();
  return { formData, name: filename, path, controller };
};

const createUploadConfig = (
  url: string,
  formData: FormData,
  controller: AbortController,
) => {
  return {
    signal: controller.signal,
    url,
    data: formData,
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
      type: "file",
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

const setFolderUploadStatus = (
  myID: string,
  step: string,
  filename: string,
  totalCount: number,
  currentCount: number,
  controller: AbortController | null,
  path: string,
  theType: FileBrowserType,
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

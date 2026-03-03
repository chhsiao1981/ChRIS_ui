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

export const upload = (
  myID: string,
  files: File[],
  isFolder: boolean,
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

    const error = await uploadBatchFiles(
      myID,
      dispatch,
      getClass,
      firstFiles,
      isFolder,
      currentPath,
      folderController,
    );
    if (error) {
      console.error(
        "cart.upload: unable to upload 1st files: firstFiles:",
        firstFiles,
        "e:",
        error,
      );
      return;
    }

    for (const idx in batchFiles) {
      const eachBatchFiles = batchFiles[idx];
      const error = await uploadBatchFiles(
        myID,
        dispatch,
        getClass,
        eachBatchFiles,
        isFolder,
        currentPath,
        folderController,
      );
      if (error) {
        console.error(
          "cart.upload: unable to upload files: idx:",
          idx,
          "files:",
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
      [],
      false,
    );
    if (errmsg) {
      console.error(
        "cart.upload: unable to createFeedWithFilepaths: e:",
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
  isFolder: boolean,
  currentPath: string,
  folderController: AbortController,
): Promise<Error | null> => {
  const rets = await Promise.all(
    files.map(async (eachFile): Promise<Error | null> => {
      await uploadBatchFile(
        myID,
        dispatch,
        getClass,
        eachFile,
        isFolder,
        currentPath,
        folderController,
      );

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
  isFolder: boolean,
  currentPath: string,
  folderController: AbortController,
) => {
  const url = `${config.API_ROOT}/userfiles/`;

  const { formData, name, controller } = prepareUploadData(
    file,
    currentPath,
    isFolder,
    folderController,
  );
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
        isFolder,
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
    console.info("cart.upload.uploadBatchFile.onAbort: start");
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
        isFolder,
        name,
        currentPath,
        controller,
        file.size,
        resp,
      );
    })
    .catch((error) => {
      const errmsg = "Unexpected Error while uploading the file";
      if (axios.isCancel(error)) {
        processUploadBatchFileError(
          myID,
          dispatch,
          getClass,
          isFolder,
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
          isFolder,
          name,
          currentPath,
          false,
          error.message,
        );
      } else {
        processUploadBatchFileError(
          myID,
          dispatch,
          getClass,
          isFolder,
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
  isFolder: boolean,
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
  isFolder: boolean,
  name: string,
  path: string,
  controller: AbortController,
  total: number,
  resp: any,
) => {
  const classState = getClass();
  const me = getState(classState, myID);
  if (!me) {
    return;
  }
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

const prepareUploadData = (
  file: File,
  currentPath: string,
  isFolder: boolean,
  folderController: AbortController,
) => {
  const formData = new FormData();
  const filename = isFolder ? file.webkitRelativePath : file.name;
  const path = `${currentPath}/${filename}`;
  formData.append("upload_path", path);
  formData.append("fname", file, filename);
  const controller = isFolder ? folderController : new AbortController();
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

import {
  type ClassState,
  type DispatchFuncMap,
  getState,
  setData,
  type Thunk,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";

import axios, { type AxiosProgressEvent } from "axios";
import config from "config";
import { chunk } from "lodash";
import { createFeedWithFilepaths } from "../../api/serverApi";
import type { FileBrowserType } from "../../api/types/fileBrowser";
import { FILENAME_RANDOM_LENGTH } from "../../constants";
import type * as DoFeedList from "../../reducers/feedList";
import { randomStr } from "../../utils/randomStr";
import type {
  FileUpload,
  FileUploadMap,
  FileUploadStepType,
  FolderUpload,
} from "../types";
import type { State } from "./state";

type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

type FolderUploadInfo = {
  count: number;
  isCancelled: boolean;
  lastError: string;
};

export const startUpload = (
  myID: string,
  files: File[],
  isFolder: boolean,
  username?: string,
  feedName?: string,
  feedListID?: string,
  useFeedList?: UseThunk<DoFeedList.State, TDoFeedList>,
): Thunk<State> => {
  const uniqueName = feedName
    ? `${feedName}_${randomStr(FILENAME_RANDOM_LENGTH)}`
    : randomStr(FILENAME_RANDOM_LENGTH);

  const currentPath = `home/${username}/uploads/${uniqueName}`;

  return (dispatch, _) => {
    dispatch(setData(myID, { openCart: true }));
    dispatch(
      upload(
        myID,
        files,
        isFolder,
        currentPath,
        feedName,
        feedListID,
        useFeedList,
      ),
    );
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

  feedListID?: string,
  useFeedList?: UseThunk<DoFeedList.State, TDoFeedList>,
): Thunk<State> => {
  return async (dispatch, _getClass) => {
    if (isFolder) {
      dispatch(
        uploadFolder(
          myID,
          files,
          currentPath,
          nameForFeed,
          feedListID,
          useFeedList,
        ),
      );
    } else {
      dispatch(
        uploadFiles(
          myID,
          files,
          currentPath,
          nameForFeed,
          feedListID,
          useFeedList,
        ),
      );
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

  feedListID?: string,
  useFeedList?: UseThunk<DoFeedList.State, TDoFeedList>,
): Thunk<State> => {
  return async (dispatch, getClass) => {
    const batchSize = 50;
    const firstFiles = files.slice(0, 1); // upload the 1st file.
    const batchFiles = chunk(files.slice(1), batchSize);
    const allBatchFiles = [firstFiles].concat(batchFiles);
    const totalCount = files.length;

    const uploadInfo: FolderUploadInfo = {
      count: 0,
      isCancelled: false,
      lastError: "",
    };

    const folderController = new AbortController();

    setInitialFolderUploadStatus(
      myID,
      files[0],
      totalCount,
      currentPath,
      folderController,
      dispatch,
    );

    for (const idx in allBatchFiles) {
      const eachBatchFiles = allBatchFiles[idx];
      const error = await uploadBatchFolderFiles(
        myID,
        dispatch,
        getClass,
        eachBatchFiles,
        currentPath,
        totalCount,
        uploadInfo,
        folderController,
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

    const filename = files[0].webkitRelativePath;
    const folderName = filename.split("/")[0];

    dispatch(
      setFolderUploadStatus(
        myID,
        "Upload Complete",
        folderName,
        totalCount,
        uploadInfo.count,
        folderController,
        currentPath,
      ),
    );

    // createFeed only when all are successfully done.
    if (!nameForFeed || !feedListID || !useFeedList) {
      return;
    }

    const errmsg = await createFeed(
      [currentPath],
      nameForFeed,
      ["uploaded"],
      false,
      feedListID,
      useFeedList,
    );
    if (errmsg) {
      console.error(
        "cart.uploadFolder: unable to createFeedWithFilepaths: e:",
        errmsg,
      );
    }
  };
};

const createFeed = async (
  paths: string[],
  nameForFeed: string,
  tags: string[],
  isPublic: boolean = false,

  feedListID: string,
  useFeedList: UseThunk<DoFeedList.State, TDoFeedList>,
): Promise<string | undefined> => {
  const [_classFeedList, doFeedList] = useFeedList;
  const {
    status,
    data: feed,
    errmsg,
  } = await createFeedWithFilepaths(paths, nameForFeed, tags, isPublic);
  if (errmsg) {
    console.error(
      "cart.createFeed: unable to createFeedWithFilepaths: status:",
      status,
      "e:",
      errmsg,
    );
    return errmsg;
  }
  if (!feed) {
    console.error("cart.createFeed: unable to get feed: status:", status);
    return "unable to get feed";
  }

  doFeedList.prepandList(feedListID, feed);

  return;
};

const setInitialFolderUploadStatus = (
  myID: string,
  file: File,
  totalFiles: number,
  currentPath: string,
  controller: AbortController,
  dispatch: any,
) => {
  const filename = file.webkitRelativePath;
  const folderName = filename.split("/")[0];
  dispatch(
    setFolderUploadStatus(
      myID,
      "Upload Started",
      folderName,
      totalFiles,
      0,
      controller,
      currentPath,
    ),
  );
};

const uploadBatchFolderFiles = async (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  files: File[],
  currentPath: string,
  totalCount: number,
  uploadInfo: FolderUploadInfo,
  folderController: AbortController,
) => {
  const rets = await Promise.all(
    files.map(async (eachFile): Promise<Error | null> => {
      const err = await uploadBatchFolderFile(
        myID,
        dispatch,
        getClass,
        eachFile,
        currentPath,
        totalCount,
        uploadInfo,
        folderController,
      );

      return err;
    }),
  );

  console.info("cart.uploadBatchFolderFiles: done: rets:", rets);

  const errs = rets.filter((each) => each !== null);
  if (errs.length) {
    return errs[errs.length - 1];
  }

  return null;
};

const uploadBatchFolderFile = async (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  file: File,
  currentPath: string,
  totalCount: number,
  uploadInfo: FolderUploadInfo,
  folderController: AbortController,
): Promise<Error | null> => {
  const url = `${config.API_ROOT}/userfiles/`;

  const { formData, name: filename } = prepareUploadData(
    file,
    currentPath,
    true,
  );
  const controller = folderController;
  const uploadConfig = createUploadConfig(url, formData, controller);

  const source = axios.CancelToken.source();
  const axiosConfig = {
    ...uploadConfig,
    cancelToken: source.token,
  };

  const onAbort = () => {
    console.info("cart.uploadBatchFolderFile.onAbort: filename:", filename);
    source.cancel("Operation canceled by the user.");
  };
  axiosConfig.signal.addEventListener("abort", onAbort);

  const folderName = filename.split("/")[0];

  let err: Error | null = null;
  try {
    const resp = await axios.post(
      uploadConfig.url,
      uploadConfig.data,
      axiosConfig,
    );
    uploadInfo.count += 1;
    console.info("cart.uploadBatchFolderFile: done: filename:", filename);
    dispatch(
      setFolderUploadStatus(
        myID,
        "Uploading...",
        folderName,
        totalCount,
        uploadInfo.count,
        folderController,
        currentPath,
      ),
    );
  } catch (error: any) {
    if (axios.isCancel(error)) {
      processUploadBatchFileError(
        myID,
        dispatch,
        getClass,
        true,
        folderName,
        currentPath,
        true,
        "",
      );
    } else if (axios.isAxiosError(error)) {
      processUploadBatchFileError(
        myID,
        dispatch,
        getClass,
        true,
        folderName,
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
        true,
        folderName,
        currentPath,
        false,
        errmsg,
      );
    }
    err = error;
  }

  console.info(
    "cart.uploadBatchFolderFile: to return: name:",
    filename,
    "folderName:",
    folderName,
  );
  axiosConfig.signal.removeEventListener("abort", onAbort);
  return err;
};

/***
 * Upload Files
 */
const uploadFiles = (
  myID: string,
  files: File[],
  currentPath: string,
  nameForFeed?: string,

  feedListID?: string,
  useFeedList?: UseThunk<DoFeedList.State, TDoFeedList>,
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
    if (!nameForFeed || !feedListID || !useFeedList) {
      return;
    }

    const errmsg = await createFeed(
      [currentPath],
      nameForFeed,
      ["uploaded"],
      false,
      feedListID,
      useFeedList,
    );
    if (errmsg) {
      console.error(
        "cart.uploadFolder: unable to createFeedWithFilepaths: e:",
        errmsg,
      );
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
      const err = await uploadBatchFile(
        myID,
        dispatch,
        getClass,
        eachFile,
        currentPath,
      );

      return err;
    }),
  );

  const errors = rets.filter((each) => each !== null);
  if (errors.length) {
    return errors[errors.length - 1];
  }

  return null;
};

const uploadBatchFile = (
  myID: string,
  dispatch: any,
  getClass: () => ClassState<State>,
  file: File,
  currentPath: string,
): Error | null => {
  const url = `${config.API_ROOT}/userfiles/`;

  const { formData, name } = prepareUploadData(file, currentPath, false);
  const controller = new AbortController();
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

  let err: Error | null = null;
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
    .catch((_error) => {
      if (axios.isCancel(_error)) {
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
      } else if (axios.isAxiosError(_error)) {
        processUploadBatchFileError(
          myID,
          dispatch,
          getClass,
          false,
          name,
          currentPath,
          false,
          _error.message,
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

      err = _error;
    });

  axiosConfig.signal.removeEventListener("abort", onAbort);
  return err;
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
  const step = isCancelled ? "Upload Cancelled" : `Error`;
  if (isFolder) {
    dispatch(setFolderUploadStatus(myID, step, name, 0, 0, null, path));
  } else {
    dispatch(setFileUploadStatus(myID, step, name, 0, 0, 0, null, path));
  }
};

const prepareUploadData = (
  file: File,
  currentPath: string,
  isFolder: boolean,
) => {
  const formData = new FormData();
  const filename = isFolder ? file.webkitRelativePath : file.name;
  const path = `${currentPath}/${filename}`;
  formData.append("upload_path", path);
  formData.append("fname", file, filename);
  return { formData, name: filename, path };
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
  step: FileUploadStepType,
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
    const fileUploadObj: FileUpload = {
      currentStep: step,
      progress: progress,
      loaded,
      total,
      controller,
      path,
      type: "file",
    };
    const fileUpload: FileUploadMap = { [filename]: fileUploadObj };
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
  folderName: string,
  totalCount: number,
  currentCount: number,
  controller: AbortController | null,
  path: string,
): Thunk<State> => {
  console.info(
    "cart.setFolderUploadStatus: start: folderName:",
    folderName,
    "step:",
    step,
  );
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { folderUploadStatus, selectedPaths } = me;
    const folderUploadObj: FolderUpload = {
      currentStep: step,
      done: currentCount,
      total: totalCount,
      controller,
      path,
      type: "folder",
    };
    const folderUpload = { [folderName]: folderUploadObj };
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

import { getState, setData, type Thunk } from "@chhsiao1981/use-thunk";
import { getFileHref, getFileName } from "../../api/common";
import {
  createDownloadToken as apiCreateDownloadToken,
  createWorkflow,
} from "../../api/serverApi";
import { createFeedAndPluginInstanceWithFilepaths } from "../../api/serverApi/feed";
import {
  getFileBrowserFileList,
  getFileBrowserFolderListByPath,
} from "../../api/serverApi/filebrowser";
import { getPipelinesByName } from "../../api/serverApi/pipeline";
import {
  getPluginInstance,
  getPluginInstanceListByWorkflow,
} from "../../api/serverApi/pluginInstance";
import {
  type Feed,
  type FileBrowserFolderFile,
  type PluginInstance,
  PluginInstanceStatus,
} from "../../api/types";
import sleep from "../../utils/sleep";
import type {
  CartSelection,
  DownloadStatus,
  DownloadStatusMap,
  DownloadStepType,
} from "../types";
import type { State } from "./state";

export const startDownload = (myID: string, username: string): Thunk<State> => {
  return async (dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const { selectedPaths: paths } = me;

    dispatch(setData<State>(myID, { openCart: true }));
    dispatch(download(myID, paths, username));
  };
};

const download = (
  myID: string,
  selections: CartSelection[],
  username: string,
): Thunk<State> => {
  return (dispatch) => {
    for (const selection of selections) {
      dispatch(downloadEachSelection(myID, selection, username));
    }
  };
};

const downloadEachSelection = (
  myID: string,
  selection: CartSelection,
  username: string,
): Thunk<State> => {
  return async (dispatch) => {
    const { type: theType, rawData, path } = selection;

    console.info(
      "cart.downloadEachSelection: path:",
      path,
      "theType:",
      theType,
    );

    if (theType === "file") {
      dispatch(downloadFile(myID, rawData as FileBrowserFolderFile));
    } else {
      dispatch(downloadFolder(myID, path, username));
    }
  };
};

const downloadFile = (
  myID: string,
  theFile: FileBrowserFolderFile,
  filename?: string,
): Thunk<State> => {
  return async (dispatch) => {
    const filename2 = filename || getFileName(theFile.fname);
    const baseUrl = getFileHref(theFile);
    const { token, errmsg } = theFile.public
      ? { token: "", errmsg: undefined }
      : await createDownloadToken();
    console.info(
      "cart.downloadFile: after createDownloadToken: token:",
      token,
      "e:",
      errmsg,
    );
    if (errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
    const postfixUrl = token ? `?download_token=${token}` : "";
    const authorizedUrl = `${baseUrl}${postfixUrl}`;

    console.info(
      "cart.downloadFile: to createLinkAndDownload: authorizedUrl:",
      authorizedUrl,
      "filename2:",
      filename2,
    );

    createLinkAndDownload(authorizedUrl, filename2);
  };
};

const createDownloadToken = async () => {
  const {
    status: _status,
    data: token,
    errmsg,
  } = await apiCreateDownloadToken();
  if (errmsg) {
    return { token: "", errmsg };
  }
  if (!token) {
    return { token: "", errmsg: "unable to create donwload-token" };
  }
  return { token: token.token, errmsg: undefined };
};

const createLinkAndDownload = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  console.info("cart.createLinkAndDownload: url:", url, "filename:", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadFolder = (
  myID: string,
  path: string,
  username: string,
): Thunk<State> => {
  return async (dispatch) => {
    const folderNameForFeed = getFileName(path);

    // pipeline for zip
    const pipelineName = "zip v20240311";
    const {
      status,
      data: pipelines,
      errmsg,
    } = await getPipelinesByName(pipelineName);
    if (errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
    if (!pipelines) {
      dispatch(
        setData<State>(myID, {
          error: `no pipelines: status: ${status}`,
        }),
      );
      return;
    }
    if (pipelines.results.length !== 1) {
      dispatch(
        setData<State>(myID, {
          error: `pipelines.length: status: ${pipelines.results.length}`,
        }),
      );
      return;
    }
    const thePipelineID = pipelines.results[0].id;

    // create feed for zip.
    const feedName = `Archive for ${folderNameForFeed}`;
    const {
      status: _status2,
      data: feedAndPluginInstance,
      errmsg: errmsg2,
    } = await createFeedAndPluginInstanceWithFilepaths([path], feedName, [
      "archive",
    ]);
    if (errmsg2) {
      dispatch(setData<State>(myID, { error: errmsg2 }));
      return;
    }
    if (!feedAndPluginInstance) {
      dispatch(
        setData<State>(myID, {
          error: "unable to get feed and plugin instance",
        }),
      );
      return;
    }
    const { feed, pluginInstance: createdInstance } = feedAndPluginInstance;

    dispatch(
      setFolderDownloadStatus(
        myID,
        path,
        "processing",
        folderNameForFeed,
        undefined,
        feed,
      ),
    );

    console.info(
      "cart.downloadFolder: to createWorkflow: thePipelineID:",
      thePipelineID,
      "instanceID:",
      createdInstance.id,
    );

    const {
      status: _status3,
      data: workflow,
      errmsg: errmsg3,
    } = await createWorkflow(thePipelineID, createdInstance.id, []);
    if (errmsg3) {
      dispatch(
        setData<State>(myID, {
          error: errmsg3,
        }),
      );
      return;
    }
    if (!workflow) {
      dispatch(
        setData<State>(myID, {
          error: "unable to create workflow",
        }),
      );
      return;
    }

    const {
      status: _status4,
      data: pluginInstanceList,
      errmsg: errmsg4,
    } = await getPluginInstanceListByWorkflow(workflow.id);
    console.info(
      "cart.downloadFolder: after getPluginInstanceListByWorkflow: pluginInstanceList:",
      pluginInstanceList,
    );
    if (errmsg4) {
      dispatch(
        setData<State>(myID, {
          error: errmsg4,
        }),
      );
      return;
    }
    if (!pluginInstanceList || !pluginInstanceList.results.length) {
      dispatch(
        setData<State>(myID, {
          error: "unable to get workflow plugin-instances",
        }),
      );
      return;
    }
    const pluginInstances = pluginInstanceList.results;
    const zipInstance = pluginInstances[0];

    const zipInstanceStatus = await waitZipInstance(zipInstance);
    console.info(
      "cart.downloadFolder: after waitZipInstance: zipInstanceStatus:",
      zipInstanceStatus,
    );
    if (zipInstanceStatus !== PluginInstanceStatus.SUCCESS) {
      dispatch(
        setData<State>(myID, {
          error: "unable to zip files",
        }),
      );
      return;
    }

    dispatch(
      setFolderDownloadStatus(
        myID,
        path,
        "finished",
        folderNameForFeed,
        undefined,
        feed,
      ),
    );

    // XXX hack for zip pipeline filePath
    const filePath = `home/${username}/feeds/feed_${feed.id}/pl-dircopy_${createdInstance.id}/pl-pfdorun_${zipInstance.id}/data`;

    console.info(
      "cart.downloadFolder: to getFileBrowserFolderListByPath: filePath:",
      filePath,
    );

    const {
      status: _status5,
      data: folderList,
      errmsg: errmsg5,
    } = await getFileBrowserFolderListByPath(filePath);
    console.info(
      "cart.downloadFolder: after getFileBrowserFolderListByPath: folderList:",
      folderList,
      "e:",
      errmsg5,
    );
    if (errmsg5) {
      dispatch(
        setData<State>(myID, {
          error: errmsg5,
        }),
      );
      return;
    }
    if (!folderList || !folderList.results.length) {
      dispatch(
        setData<State>(myID, {
          error: "unable to get file-browser-folder-list",
        }),
      );
      return;
    }
    const folder = folderList.results[0];
    const {
      status: _status6,
      data: fileList,
      errmsg: errmsg6,
    } = await getFileBrowserFileList(folder.id);
    console.info(
      "cart.downloadFolder: after getFileBrowserFileList: fileList:",
      fileList,
      "e:",
      errmsg6,
    );
    if (errmsg6) {
      dispatch(
        setData<State>(myID, {
          error: errmsg6,
        }),
      );
      return;
    }

    if (!fileList || !fileList.results.length) {
      dispatch(
        setData<State>(myID, {
          error: "unable to get file-browser-file-list",
        }),
      );
      return;
    }
    const files = fileList.results;
    const fileToZip = files.find((each) => each.fname.endsWith(".zip"));
    console.info("cart.downloadFolder: after fileToZip: fileToZip:", fileToZip);
    if (!fileToZip) {
      dispatch(
        setData<State>(myID, {
          error: "failed to find a .zip file in the folder",
        }),
      );
      return;
    }
    console.info("cart.downloadFolder: to downloadFile: fileToZip:", fileToZip);
    dispatch(downloadFile(myID, fileToZip, `${folderNameForFeed}.zip`));
  };
};

const waitZipInstance = async (zipInstance: PluginInstance) => {
  while (true) {
    const {
      status: _status,
      data: pluginInstance,
      errmsg,
    } = await getPluginInstance(zipInstance.id);
    console.info(
      "cart.waitZipInstance: after getPluginInstance: id:",
      zipInstance.id,
      "pluginInstance:",
      pluginInstance,
    );
    if (errmsg || !pluginInstance) {
      return PluginInstanceStatus.UNKNOWN_ERROR;
    }
    const { status } = pluginInstance;
    if (
      status === PluginInstanceStatus.FINISHED_WITH_ERROR ||
      status === PluginInstanceStatus.CANCELLED ||
      status === PluginInstanceStatus.SUCCESS
    ) {
      return pluginInstance.status;
    }

    console.info("cart.waitZipInstance: to sleep 5000");
    await sleep(5000);
  }
};

const setFolderDownloadStatus = (
  myID: string,
  path: string,
  step: DownloadStepType,
  filename?: string,
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
    const downloadStatusObj: DownloadStatus = {
      step,
      filename,
      error,
      feed,
    };
    const downloadStatus: DownloadStatusMap = { [path]: downloadStatusObj };
    const newFolderDownloadStatus = Object.assign(
      {},
      folderDownloadStatus,
      downloadStatus,
    );
    dispatch(setData(myID, { folderDownloadStatus: newFolderDownloadStatus }));

    if (step !== "finished") {
      return;
    }

    /* We don't need to remove the selectedPaths after successfully download the folders.
    const newSelectedPaths = selectedPaths.filter(
      (selected) => selected.path !== path,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
    */
  };
};

export const clearDownloadStatus = (
  myID: string,
  path: string,
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
      delete newFolderDownloadStatus[path];
      dispatch(
        setData(myID, { folderDownloadStatus: newFolderDownloadStatus }),
      );
    } else if (theType === "file") {
      const newFileDownloadStatus = Object.assign({}, fileDownloadStatus);
      delete newFileDownloadStatus[path];
      dispatch(setData(myID, { fileDownloadStatus: newFileDownloadStatus }));
    }
  };
};

const setFileDownloadStatus = (
  myID: string,
  fileID: number,
  step: DownloadStepType,
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
    const downloadStatusObj: DownloadStatus = {
      step,
      filename,
      error,
    };
    const downloadStatus: DownloadStatusMap = { [fileID]: downloadStatusObj };
    const newFileDownloadStatus = Object.assign(
      {},
      fileDownloadStatus,
      downloadStatus,
    );
    dispatch(setData(myID, { fileDownloadStatus: newFileDownloadStatus }));

    if (step !== "finished") {
      return;
    }

    const newSelectedPaths = selectedPaths.filter(
      (selected) => selected.path !== filename,
    );
    dispatch(setData(myID, { selectedPaths: newSelectedPaths }));
  };
};

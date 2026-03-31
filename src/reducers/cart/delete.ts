import { getState, setData, type Thunk } from "@chhsiao1981/use-thunk";
import { deleteFeed } from "../../api/serverApi/feed";
import {
  deleteFileBrowserFolder,
  deleteFileBrowserFolderFile,
  deleteFileBrowserFolderLinkFile,
} from "../../api/serverApi/filebrowser";
import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types";
import type { State } from "./state";

export const deleteSelectedPaths = (myID: string): Thunk<State> => {
  return async (dispatch, getClass) => {
    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }

    const { selectedPaths } = me;
    console.info(
      "cart.deleteSelectedPaths: to loop selectedPaths:",
      selectedPaths.length,
    );
    await Promise.all(
      selectedPaths.map(async (eachSelected) => {
        if (eachSelected.type === "feed") {
          const errmsg = await deleteSelectedFeed(eachSelected.rawData as Feed);
          if (errmsg) {
            dispatch(setData<State>(myID, { error: errmsg }));
          }
        } else if (eachSelected.type === "folder") {
          const errmsg = await deleteSelectedFolder(
            eachSelected.rawData as FileBrowserFolder,
          );
          if (errmsg) {
            dispatch(setData<State>(myID, { error: errmsg }));
          }
        } else if (eachSelected.type === "file") {
          const errmsg = await deleteSelectedFile(
            eachSelected.rawData as FileBrowserFolderFile,
          );
          if (errmsg) {
            dispatch(setData<State>(myID, { error: errmsg }));
          }
        } else {
          const errmsg = await deleteSelectedLinkFile(
            eachSelected.rawData as FileBrowserFolderLinkFile,
          );
          if (errmsg) {
            dispatch(setData<State>(myID, { error: errmsg }));
          }
        }
      }),
    );
  };
};

const deleteSelectedFeed = async (feed: Feed) => {
  const { status: _status, data: _data, errmsg } = await deleteFeed(feed.id);
  return errmsg;
};

const deleteSelectedFolder = async (folder: FileBrowserFolder) => {
  const {
    status: _status,
    data: _data,
    errmsg,
  } = await deleteFileBrowserFolder(folder.id);
  return errmsg;
};

const deleteSelectedFile = async (theFile: FileBrowserFolderFile) => {
  const {
    status: _status,
    data: _data,
    errmsg,
  } = await deleteFileBrowserFolderFile(theFile.id);
  return errmsg;
};

const deleteSelectedLinkFile = async (theFile: FileBrowserFolderLinkFile) => {
  const {
    status: _status,
    data: _data,
    errmsg,
  } = await deleteFileBrowserFolderLinkFile(theFile.id);
  return errmsg;
};

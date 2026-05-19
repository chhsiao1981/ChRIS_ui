import {
  init as _init,
  getDefaultID,
  type State as rState,
  setData,
  type Thunk,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type { FileBrowserFolderFile, List } from "../api/types";
import type {
  FileBrowserFolder,
  FileBrowserFolderLinkFile,
} from "../api/types/fileBrowser";
import type { Err } from "../types";
import type * as DoDrawer from "./drawer";
import type { FileBrowserBreadCrumb } from "./types";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

export const myClass = "chris-ui/explorer";

export interface State extends rState {
  path: string;
  breadcrumbs: FileBrowserBreadCrumb[];
  selectedFile?: FileBrowserFolderFile;
  fileList: List<FileBrowserFolderFile>;
  linkFileList: List<FileBrowserFolderLinkFile>;
  subFolderList: List<FileBrowserFolder>;
  isLoading: boolean;
  error?: Err;
}

export const defaultState: State = {
  path: "",
  breadcrumbs: [],
  isLoading: false,
  fileList: { results: [], count: 0 },
  linkFileList: { results: [], count: 0 },
  subFolderList: { results: [], count: 0 },
};

export const init = (): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const setSelectedFile = (
  myID: string,
  theFile: FileBrowserFolderFile,
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedFile: theFile }));

    const [classDrawer, doDrawer] = useDrawer;
    const drawerID = getDefaultID(classDrawer);
    doDrawer.openPreviewPanel(drawerID);
  };
};

export const setSelectedLinkFile = (
  myID: string,
  linkFile: FileBrowserFolderLinkFile,
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>,
): Thunk<State> => {
  return () => {
    // get link-resource
    // if is a path / folder: handleFolderClick
    // else if it is a fname / file: setSelectedFile(linkResource)
    // else: set error.
  };
};

export const setSelectedFolder = (
  myID: string,
  path: string,
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>,
): Thunk<State> => {
  return () => {};
};

export const clearSelectedFile = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(
      setData<State>(myID, {
        selectedFile: undefined,
        files: [],
        linkFiles: [],
        subFolders: [],
      }),
    );
  };
};

export const loadMore = (myID: string): Thunk<State> => {
  return () => {};
};

import type { State as rState } from "@chhsiao1981/use-thunk";

import type {
  CartSelection,
  DownloadStatusMap,
  FileUploadMap,
  FolderUploadMap,
} from "../types";

export interface State extends rState {
  currentLayout: string;
  selectedPaths: CartSelection[];
  openCart: boolean;
  folderDownloadStatus: DownloadStatusMap;
  fileDownloadStatus: DownloadStatusMap;
  folderUploadStatus: FolderUploadMap;
  fileUploadStatus: FileUploadMap;

  error?: string;
}

export const defaultState: State = {
  currentLayout: "list",
  selectedPaths: [],
  openCart: false,
  folderDownloadStatus: {},
  fileDownloadStatus: {},
  folderUploadStatus: {},
  fileUploadStatus: {},
};

import type { State as rState } from "@chhsiao1981/use-thunk";

import type {
  CartSelectionPayload,
  DownloadStatus,
  FileUpload,
  FolderUpload,
} from "../types";

export interface State extends rState {
  currentLayout: string;
  selectedPaths: CartSelectionPayload[];
  openCart: boolean;
  folderDownloadStatus: DownloadStatus;
  fileDownloadStatus: DownloadStatus;
  folderUploadStatus: FolderUpload;
  fileUploadStatus: FileUpload;
}

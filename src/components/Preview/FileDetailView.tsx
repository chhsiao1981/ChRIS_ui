import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { fileViewerMap, getFileExtension } from "../../api/model";
import type { FileBrowserFolderFile } from "../../api/types";
import type * as DoUser from "../../reducers/user";
import ViewerDisplay from "./displays/ViewerDisplay";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  selectedFile?: FileBrowserFolderFile;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  isHide?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { selectedFile, preview, isHide, useUser } = props;
  let viewerName = "";
  if (selectedFile) {
    const fileType = getFileExtension(selectedFile.fname);
    if (fileType && fileViewerMap[fileType]) {
      viewerName = fileViewerMap[fileType];
    } else {
      viewerName = "CatchallDisplay";
    }
  }

  console.info("FileDetailView: isHide:", isHide);

  return (
    <ViewerDisplay
      preview={preview}
      viewerName={viewerName}
      selectedFile={selectedFile}
      isHide={isHide}
      useUser={useUser}
    />
  );
};

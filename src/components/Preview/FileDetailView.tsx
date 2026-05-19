import { Label, Text } from "@patternfly/react-core";
import { fileViewerMap, getFileExtension } from "../../api/model";
import type { FileBrowserFolderFile, PACSFile } from "../../api/types";
import ViewerDisplay from "./displays/ViewerDisplay";

type Props = {
  selectedFile?: FileBrowserFolderFile | PACSFile;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  isHide?: boolean;
};

export default (props: Props) => {
  const { selectedFile, preview, isHide } = props;
  let viewerName = "";
  if (selectedFile) {
    const fileType = getFileExtension(selectedFile.fname);
    if (fileType && fileViewerMap[fileType]) {
      viewerName = fileViewerMap[fileType];
    } else {
      viewerName = "CatchallDisplay";
    }
  }

  const errorComponent = (err?: string) => (
    <Label color="red">
      <Text>{err ?? "Error. Refresh or try again."}</Text>
    </Label>
  );

  console.info("FileDetailView: isHide:", isHide);

  return (
    <ViewerDisplay
      preview={preview}
      viewerName={viewerName}
      selectedFile={selectedFile}
      isHide={isHide}
    />
  );
};

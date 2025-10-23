import { getFileExtension } from "../../../api/serverApi";
import { Alert } from "../../Antd";
import type { DisplayProps } from "./types";

export default (props: DisplayProps) => {
  const { selectedFile, isHide } = props;
  const extension = getFileExtension(selectedFile?.fname || "");
  if (isHide) {
    return <div style={{ display: "none" }}></div>;
  }

  return (
    <Alert
      type="info"
      description={`No preview available for the filetype ${extension}`}
    />
  );
};

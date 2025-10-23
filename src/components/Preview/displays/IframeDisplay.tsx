import { type CSSProperties, Fragment, useEffect, useState } from "react";
import { getFileExtension } from "../../../api/model";
import { getFileBlob } from "../../../api/serverApi";
import type { DisplayProps } from "./types";

export default (props: DisplayProps) => {
  const { selectedFile, isHide } = props;
  const [url, setURL] = useState<string>("");

  console.info(
    "IframDisplay: isHide:",
    isHide,
    "selectedFile:",
    selectedFile,
    "url:",
    url,
  );

  useEffect(() => {
    if (isHide) {
      return;
    }

    if (!selectedFile) {
      return;
    }

    const constructedURL = { url: "" };
    const constructURL = async () => {
      const fileType = getFileExtension(selectedFile.fname);
      const blob = await getFileBlob(selectedFile);
      if (!blob) {
        return;
      }

      const theType = fileType === "html" ? "text/html" : "";
      constructedURL.url = URL.createObjectURL(
        new Blob([blob], { type: theType }),
      );
      setURL(constructedURL.url);
    };

    constructURL();
    return () => {
      if (!constructedURL.url) {
        return;
      }
      URL.revokeObjectURL(constructedURL.url);
    };
  }, [selectedFile, isHide]);

  const style: CSSProperties = {};
  if (isHide) {
    style.display = "none";
  }

  return (
    <Fragment>
      <div className="iframe-container" style={style}>
        <iframe
          id="myframe"
          key={selectedFile?.fname}
          src={url}
          width="100%"
          height="100%"
          title="File Display"
        />
      </div>
    </Fragment>
  );
};

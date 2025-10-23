import { type CSSProperties, useEffect, useState } from "react";
import { getFileBlob } from "../../../api/serverApi";
import type { DisplayProps } from "./types";

export default (props: DisplayProps) => {
  const { selectedFile, isHide } = props;
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (isHide) {
      return;
    }

    const constructedURL = { url: "" };
    const constructURL = async () => {
      if (!selectedFile) return;
      const blob = await getFileBlob(selectedFile);
      if (!blob) {
        return;
      }
      const objectUrl = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      constructedURL.url = objectUrl;
      setUrl(objectUrl);
    };
    constructURL();

    return () => {
      if (!constructedURL.url) {
        return;
      }
      window.URL.revokeObjectURL(constructedURL.url);
    };
  }, [selectedFile, isHide]);

  const style: CSSProperties = {};
  if (isHide) {
    style.display = "none";
  }

  return (
    <div className="iframe-container" style={style}>
      <iframe
        key={selectedFile?.fname}
        src={url}
        width="100%"
        height="100%"
        title="PDF Display"
      />
    </div>
  );
};

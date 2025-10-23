import { type CSSProperties, useEffect, useState } from "react";
import { getFileBlob } from "../../../api/serverApi";
import type { DisplayProps } from "./types";

export default (props: DisplayProps) => {
  const { selectedFile, isHide } = props;
  const [url, setUrl] = useState<string>("");
  const [sourceType, setSourceType] = useState<string>("");

  useEffect(() => {
    if (isHide) {
      return;
    }
    if (!selectedFile) {
      return;
    }

    const constructedURL = { url: "" };
    const constructURL = async () => {
      const blob = await getFileBlob(selectedFile);
      if (!blob) {
        return;
      }

      const objectUrl = window.URL.createObjectURL(
        new Blob([blob], { type: blob.type }),
      );
      setUrl(objectUrl);
      constructedURL.url = objectUrl;
      setSourceType(blob.type);
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
    // biome-ignore lint/a11y/useMediaCaption: jsx
    <video controls width="90%" height="90%" style={style}>
      <source src={url} type={sourceType} />
      {/* Fallback message for browsers that do not support video playback */}
      Your browser does not support the video tag.
    </video>
  );
};

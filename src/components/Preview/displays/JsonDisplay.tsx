import ReactJSON from "@microlink/react-json-view";
import { Text } from "@patternfly/react-core";
import { type CSSProperties, useContext, useEffect, useState } from "react";
import { getFileBlob } from "../../../api/serverApi";
import { ThemeContext } from "../../DarkTheme/useTheme";
import type { DisplayProps } from "./types";

export default (props: DisplayProps) => {
  const isDarkTheme = useContext(ThemeContext);
  const [blobText, setBlobText] = useState({});
  const { selectedFile, isHide } = props;

  useEffect(() => {
    if (isHide) {
      return;
    }
    if (!selectedFile) {
      return;
    }

    (async () => {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        setBlobText(JSON.parse(blobText));
      });
      const blob = await getFileBlob(selectedFile);
      if (!blob) {
        return;
      }
      reader.readAsText(blob);
    })();
  }, [selectedFile, isHide]);

  const isHideJSON = isHide || !blobText;
  const isHideText = isHide || blobText;

  const jsonStyle: CSSProperties = {};
  if (isHideJSON) {
    jsonStyle.display = "none";
  }
  const textStyle: CSSProperties = {};
  if (isHideText) {
    textStyle.display = "none";
  }

  return (
    <>
      <ReactJSON
        theme={isDarkTheme ? "grayscale" : "tomorrow"}
        name={false}
        displayDataTypes={false}
        src={blobText}
        displayObjectSize={false}
        collapsed={false}
        style={jsonStyle}
      />
      <Text component="p" style={textStyle}>
        Could not load json payload at the moment....
      </Text>
    </>
  );
};

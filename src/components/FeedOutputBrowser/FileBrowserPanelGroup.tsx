import { Grid } from "@patternfly/react-core";
import { PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FileDetailPanel from "../Feed/FileDetailPanel";
import FileBrowserPanel from "./FileBrowserPanel";
import styles from "./FileBrowserPanelGroup.module.css";

type Props = {
  isHide?: boolean;
};

export default (props: Props) => {
  const { isHide } = props;

  const className = isHide ? "hide" : styles.root;

  return (
    <Grid hasGutter className={className}>
      <PanelGroup autoSaveId="conditional" direction="horizontal">
        <FileBrowserPanel />

        <PanelResizeHandle className="ResizeHandle" />

        <FileDetailPanel />
      </PanelGroup>
    </Grid>
  );
};

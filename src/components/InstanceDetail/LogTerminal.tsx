import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { LogViewer, LogViewerSearch } from "@patternfly/react-log-viewer";
import styles from "./LogTerminal.module.css";

type Props = {
  text: string;
  isHide: boolean;
};

export default (props: Props) => {
  const { text, isHide } = props;
  const className = isHide ? styles.hide : styles.root;

  return (
    <div className={className}>
      <LogViewer
        /* Provide the log text (could be text or data.data, etc.) */
        data={text}
        /* Let user toggle wrap text via the checkbox */

        /* Hide line numbers if desired */
        hasLineNumbers={true}
        /* Optionally set a fixed or relative height */

        /* Provide a custom toolbar with PatternFly controls */
        toolbar={
          <Toolbar>
            <ToolbarContent>
              {/* 2) Built-in LogViewerSearch for searching logs */}
              <ToolbarItem>
                <LogViewerSearch placeholder="Search" minSearchChars={1} />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        }
      />
    </div>
  );
};

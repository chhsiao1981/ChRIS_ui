import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Button, Tooltip } from "@patternfly/react-core";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { ClipboardCopyContainer } from "../Common";
import FileBrowserBreadcrumb from "./FileBrowserBreadcrumb";
import styles from "./FileBrowserHeader.module.css";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;

export default () => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [classPluginInstance, _doPluginInstance] = usePluginInstance;
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance } = pluginInstance;
  const rootPath = selectedInstance?.output_path;

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classExplorer, doExplorer] = useExplorer;
  const explorerID = getDefaultID(classExplorer);
  const explorer = getState(classExplorer) || DoExplorer.defaultState;

  const { path: currentPath, breadcrumbs } = explorer;

  const onClickRootPath = (rootPath?: string) => {
    if (!rootPath) {
      return;
    }
    doExplorer.setSelectedFolder(explorerID, rootPath, useDrawer);
  };

  const classNameRootPath =
    currentPath !== rootPath ? "file-browser-path-button" : "hide";

  return (
    <div className={styles.header}>
      <div className={styles["header-row"]}>
        <div className={styles.navigation}>
          <div className={styles["breadcrumb-popover"]}>
            <div className={styles["breadcrumb-row"]}>
              <ClipboardCopyContainer path={currentPath} />
              <FileBrowserBreadcrumb breadcrumbs={breadcrumbs} />
            </div>
          </div>

          <Tooltip content="Return to the instance's root directory">
            <Button
              onClick={() => onClickRootPath(rootPath)}
              variant="link"
              className={classNameRootPath}
            >
              <span className={styles.label}>Go to root</span>
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
